import {
    Mic,
    Volume2,
    MessageCircle,
    VolumeX,
    MicOff,
    Phone,
    Video,
    VideoOff,
} from "lucide-react";

const Controls = ({
    callType,
    endCall,
    mic,
    onToggleMic,
    camera,
    onToggleCamera,
}) => {
    return (
        <div className='py-6 px-4'>
            <div className='flex justify-between items-center max-w-md mx-auto border py-3 px-4 rounded-full bg-zinc-100/80 border-zinc-300 dark:bg-zinc-950/60 dark:border-zinc-800'>
                {/* <button
                    // onClick={() => setSpeaker((prev) => !prev)}
                    className='flex flex-col items-center gap-1'
                >
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition dark:bg-zinc-900 dark:text-white bg-white text-black`}
                    >
                        {true ? (
                            <Volume2 size={22} />
                        ) : (
                            <VolumeX size={22} />
                        )}
                    </div>
                </button> */}

                <button
                    onClick={onToggleMic}
                    className='flex flex-col items-center gap-1'
                >
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition dark:bg-zinc-900 dark:text-white bg-white text-black`}
                    >
                        {mic ? <Mic size={22} /> : <MicOff size={22} />}
                    </div>
                </button>
                {callType === "video" && (
                    <button
                        onClick={onToggleCamera}
                        className='flex flex-col items-center gap-1'
                    >
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition dark:bg-zinc-900 dark:text-white bg-white text-black`}
                        >
                            {camera ? <Video size={22} /> : <VideoOff size={22} />}
                        </div>
                    </button>
                )}
                <button
                    // later i implement the concurrent chat feature by minimize this screen without loosing states
                    className='flex flex-col items-center gap-1'
                >
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition dark:bg-zinc-900 dark:text-white bg-white text-black`}
                    >
                        <MessageCircle size={22} />
                    </div>
                </button>

                <button
                    onClick={endCall}
                    className='flex flex-col items-center gap-1'
                >
                    <div
                        className='w-14 h-14 rounded-full 
                        bg-red-600 text-white flex items-center justify-center 
                        shadow-lg hover:bg-red-700 active:scale-95 transition'
                    >
                        <Phone className='rotate-135' size={26} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Controls;
