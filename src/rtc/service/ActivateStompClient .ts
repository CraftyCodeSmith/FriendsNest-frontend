import { SignalingMessage } from "@/rtc/interface/SignalingMessage";
import { handleSignalingData } from "@/rtc/service/handleSignalingData";
import { IMessage, Client as StompClient } from "@stomp/stompjs";
import { v4 as uuidv4 } from "uuid";
import { IStreamingPageProps } from "../interface/StreamingPage";

export const ActivateStompClient = (
    peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    streamingPageProps: IStreamingPageProps,
    targetId: React.MutableRefObject<string | undefined>,
    stompClientRef: React.MutableRefObject<any>,
    setIds: React.Dispatch<React.SetStateAction<string[]>>
) => {
    const clientId = uuidv4();
    streamingPageProps.myId = clientId; // This could be moved to `useState`
    const websocketUrl = `ws://192.168.1.104:8080/video-websocket?clientId=${clientId}`;

    const client = new StompClient({
        brokerURL: websocketUrl,
        reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
        heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
        heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
        debug: (str) => {
            // console.log("STOMP:", str);
        },

        onConnect: () => {
            console.log("Connected to STOMP server", stompClientRef);
            streamingPageProps.connectionStatus = true;
            stompClientRef.current = client;

            client.subscribe("/topic/client-update", (message) => {
                const updatedSessionMap = JSON.parse(message.body);
                const ids = Object.keys(updatedSessionMap).filter((id) => id !== clientId);
                setIds(ids);
            });

            // Subscribe to receive messages intended for this client
            client.subscribe(`/user/queue/call`, (message: IMessage) => {
                try {
                    const data: SignalingMessage = JSON.parse(message.body);
                    handleSignalingData(data, peerConnectionRef, streamingPageProps, targetId, stompClientRef);
                } catch (err) {
                    console.error("Error parsing signaling data:", err);
                    setError("Error parsing signaling data");
                }
            });

            // Send a connect message to the server
            client.publish({
                destination: "/app/connect",
                body: JSON.stringify({ sender: clientId }),
            });
        },
    });

    client.activate();
};
