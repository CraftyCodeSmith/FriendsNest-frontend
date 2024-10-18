import { useEffect, useRef, useState } from "react";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const StreamingPage = () => {
  const [stompClient, setStompClient] = useState<any>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/signal");

    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe("/topic/calls", (message) => {
        const msg = JSON.parse(message.body);
        handleSignalMessage(msg);
      });
    });

    setStompClient(client);

    return () => {
      if (client) {
        client.disconnect(() => {
          setStompClient(null);
          setPeerConnection(null);
        });
      }
    };
  }, []);

  const getMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalMessage({ type: "candidate", content: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    setPeerConnection(pc);
  };

  const startCall = async () => {
    const localStream = await getMediaStream();
    setupPeerConnection();
    localStream.getTracks().forEach((track) => {
      peerConnection?.addTrack(track, localStream);
    });

    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);
    sendSignalMessage({ type: "offer", content: offer });
  };

  const sendSignalMessage = (message: any) => {
    stompClient?.send("/app/signal", {}, JSON.stringify(message));
  };

  const handleSignalMessage = async (message: any) => {
    switch (message.type) {
      case "offer":
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(message.content)
        );
        const answer = await peerConnection?.createAnswer();
        await peerConnection?.setLocalDescription(answer);
        sendSignalMessage({ type: "answer", content: answer });
        break;

      case "answer":
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(message.content)
        );
        break;

      case "candidate":
        await peerConnection?.addIceCandidate(
          new RTCIceCandidate(message.content)
        );
        break;

      default:
        break;
    }
  };

  return (
    <main className="flex h-full w-full p-3 gap-2">
      <div
        id="testing"
        className="flex items-center justify-center p-3 h-[760px] w-1/2 bg-green-800/60 border-2 rounded-3xl border-green-400/60"
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className="h-full w-full rounded-3xl"
        />
      </div>
      <div className="flex items-center justify-center p-3 h-[760px] w-1/2 bg-green-800/60 backdrop-blur-lg border-2 rounded-3xl border-green-400/60">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full rounded-3xl"
        />
      </div>
      <button
        onClick={startCall}
        className="absolute bottom-5 left-5 bg-blue-500 text-white p-2 rounded"
      >
        Start Call
      </button>
    </main>
  );
};

export default StreamingPage;
