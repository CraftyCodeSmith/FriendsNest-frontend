import { SignalingMessage } from "@/rtc/interface/SignalingMessage";
import { handleSignalingData } from "@/rtc/service/handleSignalingData";
import { sendSignalingData } from "@/rtc/service/sendSignalingData";
import { Client } from "@stomp/stompjs";
import { useRef } from "react";

// interface IPeerConnection {
//     setError: any;
//     // sendSignalingData: (
//     //     stompClientRef: Client | null,
//     //     data: Partial<SignalingMessage>,
//     //     setError: any,
//     //     ownClientId?: string,
//     //     targetClientId?: string,) => void,
//     stompClientRef,
//     ownClientId: string,
//     targetClientId: string,

// }

export const usePeerConnection: any = (setError: any,
    stompClientRef: any, ownClientId: any, targetClientId: any) => {
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const makertc = async () => {
        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                // Add TURN servers here if needed
            ],
        };

        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;
        console.log(
            "RTCPeerConnection created with configuration:",
            configuration
        );

        // Handle ICE candidates
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                console.log("ICE Candidate found:", event.candidate);
                sendSignalingData(stompClientRef, {
                    type: "ice-candidate",
                    candidate: event.candidate,
                }, setError, ownClientId, targetClientId);
            }
        };

        // Set remote stream to ref
        pc.ontrack = (event: RTCTrackEvent) => {
            console.log("Remote track received:", event);
            if (remoteVideoRef.current) {
                remoteVideoRef!.current.srcObject = event.streams[0];
                console.log("Remote video stream set");
            }
        };

        // Get user media
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            console.log("User media obtained");
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                console.log("Local video stream set");
            }
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            console.log("Local tracks added to RTCPeerConnection");
        } catch (mediaError) {
            console.error("Error accessing media devices.", mediaError);
            setError("Error accessing media devices");
        }
    };
    makertc();



    const startCall = async () => {
        try {
            const peerConnection = peerConnectionRef.current;
            if (!peerConnection) {
                console.error("PeerConnection is not established");
                setError("PeerConnection is not established");
                return;
            }

            // Create an offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log("Offer created and set as local description");

            // Send the offer to the target client
            sendSignalingData(stompClientRef, { type: "offer", sdp: offer }, setError, ownClientId, targetClientId);
        } catch (error) {
            console.error("Error creating or sending offer:", error);
            setError("Error creating or sending offer");
        }
    };
    return [startCall, localVideoRef, remoteVideoRef, peerConnectionRef]

}