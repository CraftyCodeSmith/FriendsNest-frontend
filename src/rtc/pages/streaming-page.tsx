//* package imports
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";

//* components imports
import RtcSidebar from "../components/rtc-sidebar";
import RtcDynamicVideo from "../components/rtc-dynamic-video";
import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";

interface SignalingMessage {
  type: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string; // Now string
  target?: string; // Now string
}

const StreamingPage: React.FC = () => {
  //* ==========> variables
  let myid: string;

  //* ==========> refs
  const stompClientRef = useRef<Client | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);

  //* ==========> states
  const [error, setError] = useState<string | null>(null);
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [ownClientId, setOwnClientId] = useState<string>("");
  const [targetClientId, setTargetClientId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [targetSessionId, setTargetSessionId] = useState<SignalingMessage>();
  const [isMediaAccessGranted, setIsMediaAccessGranted] =
    useState<boolean>(false);
  const [toastTargetClientId, setToastTargetClientId] = useState<string | null>(
    null
  );

  //* ==========> use-effects
  useEffect(() => {
    if (toastTargetClientId === ownClientId) {
      toast("Incoming call!", { duration: 5000 });
    }

    console.log(error);
  }, [toastTargetClientId, ownClientId]);

  useEffect(() => {
    // Generate the clientId
    const clientId = uuidv4();
    setOwnClientId(clientId);
    myid = clientId;
    console.log("Client ID:", clientId);

    // Include the clientId as a query parameter in the WebSocket URL
    const websocketUrl = `ws://localhost:8080/video-websocket?clientId=${clientId}`;

    // Step 1: Create a STOMP client using native WebSocket with the clientId in the URL
    const client = new Client({
      brokerURL: websocketUrl, // Include clientId in the WebSocket URL
      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
      heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
      debug: (str) => {
        console.log("STOMP:", str);
      },

      onConnect: () => {
        setConnectionStatus(true);
        stompClientRef.current = client;

        client.subscribe("/topic/client-update", (message) => {
          const updatedSessionMap = JSON.parse(message.body);
          console.log("Received updated session map:", updatedSessionMap);

          const ids = Object.keys(updatedSessionMap).filter(
            (id) => id !== myid
          );
          setClientIds(ids);
        });

        // Subscribe to receive messages intended for this client
        client.subscribe(`/user/queue/call`, (message: IMessage) => {
          try {
            const data: SignalingMessage = JSON.parse(message.body);
            setTargetSessionId(data);
            console.log("Received signaling data:", data);
            console.log(targetSessionId);
            handleSignalingData(data);
          } catch (err) {
            console.error("Error parsing signaling data:", err);
            setError("Error parsing signaling data");
          }
        });

        // Send a connect message to the server (Optional if handled during handshake)
        client.publish({
          destination: "/app/connect",
          body: JSON.stringify({ sender: clientId }),
        });
      },
    });

    // Step 2: Activate the client to initiate the connection
    client.activate();

    // RTC setup
    const makertc = async () => {
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here if needed
        ],
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;
      console.log(
        "RTCPeerConnection created with configuration:",
        configuration
      );

      // Handle ICE candidates
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          console.log("ICE Candidate found:", event.candidate);
          sendSignalingData(
            {
              type: "ice-candidate",
              candidate: event.candidate,
            },
            targetClientId
          );
        }
      };

      // Set remote stream to ref
      pc.ontrack = (event: RTCTrackEvent) => {
        console.log("Remote track received:", event);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log("Remote video stream set");
        }
      };

      // Get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("User media obtained");
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("Local video stream set");
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setIsMediaAccessGranted(true);
        console.log("Local tracks added to RTCPeerConnection");
      } catch (mediaError) {
        setError("Error accessing media devices");
        setIsMediaAccessGranted(false);
        console.error("Error accessing media devices.", mediaError);
      }
    };
    makertc();

    // Cleanup on component unmount
    return () => {
      if (client) {
        client.deactivate();
        console.log("WebSocket connection closed");
      }
    };
  }, []);

  //* ==========> handle functions
  const handleSignalingData = async (data: SignalingMessage) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.error("PeerConnection is not established");
        setError("PeerConnection is not established");
        return;
      }

      switch (data.type) {
        case "offer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.sdp!)
          );

          // Set the caller's ID as the target client ID
          setTargetClientId(data.sender || "");

          // Create and send an answer back to the caller
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          sendSignalingData({ type: "answer", sdp: answer }, data.sender || "");

          break;

        case "answer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.sdp!)
          );
          break;

        case "ice-candidate":
          if (data.candidate) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
          break;
      }
    } catch (error) {
      console.error("Error handling signaling data:", error);
    }
  };

  const sendSignalingData = (
    data: Partial<SignalingMessage>,
    targetClientId: string
  ) => {
    try {
      const stompClient = stompClientRef.current;
      if (stompClient && stompClient.connected) {
        // Include sender and target in the message
        const message = {
          ...data,
          sender: ownClientId,
          target: targetClientId,
        };

        stompClient.publish({
          destination: "/app/call",
          body: JSON.stringify(message),
        });

        console.log("Sent signaling data:", message);
      } else {
        console.error("STOMP client is not connected");
        setError("STOMP client is not connected");
      }
    } catch (error) {
      console.error("Error sending signaling data:", error);
      setError("Error sending signaling data");
    }
  };

  // const startCall = async () => {
  //   try {
  //     const peerConnection = peerConnectionRef.current;
  //     if (!peerConnection) {
  //       console.error("PeerConnection is not established");
  //       setError("PeerConnection is not established");
  //       return;
  //     }

  //     // Create an offer
  //     const offer = await peerConnection.createOffer();
  //     await peerConnection.setLocalDescription(offer);
  //     console.log("Offer created and set as local description");

  //     // Send the offer to the target client
  //     sendSignalingData({ type: "offer", sdp: offer }, targetClientId);
  //   } catch (error) {
  //     console.error("Error creating or sending offer:", error);
  //     setError("Error creating or sending offer");
  //   }
  // };

  const startCall = async (
    targetClientId: string,
    showToastForClient: (id: string) => void
  ) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.error("PeerConnection is not established");
        setError("PeerConnection is not established");
        return;
      }

      // Create an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Offer created and set as local description");

      // Send the offer to the target client
      sendSignalingData({ type: "offer", sdp: offer }, targetClientId);

      // Show toast only for the target client
      showToastForClient(targetClientId);
    } catch (error) {
      console.error("Error creating or sending offer:", error);
      setError("Error creating or sending offer");
    }
  };

  const showToastForClient = (targetId: string) => {
    setToastTargetClientId(targetId);
  };

  return (
    <section className="h-screen py-[50px] px-[100px] gap-[30px] flex">
      <RtcSidebar
        clientIds={clientIds}
        startCall={() => startCall(targetClientId, showToastForClient)}
        ownClientId={ownClientId}
        connectionStatus={connectionStatus}
        setTargetClientId={setTargetClientId}
        showToastForClient={showToastForClient}
      />
      <RtcDynamicVideo
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMediaAccessGranted={isMediaAccessGranted}
      />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          style: {
            background: "#252F3F",
            color: "#fff",
            fontFamily: "Roboto, sans-serif",
          },
        }}
      />
    </section>
  );
};

export default StreamingPage;
