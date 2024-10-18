import SockJS from 'sockjs-client';
import Stomp, { Subscription } from 'stompjs';

let stompClient: Stomp.Client | null = null;

type Signal = {
    type: string;
    payload?: any;
    candidate?: RTCIceCandidateInit;
};

export const connectWebSocket = (onMessageReceived: (signal: Signal) => void): void => {
    const socket = new SockJS('http://localhost:8080/wc');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, (frame: any) => { // Change type to 'any'
        console.log('Connected: ' + frame);
        stompClient!.subscribe('/topic/messages', (message: { body: string }) => {
            const signal: Signal = JSON.parse(message.body);
            onMessageReceived(signal);
        });
    });
};

export const sendSignal = (signal: Signal): void => {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/signal', {}, JSON.stringify(signal));
    }
};
