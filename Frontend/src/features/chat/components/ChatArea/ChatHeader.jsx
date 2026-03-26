import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import useChatStore from "@/stores/useChatStore";
import { formatDateTime } from "@/services/utils";
import useCallStore from "@/stores/useCallStore";
import useCall from "@/features/call/hooks/useCall";
import Button from "@/components/ui/Button";

const ChatHeader = () => {
    const { selectedUserId, setSelectedUserId, users } = useChatStore();
    let user = users[selectedUserId];

    const { startCall } = useCall();

    return (
        <div className='fixed w-full top-0 md:static flex items-center justify-between border-none md:rounded-tr-4xl px-4 py-3 shadow-sm dark:bg-zinc-900 bg-white dark:text-white'>
            <div className='flex items-center gap-3'>
                <button
                    onClick={() => setSelectedUserId(null)}
                    className='md:hidden text-lg text-black dark:text-white'
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <img
                    src={user?.avatar?.url}
                    className='w-10 h-10 rounded-full'
                    alt='avatar'
                />
                <div>
                    <p className='font-semibold text-gray-800 dark:text-white'>
                        {user.name}
                    </p>
                    <p className={`text-xs text-gray-600 dark:text-zinc-200`}>
                        {user.isOnline
                            ? "online"
                            : formatDateTime(user.lastSeen)}
                    </p>
                </div>
            </div>
            <div className=' text-gray-500 flex items-center dark:text-white'>
                <Button
                    variant='outline'
                    onClick={() =>
                        startCall({
                            callType: "video",
                            receiverId: selectedUserId,
                        })
                    }
                >
                    <FontAwesomeIcon icon={faVideo} />
                </Button>
                <Button
                    variant='outline'
                    onClick={() =>
                        startCall({
                            callType: "video",
                            receiverId: selectedUserId,
                        })
                    }
                >
                    <FontAwesomeIcon icon={faPhone} />
                </Button>
                <Button variant='outline'>
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </Button>
            </div>
        </div>
    );
};

export default ChatHeader;

// When we click on the video call button we have to update the states in global that we are calling
// in call feature component we trigger the call with the details of global store
