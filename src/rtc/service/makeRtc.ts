import { IStreamingPageProps } from "../interface/StreamingPage";
import { sendSignalingData } from "./sendSignalingData";

export const makertc = async (
    peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>,
    localIceCandidateRef: React.MutableRefObject<RTCIceCandidate | null>,
    localVideoRef: React.MutableRefObject<HTMLVideoElement>,
    remoteVideoRef: React.MutableRefObject<HTMLVideoElement>,
    targetId: React.MutableRefObject<string | undefined>,
    setIsMediaAccessGranted: React.Dispatch<React.SetStateAction<boolean>>,
    stompClientRef: React.MutableRefObject<any>,
    streamingPageProps: IStreamingPageProps
) => {
    const configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    setLocalUserMedia(localVideoRef, setIsMediaAccessGranted, pc);
    setRemoteMedia(pc, remoteVideoRef);

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
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

const setRemoteMedia = (pc: RTCPeerConnection, remoteVideoRef: React.MutableRefObject<HTMLVideoElement>) => {
    pc.ontrack = (event: RTCTrackEvent) => {
        if (event.streams.length > 0) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };
};

const setLocalUserMedia = async (localVideoRef: React.MutableRefObject<HTMLVideoElement>, setIsMediaAccessGranted: React.Dispatch<React.SetStateAction<boolean>>, pc: RTCPeerConnection) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setIsMediaAccessGranted(true);
    } catch (mediaError) {
        setIsMediaAccessGranted(false);
        console.error("Error accessing media devices.", mediaError);
    }
};
