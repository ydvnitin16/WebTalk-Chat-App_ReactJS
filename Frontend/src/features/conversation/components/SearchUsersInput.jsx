import React, { useCallback } from "react";
import useSearchUser from "../hooks/useSearchUser";
import ConversationCard from "./ConversationCard";
import useAuthStore from "@/stores/useAuthStore";
import { Search } from "lucide-react";
import ConversationListSkeleton from "@/components/skeletons/ConversationListSkeleton";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";

const SearchUsersInput = () => {
  const { searchUsername, setSearchUsername, users, loading, error } =
    useSearchUser();

  const { addConversation } = useConversationStore();
  const { addUser } = useMemberStore();
  const { setActiveConversation } = useMessageStore();
  const { currentUser } = useAuthStore();

  const handleNewConversation = useCallback(
    (user) => {
      const tempConversationId = `temp-${Date.now()}`;

      addConversation({
        _id: tempConversationId,
        tempConversationId,
        otherUserId: user._id,
        lastActivity: new Date().toISOString(),
        lastMessage: null,
        unreadCount: 0,
      });

      addUser(user);
      // set cursor
      setActiveConversation(tempConversationId);
      setSearchUsername("");
    },
    [addConversation, addUser, setActiveConversation, setSearchUsername],
  );

  return (
    <div className="p-2 relative">
      {/* Search input */}
      <div className="flex gap-2 items-center w-full px-4 py-2.5 dark:border rounded-full bg-[#F6F5F3] dark:bg-[#1E1E1E] dark:border-[#414141] dark:text-white">
        <Search size={22} className="dark:text-zinc-400" />
        <input
          type="text"
          placeholder="Search users by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className=" text-md w-full focus:outline-none"
        />
      </div>

      {/* Users dropdown */}
      {searchUsername.length > 0 && (
        <div className="absolute top-14 left-0 w-full bg-[#FCFCFC] p-1 rounded-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg max-h-60 overflow-y-auto z-50">
          {loading && (
            <div className="p-2 text-gray-400">
              <ConversationListSkeleton />{" "}
            </div>
          )}

          {!loading && users?.length === 0 && !error && (
            <p className="p-2 text-gray-400">No users found</p>
          )}

          {users &&
            users.map((user) => (
              <ConversationCard
                key={user._id}
                user={user}
                onClick={handleNewConversation}
                currentUserId={currentUser.id}
                isNew={true}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsersInput;
