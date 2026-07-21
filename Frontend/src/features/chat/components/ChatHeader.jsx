import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { formatDateTime, isValidObjectId } from "@/utils/utils";
// import useCall from "@/features/call/hooks/useCall";
import Button from "@/components/ui/Button";
import { useState } from "react";
import ChatHeaderDropdown from "./ChatHeaderDropdown";
import UserProfileModal from "./UserProfileModal";
import { optimizeUrl } from "@/utils/imageOptimization";
import useActiveConversation from "../hooks/useActiveConversation";
import useCallManager from "@/features/call/hooks/useCallManager";
import toast from "react-hot-toast";

const ChatHeader = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { clear, selectedUserId, user, activeConversationId } =
        useActiveConversation();

    const { startCall } = useCallManager();
    return (
        <>
            <div className='fixed w-full top-0 md:static flex items-center justify-between md:rounded-tr-4xl md:px-4 px-1 py-3 md:shadow-sm   md:dark:bg-zinc-950 md:dark:border-zinc-900 md:border-b border-zinc-200  dark:text-white z-10'>
                <div
                    onClick={() => setIsProfileOpen(true)}
                    className='flex items-center gap-3 min-w-0 border rounded-4xl px-4 py-2 border-zinc-300 dark:border-zinc-800/40 bg-white/20 dark:bg-black/40 backdrop-blur-[1px] md:border-none md:p-0'
                >
                    <button
                        onClick={() => {
                            clear();
                        }}
                        className='md:hidden text-lg text-black dark:text-white'
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <img
                        src={optimizeUrl(user?.avatar?.url, "medium")}
                        className='w-10 h-10 rounded-full object-cover'
                        alt='avatar'
                    />
                    <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-gray-800 dark:text-white truncate'>
                            {user.name}
                        </p>
                        <p
                            className={`text-xs text-gray-600 dark:text-zinc-200`}
                        >
                            {user.isOnline
                                ? "online"
                                : user.lastSeen
                                  ? formatDateTime(user.lastSeen)
                                  : ""}
                        </p>
                    </div>
                </div>
                <div className='relative text-gray-700 flex items-center dark:text-white border rounded-4xl p-1 border-zinc-300 dark:border-zinc-800/40 bg-white/20 dark:bg-black/40 backdrop-blur-[1px] md:border-none md:p-0'>
                    <Button
                        variant='outline'
                        onClick={() => {
                            if (isValidObjectId(activeConversationId)) {
                                startCall({
                                    type: "video",
                                    receiverId: selectedUserId,
                                    conversationId: activeConversationId,
                                });
                            } else {
                                toast("Send message first");
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faVideo} />
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() => {
                            if (isValidObjectId(activeConversationId)) {
                                startCall({
                                    type: "audio",
                                    receiverId: selectedUserId,
                                    conversationId: activeConversationId,
                                });
                            } else {
                                toast("Send message first");
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faPhone} />
                    </Button>
                </div>
            </div>
            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </>
    );
};

export default ChatHeader;
