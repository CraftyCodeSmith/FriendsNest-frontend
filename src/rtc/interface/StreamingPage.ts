export interface IStreamingPageProps {
    popup: boolean;
    myId: string | undefined;
    target: string | undefined;
    acceptOrReject: boolean;
    receivedSenderId: string | undefined;
    receivedTargetid: string | undefined;
    connectionStatus: boolean;
}


export const streamingPageProps: IStreamingPageProps = {
    popup: false,
    myId: "",
    target: "",
    acceptOrReject: false,
    receivedSenderId: "",
    receivedTargetid: "",
    connectionStatus: false

};
