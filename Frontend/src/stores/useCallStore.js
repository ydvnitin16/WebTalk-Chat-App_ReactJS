import { create } from "zustand";

export let localStream = { current: null };
export let remoteStream = { current: null };
export let peerConnection = { current: null };
export let localVideoRef = { current: null };
export let remoteVideoRef = { current: null };
export let currentOffer = { current: null };
export let currentAnswer = { current: null };
export let pendingIceCandidates = { current: [] };
export let micState = { current: true };
export let cameraState = { current: true };

const useCallStore = create((set, get) => ({
    call: null,
    /*
    call = {
        id,
        conversation,
        caller,
        receiver,
        type,         // "audio" | "video"
        status,       // "calling" | "ringing", "connected", "rejected", "busy"
        startedAt
    }
    */

    media: {
        mic: true,
        camera: true,
    },

    callHistory: [],

    setCallHistory: (calls) =>
        set({
            callHistory: [...(calls || [])].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            ),
        }),

    prependCallHistory: (calls) =>
        set((state) => {
            const uniqueCalls = new Map();

            [...calls, ...state.callHistory].forEach((call) => {
                uniqueCalls.set(call._id, call);
            });

            return {
                callHistory: Array.from(uniqueCalls.values()).sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                ),
            };
        }),

    setCall: (callData) => set({ call: callData }),

    updateCallStatus: (status) => {
        if (status === "connected") {
            set((state) => ({
                call: { ...state.call, status, startedAt: Date.now() },
            }));
        } else {
            set((state) => ({
                call: { ...state.call, status },
            }));
        }
    },

    syncCallId: (callId) =>
        set((state) => ({ call: { ...state.call, _id: callId } })),

    clearCall: () =>
        set({
            call: null,
            media: {
                localStream: { current: null },
                remoteStream: { current: null },
                peerConnection: { current: null },
                isMuted: false,
                isCameraOn: true,
            },
            signaling: {
                offer: null,
                answer: null,
                iceCandidates: [],
            },
        }),

    setLocalStream: (stream) =>
        set((state) => ({
            media: { ...state.media, localStream: { current: stream } },
        })),

    setRemoteStream: (stream) =>
        set((state) => ({
            media: { ...state.media, remoteStream: { current: stream } },
        })),

    setPeerConnection: (peerConnection) =>
        set((state) => ({
            media: {
                ...state.media,
                peerConnection: { current: peerConnection },
            },
        })),

    toggleMic: () =>
        set((state) => ({
            media: {
                ...state.media,
                mic: !state.media.mic,
            },
        })),

    toggleCamera: () =>
        set((state) => ({
            media: {
                ...state.media,
                camera: !state.media.camera,
            },
        })),
}));

export default useCallStore;
