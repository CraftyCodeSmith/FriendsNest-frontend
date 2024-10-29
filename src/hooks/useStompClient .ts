import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Client as StompClient, IMessage } from "@stomp/stompjs";
import { sendSignalingData } from "@/rtc/service/sendSignalingData";
import { SignalingMessage } from "@/rtc/interface/SignalingMessage";
import { handleSignalingData } from "@/rtc/service/handleSignalingData";
// import { handleSignalingData } from "@/rtc/service/handleSignalingData";


export const useStompClient: any = (peerConnectionRef: any, setError: any, streamingPageProps: any, targetId: any, ownId: any, setOwnClientId: any, setConnectionStatus: any, stompClientRef: any, setClientIds: any) => {
    // const stompClientRef = useRef<StompClient | null>(null);
    // const [ownClientId, setOwnClientId] = useState<string>("");
    // const [connectionStatus, setConnectionStatus] =
    //     useState<string>("DISCONNECTED");
    // const [clientIds, setClientIds] = useState<string[]>([]);
    // const [error, setError] = useState<string | null>(null as string | null);

    // useEffect(() => {
    const clientId = uuidv4();
    setOwnClientId(clientId);
    const websocketUrl = `ws://192.168.1.18:8080/video-websocket?clientId=${clientId}`;
    const client = new StompClient({
        brokerURL: websocketUrl, // Include clientId in the WebSocket URL
        reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
        heartbeatIncoming: 10000, // Heartbeat interval for incoming messages
        heartbeatOutgoing: 10000, // Heartbeat interval for outgoing messages
        debug: (str) => {
            // console.log("STOMP:", str);
        },

        onConnect: () => {
            setConnectionStatus("CONNECTED");
            console.log("Connected to STOMP server", stompClientRef);
            stompClientRef.current = client;

            client.subscribe("/topic/client-update", (message) => {
                const updatedSessionMap = JSON.parse(message.body);
                console.log("Received updated session map:", updatedSessionMap);

                const ids = Object.keys(updatedSessionMap).filter(
                    (id) => id !== clientId
                );
                setClientIds(ids);
            });

            // Subscribe to receive messages intended for this client
            client.subscribe(`/user/queue/call`, (message: IMessage) => {
                try {
                    const data: SignalingMessage = JSON.parse(message.body);
                    // Uncomment this line if you have handleSignalingData implemented
                    handleSignalingData(data, peerConnectionRef, streamingPageProps, targetId, ownId, stompClientRef);
                } catch (err) {
                    console.error("Error parsing signaling data:", err);
                    setError("Error parsing signaling data");
                }
            });

            // Send a connect message to the server (Optional if handled during handshake)
            client.publish({
                destination: "/app/connect",
                body: JSON.stringify({ sender: clientId }),
            });
        },
    });

    // Step 2: Activate the client to initiate the connection
    // client.activate();

    // }, [])


    return [client];
}

