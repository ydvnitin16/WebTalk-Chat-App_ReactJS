import React, { useEffect, useRef } from 'react';
import { socket } from '../../lib/socket.js';
import { peerConnection } from '../../stores/webrtcStores.jsx';
import { remoteStream } from '../../stores/webrtcStores.jsx';
import { localStream } from '../../stores/webrtcStores.jsx';
import { config } from '../../stores/webrtcStores.jsx';
import { UseCallStatus } from '../../stores/UseCallStatus.jsx';

const OutgoingCallModal = ({
    calleeName,
    onCancel,
    localVideoRef,
    remoteVideoRef,
}) => {
    const callStatus = UseCallStatus((state) => state.callStatus);

    useEffect(() => {
        const createVideoCallOffer = async () => {
            localStream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream.current;
            }

            peerConnection.current = new RTCPeerConnection(config);
            remoteStream.current = await new MediaStream();

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
            }

            localStream.current.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream.current);
            });

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

            // SEND ICE-CANDIDATE
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        room: callStatus?.user.id,
                    });
                }
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            console.log('Sending offer...');
            socket.emit('offer', { room: callStatus?.user.id, offer });
        };
        createVideoCallOffer();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full h-full md:w-[90%] md:max-w-3xl md:h-[80%] bg-white dark:bg-zinc-900 rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="p-4 text-center bg-gray-100 dark:bg-zinc-800">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Calling {calleeName}...
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Waiting for response
                    </p>
                </div>

                {/* Video Preview */}
                <div className="flex-1 relative bg-black">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="p-4 flex justify-center bg-gray-100 dark:bg-zinc-800">
                    <button
                        onClick={onCancel}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutgoingCallModal;
