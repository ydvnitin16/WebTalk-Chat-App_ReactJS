import { create } from "zustand";

export let localStream = { current: null };
export let remoteStream = { current: null };
export let peerConnection = { current: null };
export let localVideoRef = { current: null };
export let remoteVideoRef = { current: null };
export let pendingIceCandidates = { current: [] };

const useCallStore = create((set) => ({
    call: null,
    media: {
        mic: true,
        camera: true,
    },

    callHistory: [],

    addCallToHistory: (call) =>
        set((state) => {
            const unique = new Map();
            // new call first
            [call, ...state.callHistory].forEach((c) => {
                const key = c?._id || c?.clientCallId;
                if (!key) return;
                if (!unique.has(String(key))) unique.set(String(key), c);
            });

            return {
                callHistory: Array.from(unique.values()).sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                ),
            };
        }),

    updateCallInHistory: (identifier, updates) =>
        set((state) => ({
            callHistory: state.callHistory
                .map((c) => {
                    const matches =
                        (identifier.callId && String(c._id) === String(identifier.callId)) ||
                        (identifier.clientCallId && String(c.clientCallId) === String(identifier.clientCallId));
                    if (!matches) return c;
                    return { ...c, ...updates };
                })
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        })),

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

    setCall: (call) => set({ call }),

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
        set((state) => ({ call: { ...state.call, callId, _id: callId } })),

    clearCall: () =>
        set({
            call: null,
            media: { mic: true, camera: true },
        }),

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
