import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useRef, useState } from "react";
import { Client as StompClient, IMessage } from "@stomp/stompjs";

interface SignalingMessage {
  type: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string; // Now string
  target?: string; // Now string
}

const StreamingPage: React.FC = () => {
  // Refs with explicit types
  const stompClientRef = useRef<StompClient | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // State variables with correct types
  const [error, setError] = useState<string | null>(null as string | null);
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("DISCONNECTED");

  // Unique client ID
  const [ownClientId, setOwnClientId] = useState<string>("");
  const [targetClientId, setTargetClientId] = useState<string>("");
  const [targetSessionId, setTargetSessionId] = useState<SignalingMessage>();

  let myid: string;

  useEffect(() => {
    // Generate the clientId
    const clientId = uuidv4();
    setOwnClientId(clientId);
    myid = clientId;
    console.log("Client ID:", clientId);

    // Include the clientId as a query parameter in the WebSocket URL
    const websocketUrl = `ws://localhost:8080/video-websocket?clientId=${clientId}`;

    // Step 1: Create a STOMP client using native WebSocket with the clientId in the URL
    const client = new StompClient({
      brokerURL: websocketUrl, // Include clientId in the WebSocket URL
      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
      heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
      debug: (str) => {
        console.log("STOMP:", str);
      },

      onConnect: () => {
        setConnectionStatus("CONNECTED");
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

            // Uncomment this line if you have handleSignalingData implemented
            // handleSignalingData(data);
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
        console.log("Local tracks added to RTCPeerConnection");
      } catch (mediaError) {
        console.error("Error accessing media devices.", mediaError);
        setError("Error accessing media devices");
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

  // const handleSignalingData = async (data: SignalingMessage) => {
  //   try {
  //     const peerConnection = peerConnectionRef.current;
  //     if (!peerConnection) {
  //       console.error("PeerConnection is not established");
  //       setError("PeerConnection is not established");
  //       return;
  //     }

  //     console.log("Handling signaling data:", data);

  //     switch (data.type) {
  //       case "offer":
  //         await peerConnection.setRemoteDescription(
  //           new RTCSessionDescription(data.sdp!)
  //         );
  //         console.log("Remote offer set");

  //         // Create an answer
  //         const answer = await peerConnection.createAnswer();
  //         await peerConnection.setLocalDescription(answer);
  //         console.log("Answer created and set as local description");

  //         // Send the answer back to the caller
  //         if (data.sender) {
  //           sendSignalingData({ type: "answer", sdp: answer }, data.sender);
  //         } else {
  //           console.error("Sender ID is missing in the offer");
  //           setError("Sender ID is missing in the offer");
  //         }
  //         break;

  //       case "answer":
  //         await peerConnection.setRemoteDescription(
  //           new RTCSessionDescription(data.sdp!)
  //         );
  //         console.log("Remote answer set");
  //         break;

  //       case "ice-candidate":
  //         if (data.candidate) {
  //           try {
  //             await peerConnection.addIceCandidate(
  //               new RTCIceCandidate(data.candidate)
  //             );
  //             console.log("ICE candidate added");
  //           } catch (e) {
  //             console.error("Error adding received ICE candidate", e);
  //             setError("Error adding received ICE candidate");
  //           }
  //         }
  //         break;

  //       default:
  //         console.warn("Unknown signaling data type:", data.type);
  //         break;
  //     }
  //   } catch (error) {
  //     console.error("Error in handleSignalingData:", error);
  //     setError("Error in handleSignalingData");
  //   }
  // };

  // const sendSignalingData = (
  //   data: Partial<SignalingMessage>,
  //   targetClientId: string
  // ) => {
  //   try {
  //     const stompClient = stompClientRef.current;
  //     if (stompClient && stompClient.connected) {
  //       // Include sender and target in the message
  //       const message = {
  //         ...data,
  //         sender: ownClientId,
  //         target: targetClientId,
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

  //     //local description set
  //     // Create an offer
  //     const offer = await peerConnection.createOffer();
  //     await peerConnection.setLocalDescription(offer);
  //     // console.log("Offer created and set as local description");

  //     // Send the offer to the target client
  //     sendSignalingData({ type: "offer", sdp: offer }, targetClientId);
  //   } catch (error) {
  //     console.error("Error creating or sending offer:", error);
  //     setError("Error creating or sending offer");
  //   }
  // };

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

  const startCall = async () => {
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
    } catch (error) {
      console.error("Error creating or sending offer:", error);
      setError("Error creating or sending offer");
    }
  };

  return (
    <main className="flex flex-col items-center p-4">
      <div className="bg-gray-100 p-4 w-[600px] text-center rounded-lg">
        <h2 className="text-center pb-3">
          {" "}
          STATUS:{" "}
          {connectionStatus === "DISCONNECTED" ? (
            <span className="text-red-500 font-bold"> {connectionStatus} </span>
          ) : (
            <span className="text-green-700 font-bold">
              {" "}
              {connectionStatus}{" "}
            </span>
          )}
        </h2>
        <h3 className="text-lg pb-3">
          Own Client ID:{" "}
          <span className="text-md text-green-800 font-semibold">
            {" "}
            {ownClientId}{" "}
          </span>
        </h3>
        <h3 className="text-lg">Received Client IDs:</h3>
        <ul>
          {clientIds.map((id, index) => (
            <li key={index} className="text-blue-800 font-bold">
              {id}
            </li>
          ))}
        </ul>
      </div>

      {/* Input to Specify Target Client ID */}
      <div className="flex items-center pt-5 pb-5 gap-3 w-3/4">
        <label className="text-slate-100 bg-black p-2 rounded-md w-[140px]">
          Target ID:
        </label>
        <input
          type="text"
          value={targetClientId}
          onChange={(e) => setTargetClientId(e.target.value)}
          placeholder="Enter Target Client ID"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={startCall}
          disabled={!targetClientId}
          className={`${
            targetClientId
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white p-2 w-[200px] rounded`}
        >
          Start Call
        </button>
      </div>

      {/* Video Streams */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <p className="text-white pb-3">Local Video</p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-64 bg-black"
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-white pb-3">Remote Video</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-64 w-64 bg-black"
          />
        </div>
      </div>
      <p className="bg-red-300 text-red-950 p-5 mt-5 rounded-md">{error}</p>
    </main>
  );
};

export default StreamingPage;
