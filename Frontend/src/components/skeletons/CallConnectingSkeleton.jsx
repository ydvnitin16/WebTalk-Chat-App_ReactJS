import { Phone } from "lucide-react";

const CallConnectingSkeleton = () => {
    return (
        <div className='absolute inset-0 z-100 flex items-center justify-center bg-black/80'>
            <div className='flex flex-col items-center gap-4'>
                <Phone size={50} className="dark:text-white text-black " />
                <p className='text-sm text-zinc-400'>Connecting...</p>
            </div>
        </div>
    );
};
export default CallConnectingSkeleton;
