import { SignalingMessage } from "../interface/SignalingMessage";
import { sendSignalingData } from "./signaling";

export const handleSignalingData = async (data: SignalingMessage, peerConnectionRef: any, setError: any, stompClientRef: any) => {
    try {
        const peerConnection = peerConnectionRef;
        if (!peerConnection) {
            console.error("PeerConnection is not established");
            setError("PeerConnection is not established");
            return;
        }

        console.log("Handling signaling data:", data);

        switch (data.type) {
            case "offer":
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.sdp!)
                );
                console.log("Remote offer set");

                // Create an answer
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                console.log("Answer created and set as local description");

                // Send the answer back to the caller
                if (data.sender) {
                    sendSignalingData(stompClientRef, { type: "answer", sdp: answer }, setError, data.sender, data.target,);
                } else {
                    console.error("Sender ID is missing in the offer");
                    setError("Sender ID is missing in the offer");
                }
                break;

            case "answer":
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.sdp!)
                );
                console.log("Remote answer set");
                break;

            case "ice-candidate":
                if (data.candidate) {
                    try {
                        await peerConnection.addIceCandidate(
                            new RTCIceCandidate(data.candidate)
                        );
                        console.log("ICE candidate added");
                    } catch (e) {
                        console.error("Error adding received ICE candidate", e);
                        setError("Error adding received ICE candidate");
                    }
                }
                break;

            default:
                console.warn("Unknown signaling data type:", data.type);
                break;
        }
    } catch (error) {
        console.error("Error in handleSignalingData:", error);
        setError("Error in handleSignalingData");
    }
};

// if (client) {
//     client.deactivate();
//     console.log("WebSocket connection closed");
// }