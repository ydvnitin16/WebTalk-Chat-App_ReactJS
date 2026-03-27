import { create } from "zustand";

export let localStream = { current: null };
export let remoteStream = { current: null };
export let peerConnection = { current: null };
export let localVideoRef = { current: null };
export let remoteVideoRef = { current: null };
export let currentOffer = { current: null };
export let currentAnswer = { current: null };
export let pendingIceCandidates = { current: [] };

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

    callHistory: [],

    setCallHistory: (calls) => set({ callHistory: calls }),

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

    toggleMute: () =>
        set((state) => ({
            media: {
                ...state.media,
                isMuted: !state.media.isMuted,
            },
        })),

    toggleCamera: () =>
        set((state) => ({
            media: {
                ...state.media,
                isCameraOn: !state.media.isCameraOn,
            },
        })),
}));

export default useCallStore;
