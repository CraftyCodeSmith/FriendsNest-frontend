//* package imports
import { Toaster } from "react-hot-toast";

//* components imports
import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import RtcDynamicVideo from "../components/rtc-dynamic-video";
import RtcSidebar from "../components/rtc-sidebar";
import { streamingPageProps } from "../interface/StreamingPage";
import { ActivateStompClient } from "../service/ActivateStompClient ";
import { makertc } from "../service/makeRtc";
import { showToast } from "../service/showToast";
import { startCall } from "../service/startCall";
interface SignalingMessage {
  type: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string; // Now string
  target?: string; // Now string
}

const StreamingPage: React.FC = () => {
  //* ==========> refs
  const localIceCandidateRef = useRef<any>(null);
  const targetId = useRef<string | undefined>("");
  const stompClientRef = useRef<Client | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  //* ==========> states
  const [error, setError] = useState<string | null>(null);
  const [toasttargetId, setToasttargetId] = useState<string | null>(null);
  const [isMediaAccessGranted, setIsMediaAccessGranted] =
    useState<boolean>(false);
  const [ids, setIds] = useState<string[]>([]);

  //* ==========> use-effects
  showToast(peerConnectionRef, streamingPageProps, targetId, stompClientRef);
  useEffect(() => {
    if (streamingPageProps.myId == "") {
      ActivateStompClient(
        peerConnectionRef,
        setError,
        streamingPageProps,
        targetId,
        stompClientRef,
        setIds
      );

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
    } // return () => {
    //   if (client) {
    //     client.deactivate();
    //     console.log("WebSocket connection closed");
    //   }
    // };
  }, []);

  const showToastForClient = (targetId: string) => {
    setToasttargetId(targetId);
  };

  return (
    <section className="h-screen py-[50px] px-[100px] gap-[30px] flex">
      <RtcSidebar
        streamingPageProps={streamingPageProps}
        startCall={() =>
          startCall(
            peerConnectionRef,
            streamingPageProps,
            targetId,
            stompClientRef,
            setToasttargetId
          )
        }
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
