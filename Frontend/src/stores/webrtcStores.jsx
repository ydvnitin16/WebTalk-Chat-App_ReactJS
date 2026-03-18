// webrtcStore.js

export const peerConnection = { current: null };
export const localStream = { current: null };
export const remoteStream = { current: null };

export let config = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
};