import useAuthStore from "@/stores/useAuthStore";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import useMessageStore from "@/stores/useMessageStore";

const useActiveConversation = () => {
  const { activeConversationId, clear } = useMessageStore();
  const conversation = useConversationStore((state) =>
    state.getById(activeConversationId),
  );
  const { users } = useMemberStore();
  const { currentUser } = useAuthStore();
  const selectedUserId = conversation.otherUserId;
  const user = users[selectedUserId] || {};

  return {
    activeConversationId,
    conversation,
    clear,
    users,
    currentUser,
    selectedUserId,
    user,
  };
};

export default useActiveConversation;
