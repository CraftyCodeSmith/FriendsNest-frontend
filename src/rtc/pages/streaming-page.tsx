import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useRef, useState } from "react";
import { Client as StompClient, IMessage } from "@stomp/stompjs";

type ClientObject = {
  [key: string]: string;
};

// Define the structure of signaling m9e9b0b1e-91b4-437f-b009-aa719e8618ecessages
interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string;
  target?: string;
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
    useState<string>("Disconnected");

  // Unique client ID
  const [ownClientId, setOwnClientId] = useState<string>("");
  const [targetClientId, setTargetClientId] = useState<string>("");
  useEffect(() => {
    console.log(`targetClientId:${targetClientId}`);
  }, [targetClientId]);
  useEffect(() => {
    // Step 1: Create a STOMP client using native WebSocket
    const client = new StompClient({
      brokerURL: "ws://localhost:8080/video-websocket", // Native WebSocket URL
      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
      heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
      debug: (str) => {
        // console.log("STOMP:", str);
      },

      onConnect: (frame) => {
        // console.log("Connected to WebSocket:", frame);
        setConnectionStatus("Connected");
        stompClientRef.current = client;

        client.subscribe("/topic/client-update", (message) => {
          const updatedSessionMap = JSON.parse(message.body);
          console.log("Received updated session map:", updatedSessionMap);

          const ids = Object.keys(updatedSessionMap)
            .map((key) => {
              const parsedKey = JSON.parse(key);
              return parsedKey.clientId;
            })
            .filter((id) => id !== ownClientId);

          setClientIds(ids);
        });

        // Subscribe to receive messages intended for this client
        client.subscribe(`/topic/call`, (message: any) => {
          try {
            const data: SignalingMessage = JSON.parse(
              JSON.stringify(message.body)
            );
            console.log("Received signaling data:", data);

            // handleSignalingData(data);
          } catch (err) {
            console.error("Error parsing signaling data:", err);
            setError("Error parsing signaling data");
          }
        });
        // Send a connect message to the server
        const clientId = uuidv4();
        setOwnClientId(clientId);
        console.log("Client ID:", clientId);
        // const clientId = "scissoring-with-tarun"; // Replace with your actual client ID
        client.publish({
          destination: "/app/connect",
          body: JSON.stringify({ clientId }),
        });
      },
    });

    // Step 2: Activate the client to initiate the connection
    client.activate();

    // rtc description ***********************************************************************************************************
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

      //exchanging the ice candidate ************************************************************************************************
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

      //setting the remote stream to ref******************************************************************************************
      pc.ontrack = (event: RTCTrackEvent) => {
        console.log("Remote track received:", event);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log("Remote video stream set");
        }
      };
      //************************************************************************************************* */
      //setting the local media**********************************************************************
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
      //************************************************************************************************* */
    };
    makertc();
    // Step 3: Cleanup on component unmount
    return () => {
      if (client) {
        client.deactivate();
        // console.log("WebSocket connection closed");
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
          sender: { clientId: ownClientId },
          target: { clientId: targetClientId },
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

  /**
   * Initiate the call by creating an SDP offer
   */
  const startCall = async () => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.error("PeerConnection is not established");
        setError("PeerConnection is not established");
        return;
      }

      //local description set
      // Create an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      // console.log("Offer created and set as local description");

      // Send the offer to the target client
      sendSignalingData({ type: "offer", sdp: offer }, targetClientId);
    } catch (error) {
      console.error("Error creating or sending offer:", error);
      setError("Error creating or sending offer");
    }
  };

  return (
    <main className="flex flex-col items-center p-4">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2>
          {" "}
          Connection Status:{" "}
          <span className="text-green-500"> {connectionStatus} </span>
        </h2>
        <h3>Own Client ID: {ownClientId}</h3>
        <h3>Received Client IDs:</h3>
        <ul>
          {clientIds.map((id, index) => (
            <li key={index}>{id}</li>
          ))}
        </ul>
      </div>
      {/* Display connection status and errors */}
      <div className="w-full mb-4">
        <p className="text-gray-800">Connection Status: {connectionStatus}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {/* Input to Specify Target Client ID */}
      <div className="mb-4 w-full max-w-md">
        <label className="block text-gray-700 font-semibold mb-2">
          Target Client ID:
        </label>
        <input
          type="text"
          value={targetClientId}
          onChange={(e) => setTargetClientId(e.target.value)}
          placeholder="Enter Target Client ID"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Video Streams */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <p>Local Video</p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-64 bg-black"
          />
        </div>
        <div className="flex flex-col items-center">
          <p>Remote Video</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-64 w-64 bg-black"
          />
        </div>
      </div>

      {/* Call Controls */}
      <div className="mt-4">
        <button
          onClick={startCall}
          disabled={!targetClientId}
          className={`${
            targetClientId
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-6 py-2 rounded`}
        >
          Start Call
        </button>
      </div>
    </main>
  );
};

export default StreamingPage;
