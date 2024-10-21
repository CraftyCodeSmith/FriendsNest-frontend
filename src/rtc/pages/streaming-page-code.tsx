import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client as StompClient, IMessage } from "@stomp/stompjs";

import { v4 as uuidv4 } from "uuid";

// Define the structure of signaling messages
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
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");

  // Unique client ID
  const [ownClientId, setOwnClientId] = useState<string>("");
  const [targetClientId, setTargetClientId] = useState<string>("");

  useEffect(() => {
    // Generate and set own client ID
    const clientId = uuidv4();
    setOwnClientId(clientId);

    // Function to handle cleanup
    const cleanup = () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate(); // Properly disconnect
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        console.log("Closed RTCPeerConnection");
      }
    };

    // Initialize WebSocket and PeerConnection
    const initialize = async () => {
      try {
        // Establish WebSocket connection
        const socket = new SockJS(
          "http://192.168.1.54:8080/app/video-websocket"
        );
        console.log(socket);

        const client = new StompClient({
          webSocketFactory: () => socket,
          debug: (str: string) => {
            console.log("STOMP:", str);
          },
        });
        console.log(client);

        client.onConnect = () => {
          console.log("Connected to WebSocket");
          setConnectionStatus("Connected");
          stompClientRef.current = client;

          // Subscribe to receive messages intended for this client
          // client.subscribe(
          //   `/user/${clientId}/topic/video`,
          //   (message: IMessage) => {
          //     try {
          //       const data: SignalingMessage = JSON.parse(message.body);
          //       console.log("Received signaling data:", data);

          //       handleSignalingData(data);
          //     } catch (err) {
          //       console.error("Error parsing signaling data:", err);
          //       setError("Error parsing signaling data");
          //     }
          //   }
          // );

          console.log("Connected to signaling server");
        };

        // client.publish({
        //   destination: "/app/connect",
        //   body: JSON.stringify({ clientId }),
        // });

        client.onStompError = (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
          setError("Broker reported error");
        };

        client.activate();

        // Create RTCPeerConnection
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

        // Handle remote stream
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
      } catch (e) {
        console.error("Initialization error:", e);
        setError("Initialization error");
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [targetClientId]);

  /**
   * Handle incoming signaling data
   * @param {SignalingMessage} data - Signaling data received from the signaling server
   */
  const handleSignalingData = async (data: SignalingMessage) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.error("PeerConnection is not established");
        setError("PeerConnection is not established");
        return;
      }

      console.log("Handling signaling data:", data);

      switch (data.type) {
        case "offer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.sdp!)
          );
          console.log("Remote offer set");

          // Create an answer
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log("Answer created and set as local description");

          // Send the answer back to the caller
          if (data.sender) {
            sendSignalingData({ type: "answer", sdp: answer }, data.sender);
          } else {
            console.error("Sender ID is missing in the offer");
            setError("Sender ID is missing in the offer");
          }
          break;

        case "answer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.sdp!)
          );
          console.log("Remote answer set");
          break;

        case "ice-candidate":
          if (data.candidate) {
            try {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
              console.log("ICE candidate added");
            } catch (e) {
              console.error("Error adding received ICE candidate", e);
              setError("Error adding received ICE candidate");
            }
          }
          break;

        default:
          console.warn("Unknown signaling data type:", data.type);
          break;
      }
    } catch (error) {
      console.error("Error in handleSignalingData:", error);
      setError("Error in handleSignalingData");
    }
  };

  /**
   * Send signaling data to the target client via the signaling server
   * @param {Partial<SignalingMessage>} data - Signaling data to send
   * @param {string} targetClientId - Unique identifier of the target client
   */
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
      {/* Display connection status and errors */}
      <div className="w-full mb-4">
        <p className="text-gray-800">Connection Status: {connectionStatus}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {/* Display Own Client ID */}
      <div className="mb-4">
        <p className="font-semibold">Your Client ID:</p>
        <p className="text-blue-600">{ownClientId}</p>
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
