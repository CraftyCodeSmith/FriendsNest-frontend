import { Client, IMessage } from "@stomp/stompjs";
import { IStreamingPageProps } from "../interface/StreamingPage";
import { v4 as uuidv4 } from "uuid";
import { SignalingMessage } from "../interface/SignalingMessage";
import { handleSignalingData } from "../service/handleSignalingData";
export const useStompClient = (streamingPageProps: IStreamingPageProps, setownId: any, setConnectionStatus: any, setClientIds: any, stompClientRef: any, peerConnectionRef: any, targetId: any, ownId: string) => {
    const clientId = uuidv4();
    streamingPageProps.myId = clientId;
    setownId(clientId);

    // Include the clientId as a query parameter in the WebSocket URL
    const websocketUrl = `ws://192.168.1.15:8080/video-websocket?clientId=${clientId}`;

    // Step 1: Create a STOMP client using native WebSocket with the clientId in the URL
    const client = new Client({
        brokerURL: websocketUrl, // Include clientId in the WebSocket URL
        reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
        heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
        heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
        debug: (str) => {
            // console.log("STOMP:", str);
        },

        onConnect: () => {
            setConnectionStatus(true);
            stompClientRef.current = client;

            client.subscribe("/topic/client-update", (message) => {
                const updatedSessionMap = JSON.parse(message.body);
                // console.log("Received updated session map:", updatedSessionMap);

                const ids = Object.keys(updatedSessionMap).filter(
                    (id) => id !== streamingPageProps.myId
                );
                setClientIds(ids);
            });

            // Subscribe to receive messages intended for this client
            client.subscribe(`/user/queue/call`, (message: IMessage) => {
                try {
                    const data: SignalingMessage = JSON.parse(message.body);
                    console.log("Received signaling data:", data);
                    handleSignalingData(data, peerConnectionRef, streamingPageProps, targetId, ownId, stompClientRef);
                } catch (err) {
                    console.error("Error parsing signaling data:", err);
                    // setError("Error parsing signaling data");
                }
            });

            // Send a connect message to the server (Optional if handled during handshake)
            client.publish({
                destination: "/app/connect",
                body: JSON.stringify({ sender: clientId }),
            });
        },
    });

    return [client]
}