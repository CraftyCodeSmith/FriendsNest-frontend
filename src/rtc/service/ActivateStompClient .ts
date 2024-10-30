import { SignalingMessage } from "@/rtc/interface/SignalingMessage";
import { handleSignalingData } from "@/rtc/service/handleSignalingData";
import { IMessage, Client as StompClient } from "@stomp/stompjs";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
// import { handleSignalingData } from "@/rtc/service/handleSignalingData";
export const ActivateStompClient: any = (
    peerConnectionRef: any,
    setError: any,
    streamingPageProps: any,
    targetId: any,
    stompClientRef: React.MutableRefObject<any>,
    setIds: React.Dispatch<React.SetStateAction<string[]>>
) => {

    const clientId = uuidv4();
    streamingPageProps.myId = clientId;
    const websocketUrl = `ws://localhost:8080/video-websocket?clientId=${clientId}`;
    const client = new StompClient({
        brokerURL: websocketUrl, // Include clientId in the WebSocket URL
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

                const ids = Object.keys(updatedSessionMap).filter(
                    (id) => id !== clientId
                );
                console.log(ids)
                setIds(ids);
            });

            // Subscribe to receive messages intended for this client
            client.subscribe(`/user/queue/call`, (message: IMessage) => {
                try {
                    const data: SignalingMessage = JSON.parse(message.body);
                    // Uncomment this line if you have handleSignalingData implemented
                    handleSignalingData(data, peerConnectionRef, streamingPageProps, targetId, stompClientRef);
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

    client.activate();
}

