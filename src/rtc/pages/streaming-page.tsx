//* package imports
import { v4 as uuidv4 } from "uuid";
import toast, { Toast, Toaster } from "react-hot-toast";

//* components imports
import RtcSidebar from "../components/rtc-sidebar";
import RtcDynamicVideo from "../components/rtc-dynamic-video";
import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import RtcToast from "../components/rtc-toast";
import { streamingPageProps } from "../interface/StreamingPage";
import { makertc } from "../service/makeRtc";
import { useStompClient } from "@/hooks/useStompClient ";
import { startCall } from "../service/startCall";
import { sendSignalingData } from "../service/sendSignalingData";
import { showToast } from "../service/showToast";
interface SignalingMessage {
  type: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string; // Now string
  target?: string; // Now string
}

const StreamingPage: React.FC = () => {
  //* ==========> variables

  let popup = false;
  let myId: string | undefined = "";
  let target: string | undefined = "";
  let acceptOrReject: boolean = false;
  let receivedSenderId: string | undefined = "";
  let receivedTargetid: string | undefined = "";

  //* ==========> refs
  const localIceCandidateRef = useRef<any>(null);
  const targetId = useRef<string | undefined>("");
  const stompClientRef = useRef<Client | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  //* ==========> states
  const [ownId, setownId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [toasttargetId, setToasttargetId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [isMediaAccessGranted, setIsMediaAccessGranted] =
    useState<boolean>(false);
  const [ownClientId, setOwnClientId] = useState<string>("");
  const [client] = useStompClient(
    peerConnectionRef,
    setError,
    streamingPageProps,
    targetId,
    ownId,
    setOwnClientId,
    setConnectionStatus,
    stompClientRef,
    setClientIds
  );
  // const showToast = async () => {
  //   console.log("receivedTargetid", receivedTargetid, "ownId", ownId);
  //   if (popup && myId == receivedTargetid) {
  //     toast.custom(
  //       (t: Toast) => (
  //         <RtcToast
  //           onConfirm={async () => {
  //             const answer = await peerConnectionRef.current!.createAnswer();
  //             await peerConnectionRef.current!.setLocalDescription(answer);
  //             if (myId == receivedTargetid) {
  //               sendSignalingData(
  //                 { type: "answer", sdp: answer },
  //                 stompClientRef,
  //                 streamingPageProps,
  //                 ownId,
  //                 targetId
  //               );
  //             }

  //             toast.dismiss(t.id);
  //           }}
  //           onClose={() => {
  //             acceptOrReject = false;
  //             toast.dismiss(t.id);
  //           }}
  //         />
  //       ),
  //       {
  //         duration: Infinity,
  //       }
  //     );
  //   }
  // };

  //* ==========> use-effects
  showToast(
    peerConnectionRef,
    streamingPageProps,
    ownId,
    targetId,
    stompClientRef
  );
  useEffect(() => {
    // Generate the clientId
    // const clientId = uuidv4();
    // myId = clientId;
    // setownId(clientId);

    // Include the clientId as a query parameter in the WebSocket URL
    // const websocketUrl = `ws://192.168.1.15:8080/video-websocket?clientId=${clientId}`;

    // Step 1: Create a STOMP client using native WebSocket with the clientId in the URL
    // const client = new Client({
    //   brokerURL: websocketUrl, // Include clientId in the WebSocket URL
    //   reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
    //   heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
    //   heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
    //   debug: (str) => {
    //     // console.log("STOMP:", str);
    //   },

    //   onConnect: () => {
    //     setConnectionStatus(true);
    //     stompClientRef.current = client;

    //     client.subscribe("/topic/client-update", (message) => {
    //       const updatedSessionMap = JSON.parse(message.body);
    //       // console.log("Received updated session map:", updatedSessionMap);

    //       const ids = Object.keys(updatedSessionMap).filter(
    //         (id) => id !== myId
    //       );
    //       setClientIds(ids);
    //     });

    //     // Subscribe to receive messages intended for this client
    //     client.subscribe(`/user/queue/call`, (message: IMessage) => {
    //       try {
    //         const data: SignalingMessage = JSON.parse(message.body);
    //         console.log("Received signaling data:", data);
    //         handleSignalingData(data);
    //       } catch (err) {
    //         console.error("Error parsing signaling data:", err);
    //         setError("Error parsing signaling data");
    //       }
    //     });

    //     // Send a connect message to the server (Optional if handled during handshake)
    //     client.publish({
    //       destination: "/app/connect",
    //       body: JSON.stringify({ sender: clientId }),
    //     });
    //   },
    // });

    // Step 2: Activate the client to initiate the connection
    if (client) client.activate();

    // Step 3: Create a WebRTC peer connection
    // const makertc = async () => {
    //   const configuration: RTCConfiguration = {
    //     iceServers: [
    //       { urls: "stun:stun.l.google.com:19302" },
    //       // Add TURN servers here if needed
    //     ],
    //   };

    //   const pc = new RTCPeerConnection(configuration);
    //   peerConnectionRef.current = pc;

    //   pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    //     if (event.candidate) {
    //       console.log("ICE Candidate found:", event.candidate);
    //       localIceCandidateRef.current = event.candidate;
    //       console.log("1:", target);
    //       if (targetId.current)
    //         sendSignalingData({
    //           type: "ice-candidate",
    //           candidate: event.candidate,
    //         });
    //     }
    //   };

    //   pc.onicegatheringstatechange = () => {
    //     console.log("ICE Gathering State:", pc.iceGatheringState);
    //   };

    //   pc.ontrack = (event: RTCTrackEvent) => {
    //     console.log("Remote track received:", event);

    //     if (!remoteVideoRef.current.srcObject && event.streams.length > 0) {
    //       remoteVideoRef.current.srcObject = event.streams[0];
    //       console.log(
    //         "Remote video stream set",
    //         remoteVideoRef.current!.srcObject,
    //         event.streams
    //       );
    //     }
    //   };

    //   // Get user media
    //   try {
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //       video: true,
    //       audio: true,
    //     });
    //     console.log("User media obtained");
    //     if (localVideoRef.current) {
    //       localVideoRef.current.srcObject = stream;
    //       console.log(
    //         "Local video stream set",
    //         localVideoRef.current.srcObject
    //       );
    //     }
    //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    //     setIsMediaAccessGranted(true);
    //     console.log("Local tracks added to RTCPeerConnection");
    //   } catch (mediaError) {
    //     setError("Error accessing media devices");
    //     setIsMediaAccessGranted(false);
    //     console.error("Error accessing media devices.", mediaError);
    //   }
    // };

    makertc(
      peerConnectionRef,
      localIceCandidateRef,
      localVideoRef,
      remoteVideoRef,
      targetId,
      target,
      setIsMediaAccessGranted,
      stompClientRef,
      streamingPageProps,
      ownId
    );

    // Step 4:  Cleanup on component unmount
    return () => {
      if (client) {
        client.deactivate();
        console.log("WebSocket connection closed");
      }
    };
  }, []);

  //* ==========> handle functions
  // const handleSignalingData = async (data: SignalingMessage) => {
  //   try {
  //     const peerConnection = peerConnectionRef.current;
  //     if (!peerConnection) {
  //       console.error("PeerConnection is not established");
  //       setError("PeerConnection is not established");
  //       return;
  //     }

  //     switch (data.type) {
  //       case "offer":
  //         popup = true;
  //         receivedTargetid = data.target;
  //         receivedSenderId = data.sender;
  //         console.log("receivedTargetid", receivedTargetid, ownId);
  //         targetId.current = data.sender;
  //         showToast();
  //         await peerConnection.setRemoteDescription(
  //           new RTCSessionDescription(data.sdp!)
  //         );

  //         break;

  //       case "answer":
  //         await peerConnection.setRemoteDescription(
  //           new RTCSessionDescription(data.sdp!)
  //         );
  //         break;

  //       case "ice-candidate":
  //         console.log("this will execute");
  //         if (data.candidate) {
  //           await peerConnection.addIceCandidate(
  //             new RTCIceCandidate(data.candidate)
  //           );
  //         }
  //         break;
  //     }
  //   } catch (error) {
  //     console.error("Error handling signaling data:", error);
  //   }
  // };

  // const sendSignalingData = (data: Partial<SignalingMessage>) => {
  //   try {
  //     const stompClient = stompClientRef.current;
  //     if (stompClient && stompClient.connected) {
  //       // Include sender and target in the message
  //       const message = {
  //         ...data,
  //         sender: ownId ? ownId : myId,
  //         target:
  //           targetId?.current?.length! > 0
  //             ? targetId.current
  //             : receivedSenderId,
  //       };

  //       stompClient.publish({
  //         destination: "/app/call",
  //         body: JSON.stringify(message),
  //       });

  //       console.log("Sent signaling data:", message);
  //     } else {
  //       console.error("STOMP client is not connected");
  //       setError("STOMP client is not connected");
  //     }
  //   } catch (error) {
  //     console.error("Error sending signaling data:", error);
  //     setError("Error sending signaling data");
  //   }
  // };

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
  //     console.log("Offer created and set as local description", offer);

  //     // Send the offer to the target client

  //     // if (myId && targetId.current)
  //     sendSignalingData({ type: "offer", sdp: offer });

  //     // Show toast only for the target client
  //     showToastForClient(targetId.current!);
  //   } catch (error) {
  //     console.error("Error creating or sending offer:", error);
  //     setError("Error creating or sending offer");
  //   }
  // };

  const showToastForClient = (targetId: string) => {
    setToasttargetId(targetId);
  };

  return (
    <section className="h-screen py-[50px] px-[100px] gap-[30px] flex">
      <RtcSidebar
        clientIds={clientIds}
        startCall={() =>
          startCall(
            peerConnectionRef,
            streamingPageProps,
            ownId,
            targetId,
            stompClientRef,
            setToasttargetId
          )
        }
        ownId={ownId}
        connectionStatus={connectionStatus}
        targetId={targetId}
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
