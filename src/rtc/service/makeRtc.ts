import { IStreamingPageProps } from "../interface/StreamingPage";
import { sendSignalingData } from "./sendSignalingData";

export const makertc = async (
    peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>,
    localIceCandidateRef: React.MutableRefObject<RTCIceCandidate | null>,
    localVideoRef: React.MutableRefObject<HTMLVideoElement>,
    remoteVideoRef: React.MutableRefObject<HTMLVideoElement>,
    targetId: React.MutableRefObject<string | undefined>,
    setIsMediaAccessGranted: React.Dispatch<React.SetStateAction<boolean>>,
    stompClientRef: React.MutableRefObject<any>, // Specify a more precise type if possible
    streamingPageProps: IStreamingPageProps // Use the defined interface
) => {
    const configuration: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            // Add TURN servers here if needed
        ],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    setLocalUserMedia(localVideoRef, setIsMediaAccessGranted, pc);
    setRemoteMedia(pc, remoteVideoRef);

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
            console.log("ICE Candidate found:", event.candidate);
            localIceCandidateRef.current = event.candidate;
            if (targetId.current)
                sendSignalingData({
                    type: "ice-candidate",
                    candidate: event.candidate,
                }, stompClientRef, streamingPageProps, targetId);
        }
    };

    pc.onicegatheringstatechange = () => {
        console.log("ICE Gathering State:", pc.iceGatheringState);
    };

};

const setRemoteMedia = (pc: RTCPeerConnection, remoteVideoRef: React.MutableRefObject<HTMLVideoElement>,) => {
    pc.ontrack = (event: RTCTrackEvent) => {
        console.log("Remote track received:", event);
        try {
            if (event.streams.length > 0) {
                remoteVideoRef.current.srcObject = event.streams[0];
                console.log(
                    "Remote video stream set",
                    remoteVideoRef.current.srcObject,
                    event.streams
                );
            }
        }
        catch (error) {
            console.log(error)
        }
    };
}
const setLocalUserMedia = async (localVideoRef: React.MutableRefObject<HTMLVideoElement>,
    setIsMediaAccessGranted: React.Dispatch<React.SetStateAction<boolean>>,
    pc: RTCPeerConnection

) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        console.log("User media obtained", localVideoRef);
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            console.log(
                "Local video stream set",
                localVideoRef.current.srcObject
            );
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setIsMediaAccessGranted(true);
        console.log("Local tracks added to RTCPeerConnection");
    } catch (mediaError) {
        //   setError("Error accessing media devices");
        setIsMediaAccessGranted(false);
        console.error("Error accessing media devices.", mediaError);
    }
}