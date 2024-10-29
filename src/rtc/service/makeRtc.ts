import { sendSignalingData } from "./sendSignalingData";

export const makertc = async (peerConnectionRef: any, localIceCandidateRef: any, localVideoRef: any, remoteVideoRef: any, targetId: any, target: any, setIsMediaAccessGranted: any, stompClientRef: any, streamingPageProps: any, ownId: string) => {
    const configuration: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            // Add TURN servers here if needed
        ],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
            console.log("ICE Candidate found:", event.candidate);
            localIceCandidateRef.current = event.candidate;
            console.log("1:", target);
            if (targetId.current)
                sendSignalingData({
                    type: "ice-candidate",
                    candidate: event.candidate,
                }, stompClientRef, streamingPageProps, ownId, targetId);
        }
    };

    pc.onicegatheringstatechange = () => {
        console.log("ICE Gathering State:", pc.iceGatheringState);
    };

    pc.ontrack = (event: RTCTrackEvent) => {
        console.log("Remote track received:", event);

        if (!remoteVideoRef.current.srcObject && event.streams.length > 0) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log(
                "Remote video stream set",
                remoteVideoRef.current!.srcObject,
                event.streams
            );
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
};