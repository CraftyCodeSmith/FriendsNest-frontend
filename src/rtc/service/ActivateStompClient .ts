import { SignalingMessage } from "@/rtc/interface/SignalingMessage";
import { handleSignalingData } from "@/rtc/service/handleSignalingData";
import { IMessage, Client as StompClient } from "@stomp/stompjs";
import { v4 as uuidv4 } from "uuid";
import { IStreamingPageProps } from "../interface/StreamingPage";

// Function to base64-url decode a string (URL-safe)
function base64UrlDecode(base64Url: any) {
    // Replace non-url compatible characters with url-safe alternatives
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the base64 string
    const decoded = atob(base64);

    return decoded;
}

// Function to extract and decode the payload from a JWT
function extractPayload(token: any) {
    const parts = token.split('.');  // JWT is in the format header.payload.signature

    if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
    }

    // Extract the payload (second part of the token)
    const payload = base64UrlDecode(parts[1]);

    // Parse the payload to a JSON object
    const decodedPayload = JSON.parse(payload);

    return decodedPayload;
}

export const ActivateStompClient = (
    peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    streamingPageProps: IStreamingPageProps,
    targetId: React.MutableRefObject<string | undefined>,
    stompClientRef: React.MutableRefObject<any>,
    setIds: React.Dispatch<React.SetStateAction<string[]>>
) => {
    const token = sessionStorage.getItem("authToken");
    const payload = extractPayload(token);
    console.log(payload, "payload")
    const clientId = payload.sub;
    streamingPageProps.myId = clientId; // This could be moved to `useState`

    const websocketUrl = `ws://192.168.1.12:8080/video-websocket?token=${token}`;
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
                console.log(updatedSessionMap)
                const ids = updatedSessionMap.filter((id: string) => id !== clientId);
                // const ids = Object.keys(updatedSessionMap).filter((id) => id !== clientId);
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
