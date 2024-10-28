// import { useState, useEffect, useCallback } from "react";
// import { Client } from "@stomp/stompjs";

// export const useStompClient = () => {
//   const [client, setClient] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const stompClient = new Client({
//       brokerURL: "ws://localhost:8080/video-websocket?clientId=${clientId}",
//       reconnectDelay: 5000,
//       onConnect: () => {
//         setIsConnected(true);
//         stompClient.subscribe("/topic/client-update", (message) => {
//           // Handle client update messages
//           const data = JSON.parse(message.body);
//           console.log("Client Update:", data);
//           // Add any client update handling logic here
//         });
//         stompClient.subscribe("/user/queue/call", (message) => {
//           // Handle incoming call messages
//           const data = JSON.parse(message.body);
//           console.log("Incoming Call:", data);
//           // Add incoming call handling logic here
//         });
//       },
//       onDisconnect: () => setIsConnected(false),
//     });

//     stompClient.activate();
//     setClient(stompClient);

//     return () => {
//       stompClient.deactivate();
//     };
//   }, []);

//   const sendSignalingData = useCallback(
//     (destination, data) => {
//       if (client && isConnected) {
//         client.publish({
//           destination,
//           body: JSON.stringify(data),
//         });
//       }
//     },
//     [client, isConnected]
//   );

//   return { sendSignalingData, isConnected };
// };
