import { create } from "zustand";

const sortByActivity = (conversations = []) =>
  [...conversations].sort(
    (a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0),
  );

const useConversationStore = create((set, get) => ({
  conversations: [],
  isLoading: false,

  setConversations: (conversations = []) => {
    set({
      conversations: sortByActivity(conversations),
    });
  },

  addConversation: (conversation) => {
    set((state) => ({
      conversations: sortByActivity([
        conversation,
        ...state.conversations.filter((c) => c._id !== conversation._id),
      ]),
    }));
  },

  updateConversation: (conversationId, conversation) => {
    const conversations = get().conversations;

    const filteredConversation = conversations.filter(
      (c) =>
        c._id !== conversationId && c.tempConversationId !== conversationId,
    );

    set({
      conversations: sortByActivity([...filteredConversation, conversation]),
    });
  },

  updateLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: sortByActivity(
        state.conversations.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: message,
                lastActivity: message.createdAt,
              }
            : c,
        ),
      ),
    })),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: sortByActivity(
        state.conversations.map((c) =>
          c._id === conversationId
            ? { ...c, unreadCount: c.unreadCount + 1 }
            : c,
        ),
      ),
    })),

  clearUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: sortByActivity(
        state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      ),
    })),

  getById: (conversationId) =>
    get().conversations.find((c) => c._id === conversationId) || null,
}));

export default useConversationStore;
