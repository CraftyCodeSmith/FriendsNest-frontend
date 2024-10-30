import { SignalingMessage } from "../interface/SignalingMessage";
import { IStreamingPageProps } from "../interface/StreamingPage";

export const sendSignalingData = (data: Partial<SignalingMessage>, // Allows any subset of SignalingMessage properties
  stompClientRef: React.MutableRefObject<any>, // Consider specifying the Stomp client type if known
  streamingPageProps: IStreamingPageProps,
  targetId?: React.MutableRefObject<string | undefined> // Optional target ID
) => {
  try {
    const stompClient = stompClientRef.current;
    if (stompClient && stompClient.connected) {
      // Include sender and target in the message
      const message = {
        ...data,
        sender: streamingPageProps.myId,
        target:
          targetId?.current?.length! > 0
            ? targetId!.current
            : streamingPageProps.receivedSenderId,
      };

      stompClient.publish({
        destination: "/app/call",
        body: JSON.stringify(message),
      });

      console.log("Sent signaling data:", message);
    } else {
      console.error("STOMP client is not connected");
      // setError("STOMP client is not connected");
    }
  } catch (error) {
    console.error("Error sending signaling data:", error);
    // setError("Error sending signaling data");
  }
};