export interface SignalingMessage {
    type: string;
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    sender?: string; // Now string
    target?: string; // Now string
}