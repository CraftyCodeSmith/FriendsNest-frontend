import { SignalingMessage } from "../interface/SignalingMessage";
import { IStreamingPageProps } from "../interface/StreamingPage";

export const sendSignalingData = (data: Partial<SignalingMessage>, stompClientRef: any, streamingPageProps: IStreamingPageProps, ownId?: string, targetId?: any) => {
  try {
    const stompClient = stompClientRef.current;
    if (stompClient && stompClient.connected) {
      // Include sender and target in the message
      const message = {
        ...data,
        sender: ownId ? ownId : streamingPageProps.myId,
        target:
          targetId?.current?.length! > 0
            ? targetId.current
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