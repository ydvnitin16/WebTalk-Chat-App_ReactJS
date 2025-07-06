import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore';

const ChatHeader = () => {

    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    const setSelectedUser = UseSelectedUserStore(
        (state) => state.setSelectedUser
    );

    return (
        <div className="flex items-center justify-between p-4 shadow-sm dark:bg-zinc-800 md:dark:bg-zinc-900 dark:text-white">
            <div className="flex items-center gap-3">
                <button
                    className="md:hidden text-black dark:text-white"
                    onClick={() => setSelectedUser(null)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <img
                    src={selectedUser.img}
                    className="w-10 h-10 rounded-full"
                    alt="avatar"
                />
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedUser.name}
                    </p>
                    <p className={`text-xs text-gray-600 dark:text-zinc-200`}>
                        {selectedUser.isOnline
                            ? 'online'
                            : selectedUser.lastSeen}
                    </p>
                </div>
            </div>
            <div className="space-x-6 text-gray-500 flex items-center dark:text-white">
                <button>
                    <FontAwesomeIcon icon={faVideo} />
                </button>
                <button>
                    <FontAwesomeIcon icon={faPhone} />
                </button>
                <button>
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
