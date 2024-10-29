import toast, { Toast } from "react-hot-toast";
import RtcToast from "../components/rtc-toast";
import { IStreamingPageProps } from "../interface/StreamingPage";
import { sendSignalingData } from "./sendSignalingData";

export const showToast = async (
  peerConnectionRef: any,
  streamingPageProps: IStreamingPageProps,
  ownId: string,
  targetId: any,
  stompClientRef: any
) => {
  if (
    streamingPageProps.popup &&
    streamingPageProps.myId == streamingPageProps.receivedTargetid
  ) {
    toast.custom(
      (t: Toast) => (
        <RtcToast
          onConfirm={async () => {
            const answer = await peerConnectionRef.current!.createAnswer();
            await peerConnectionRef.current!.setLocalDescription(answer);
            if (
              streamingPageProps.myId == streamingPageProps.receivedTargetid
            ) {
              sendSignalingData(
                { type: "answer", sdp: answer },
                streamingPageProps,
                stompClientRef,
                ownId,
                targetId
              );
            }

            toast.dismiss(t.id);
          }}
          onClose={() => {
            streamingPageProps.acceptOrReject = false;
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        duration: Infinity,
      }
    );
  }
};
export const showToastForClient = (targetId: string, setToasttargetId: any) => {
  setToasttargetId(targetId);
};
