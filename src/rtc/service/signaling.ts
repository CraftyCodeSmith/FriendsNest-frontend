import { SignalingMessage } from "../interface/SignalingMessage";

export const sendSignalingData = (
    stompClientRef: any,
    data: Partial<SignalingMessage>,
    setError: any,
    ownClientId?: string,
    targetClientId?: string,

) => {
    try {
        const stompClient = stompClientRef.current;
        console.log("StompClient", stompClient);
        console.log("targetClientId", targetClientId);
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