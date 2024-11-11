import { SignalingMessage } from "../interface/SignalingMessage";
import { IStreamingPageProps } from "../interface/StreamingPage";
import { showToast } from "./showToast";

export const handleSignalingData = async (data: SignalingMessage,
    peerConnectionRef: any,
    streamingPageProps: IStreamingPageProps,
    targetId: any,
    stompClientRef: any) => {
    try {
        const peerConnection = peerConnectionRef.current;
        // if (!peerConnection) {
        //     console.error("PeerConnection is not established");
        //     setError("PeerConnection is not established");
        //     return;
        // }

        switch (data.type) {
            case "offer":

                streamingPageProps.popup = true;
                streamingPageProps.receivedTargetid = data.target;
                streamingPageProps.receivedSenderId = data.sender;
                targetId.current = data.sender;

                showToast(peerConnectionRef,
                    streamingPageProps,
                    targetId,
                    stompClientRef);
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.sdp!)
                );

                break;

            case "answer":
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.sdp!)
                );
                break;

            case "ice-candidate":
                console.log("this will execute");
                if (data.candidate) {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                }
                break;
        }
    } catch (error) {
        console.error("Error handling signaling data:", error);
    }
};