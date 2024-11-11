import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import RtcDynamicVideo from "../components/rtc-dynamic-video";
import RtcSidebar from "../components/rtc-sidebar";
import { streamingPageProps } from "../interface/StreamingPage";
import { ActivateStompClient } from "../service/ActivateStompClient ";
import { makertc } from "../service/makeRtc";
import { startCall } from "../service/startCall";

const StreamingPage: React.FC = () => {
  //* ===========> Refs
  const localIceCandidateRef = useRef<RTCIceCandidate | null>(null);
  const targetId = useRef<string | undefined>("");
  const stompClientRef = useRef<Client | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  //* ===========> States
  const [error, setError] = useState<string | null>(null);
  const [toastTargetId, setToastTargetId] = useState<string | null>(null);
  const [isMediaAccessGranted, setIsMediaAccessGranted] =
    useState<boolean>(false);
  const [ids, setIds] = useState<string[]>([]);

  //* ===========> Effects
  useEffect(() => {
    if (streamingPageProps.myId === "") {
      ActivateStompClient(
        peerConnectionRef,
        setError,
        streamingPageProps,
        targetId,
        stompClientRef,
        setIds
      );
    }

    if (localIceCandidateRef.current == null) {
      makertc(
        peerConnectionRef,
        localIceCandidateRef,
        localVideoRef,
        remoteVideoRef,
        targetId,
        setIsMediaAccessGranted,
        stompClientRef,
        streamingPageProps
      );
    }

    // return () => {
    //   // Cleanup on component unmount
    //   if (stompClientRef.current) {
    //     stompClientRef.current.deactivate();
    //     console.log("STOMP connection closed");
    //   }
    //   if (peerConnectionRef.current) {
    //     peerConnectionRef.current.close();
    //     console.log("RTC connection closed");
    //   }
    // };
  }, []);

  const showToastForClient = (targetId: string) => {
    setToastTargetId(targetId);
  };

  return (
    <section className="h-screen py-[50px] px-[100px] gap-[30px] flex">
      <RtcSidebar
        streamingPageProps={streamingPageProps}
        startCall={() => {
          if (
            !streamingPageProps.makeCall &&
            !(
              peerConnectionRef.current &&
              peerConnectionRef.current.iceConnectionState === "connected"
            )
          )
            startCall(
              peerConnectionRef,
              streamingPageProps,
              targetId,
              stompClientRef,
              setToastTargetId
            );
        }}
        targetId={targetId}
        showToastForClient={showToastForClient}
        ids={ids}
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
