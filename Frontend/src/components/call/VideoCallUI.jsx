import React, { useEffect } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
} from "lucide-react"; // icons from lucide-react (install with `npm i lucide-react`)
import { localStream, remoteStream } from "../../stores/webrtcStores";

const VideoCallUI = ({
  calleeName,
  onEndCall,
  onToggleMic,
  onToggleCamera,
  isMicOn,
  isCameraOn,
  localVideoRef,
  remoteVideoRef
}) => {

  useEffect(() => {
    if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
        localVideoRef.current.muted = true;
    }

    if (remoteVideoRef.current && remoteStream.current) {
        remoteVideoRef.current.srcObject = remoteStream.current;
    }
}, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full h-full md:w-[90%] md:max-w-4xl md:h-[85%] bg-black rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col">

        {/* Remote video or "Calling..." */}
        {/* <div className="flex-1 relative bg-white flex items-center justify-center"> */}
          {/* Replace with: <video srcObject={} /> when live */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        {/* </div> */}

        {/* Local video preview (corner) */}
        <div className="absolute bottom-28 right-4 w-28 h-44 rounded-lg overflow-hidden border-2 border-white shadow-md">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Call Controls */}
        <div className="p-4 bg-zinc-900 flex justify-center gap-6">
          {/* Mute / Unmute */}
          <button
            onClick={onToggleMic}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full"
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={onToggleCamera}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full"
          >
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
          >
            <PhoneOff size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default VideoCallUI;
