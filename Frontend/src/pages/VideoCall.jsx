import React, { useEffect, useRef, useState } from 'react';
import { UseCallStatus } from '../stores/UseCallStatus.jsx';
import OutgoingCallModal from '../components/call/OutgoingCallModal.jsx';
import { socket } from '../lib/socket.js';
import {
    peerConnection,
    config,
    localStream,
    remoteStream,
} from '../stores/webrtcStores.jsx';
import IncomingCallModal from '../components/call/IncomingCallModal.jsx';
import VideoCallUI from '../components/call/VideoCallUI.jsx';
import { UseContactStore } from '../stores/UseContactStore.jsx';

const VideoCall = () => {
    const contacts = UseContactStore((state) => state.contacts);
    const [incomingCall, setIncomingCall] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callStatus = UseCallStatus((state) => state.callStatus);
    const setCallStatus = UseCallStatus((state) => state.setCallStatus);

    const remoteDescSet = useRef(false);
    const pendingCandidates = useRef([]);
    const callerIdRef = useRef(null);
    const callerUserRef = useRef(null);

    const cleanupCall = () => {
        // Stop tracks
        localStream.current?.getTracks().forEach((track) => track.stop());
        remoteStream.current?.getTracks().forEach((track) => track.stop());

        // Close connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Cleanup refs
        localStream.current = null;
        remoteStream.current = null;
        remoteDescSet.current = false;
        pendingCandidates.current = [];
        callerIdRef.current = null;
        callerUserRef.current = null;
        window.incomingOffer = null;

        setCallStatus(null);
    };

    // Incoming call listener
    useEffect(() => {
        socket.on('offer', (data) => {
            setIncomingCall(true);
            callerIdRef.current = data.caller;
            callerUserRef.current = contacts.find((cont) => cont._id === data.caller) || null;
            window.incomingOffer = data.offer; // save for onAccept
        });

        return () => {
            socket.off('offer');
        };
    }, [contacts]);

    // ICE candidate handler
    useEffect(() => {
        socket.on('ice-candidate', async (candidate) => {
            if (!candidate || !peerConnection?.current) return;

            const rtcCandidate = new RTCIceCandidate(candidate);
            if (remoteDescSet.current) {
                await peerConnection.current.addIceCandidate(rtcCandidate);
            } else {
                pendingCandidates.current.push(rtcCandidate);
            }
        });

        return () => {
            socket.off('ice-candidate');
        };
    }, []);

    // Handle answer (from callee)
    useEffect(() => {
        socket.on('answer', async (answer) => {
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
            remoteDescSet.current = true;

            for (const candidate of pendingCandidates.current) {
                await peerConnection.current.addIceCandidate(candidate);
            }
            pendingCandidates.current = [];

            setCallStatus('connected');
        });

        return () => {
            socket.off('answer');
        };
    }, []);

    // Handle reject/hangup from remote
    useEffect(() => {
        socket.on('reject', () => {
            setIncomingCall(false);
            cleanupCall();
        });

        return () => {
            socket.off('reject');
        };
    }, []);

    // Accept call handler
    const onAccept = async () => {
        const offer = window.incomingOffer;
        const callerId = callerIdRef.current;
        setIncomingCall(false);

        peerConnection.current = new RTCPeerConnection(config);
        remoteStream.current = await new MediaStream();
        localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        // Attach streams
        if (localVideoRef.current)
            localVideoRef.current.srcObject = localStream.current;
        if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream.current;

        // Add local tracks
        localStream.current
            .getTracks()
            .forEach((track) =>
                peerConnection.current.addTrack(track, localStream.current)
            );

        // Handle remote track
        peerConnection.current.ontrack = (event) => {
            console.log('ontrack fired:', event);

            // Set up the remote stream if not already
            if (!remoteStream.current) {
                remoteStream.current = new MediaStream();
            }

            event.streams[0].getTracks().forEach((track) => {
                if (!remoteStream.current.getTracks().includes(track)) {
                    remoteStream.current.addTrack(track);
                }
            });

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
            }
        };

        // Send ICE candidates
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    room: callerId,
                });
            }
        };

        // Set remote offer
        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
        );
        remoteDescSet.current = true;

        for (const candidate of pendingCandidates.current) {
            await peerConnection.current.addIceCandidate(candidate);
        }
        pendingCandidates.current = [];

        // Create & send answer
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { caller: callerId, answer });

        setCallStatus('connected');
    };

    // Reject handler
    const onReject = () => {
        setIncomingCall(false);
        if (callerIdRef.current) socket.emit('reject', callerIdRef.current);
        cleanupCall();
    };

    // Toggle Mic
    const onToggleMic = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMicOn((prev) => !prev);
        }
    };

    // Toggle Camera
    const onToggleCamera = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsCameraOn((prev) => !prev);
        }
    };

    // End Call
    const onEndCall = () => {
        if (callerIdRef.current) socket.emit('reject', callerIdRef.current);
        cleanupCall();
    };

    const onCanelOutgoingCall = () => {
        const calleeId = callStatus?.user?.id;
        if (calleeId) socket.emit('reject', calleeId);
        cleanupCall();
    };


    // Render based on call state
    if (callStatus?.status === 'connected') {
        return (
            <VideoCallUI
                calleeName={callerUserRef.current?.name || 'User'}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                onEndCall={onEndCall}
                onToggleMic={onToggleMic}
                onToggleCamera={onToggleCamera}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
            />
        );
    }

    if (callStatus?.user && callStatus?.status === 'calling') {
        return (
            <OutgoingCallModal
                calleeName={callStatus.user.name}
                calleeAvatar={callStatus.user.img}
                onCancel={onCanelOutgoingCall}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
            />
        );
    }

    return (
        incomingCall && (
            <IncomingCallModal
                onAccept={onAccept}
                onReject={onReject}
                callerName={callerUserRef.current?.name || 'Unknown'}
                callerAvatar={callerUserRef.current?.profilePic?.url}
            />
        )
    );
};

export default VideoCall;
