import React, { useEffect, useRef, useState } from "react";
import { Client as StompClient } from "@stomp/stompjs";
import { useStompClient } from "@/hooks/useStompClient ";
import { usePeerConnection } from "@/hooks/usePeerConnection";

const StreamingPage: React.FC = () => {
  // Refs with explicit types
  // const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // const stompClientRef = useRef<StompClient | null>(null);

  // State variables with correct types
  const [error, setError] = useState<string | null>(null as string | null);

  // Unique client ID
  const [targetClientId, setTargetClientId] = useState<string>("");

  const [ownClientId, connectionStatus, clientIds, stompClientRef] =
    useStompClient({
      peerConnectionRef,
      setError,
    });
  const [startCall, localVideoRef, remoteVideoRef, peerConnectionRef] =
    usePeerConnection({
      setError,
      stompClientRef,
      ownClientId,
      targetClientId,
    });

  useEffect(() => {
    console.log("localvideo", localVideoRef);
  }, [localVideoRef]);

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
        <h3 className="text-lg"> Received Client IDs: </h3>
        <ul>
          {clientIds.map((id: any, index: any) => (
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
          onChange={(e) => {
            console.log("Target Client ID:", e.target.value);
            setTargetClientId(e.target.value);
          }}
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
          <p className="text-white pb-3"> Local Video </p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-64 bg-black"
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-white pb-3"> Remote Video </p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-64 w-64 bg-black"
          />
        </div>
      </div>
      <div> {/* <Button onClick={handleSignalingData}>Answer</Button> */} </div>
      <p className="bg-red-300 text-red-950 p-5 mt-5 rounded-md"> {error} </p>
    </main>
  );
};

export default StreamingPage;
