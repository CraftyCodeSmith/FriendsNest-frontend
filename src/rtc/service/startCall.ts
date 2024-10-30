import { IStreamingPageProps } from "../interface/StreamingPage";
import { sendSignalingData } from "./sendSignalingData";
import { showToastForClient } from "./showToast";

export const startCall = async (peerConnectionRef: any, streamingPageProps: IStreamingPageProps, targetId: any, stompClientRef: any, setToasttargetId: any) => {
    try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) {
            console.error("PeerConnection is not established");
            // setError("PeerConnection is not established");
            return;
        }

        // Create an offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("Offer created and set as local description", offer);

        // Send the offer to the target client

        // if (myId && targetId.current)
        sendSignalingData({ type: "offer", sdp: offer }, stompClientRef, streamingPageProps, targetId);

        // Show toast only for the target client
        showToastForClient(targetId.current!, setToasttargetId);
    } catch (error) {
        console.error("Error creating or sending offer:", error);
        //   setError("Error creating or sending offer");
    }
};