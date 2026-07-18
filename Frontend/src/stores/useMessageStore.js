import { create } from "zustand";

const sortMessages = (messages = []) =>
  [...messages].sort((a, b) => {
    const timeDiff =
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime();

    if (timeDiff !== 0) return timeDiff;

    return String(a._id || a.tempId || "").localeCompare(
      String(b._id || b.tempId || ""),
    );
  });

const messageKey = (message) => message?._id || message?.tempId;

const mergeMessages = (messages = []) => {
  const merged = new Map();

  messages.filter(Boolean).forEach((message) => {
    const keys = [message._id, message.tempId].filter(Boolean);
    const existing = keys.map((key) => merged.get(key)).find(Boolean);
    const next = { ...(existing || {}), ...message };
    const key = messageKey(next);

    if (key) merged.set(key, next);
    if (next._id) merged.set(next._id, next);
    if (next.tempId) merged.set(next.tempId, next);
  });

  return sortMessages([...new Set(merged.values())]);
};

const useMessageStore = create((set, get) => ({
  activeConversationId: null,
  messages: [],

  hasMore: true,
  cursor: null,
  isFetchingMore: false,

  // Use to select any conversation
  setActiveConversation: (conversationId) =>
    set({
      activeConversationId: conversationId,
      messages: [],
      hasMore: true,
      cursor: null,
    }),

  // Sync selected conversation id for new conversation
  setActiveConversationId: (conversationId) =>
    set({ activeConversationId: conversationId }),

  // Set fetched messages
  setMessages: (messages) => set({ messages: mergeMessages(messages || []) }),

  // Prepend messages on moreFetch
  prependMessages: (older) =>
    set((state) => ({
      messages: mergeMessages([...(older || []), ...state.messages]),
    })),

  // Add new received messsage
  appendMessage: (message) =>
    set((state) => {
      const exists = state.messages.some(
        (m) =>
          (message._id && m._id === message._id) ||
          (message.clientMessageId &&
            m.clientMessageId === message.clientMessageId),
      );
      if (exists) return state;
      return { messages: sortMessages([...state.messages, message]) };
    }),

  // Add new message sent from me
  addOptimistic: (message) =>
    set((state) => ({
      messages: sortMessages([
        ...state.messages,
        { ...message, status: "sending" },
      ]),
    })),

  // Sync the id of message + confirmation
  confirmMessage: ({ clientMessageId, messageId }) =>
    set((state) => {
      const messages = get().messages;
      const isMessageExists = messages.some(
        (msg) =>
          (clientMessageId && msg.clientMessageId === clientMessageId) ||
          (messageId && msg._id === messageId),
      );

      if (!isMessageExists) {
        return state;
      }

      const updatedMessageArray = messages.map((msg) => {
        const matchesId =
          (clientMessageId && msg.clientMessageId === clientMessageId) ||
          (messageId && msg._id === messageId);

        if (!matchesId) {
          return msg;
        }

        return {
          ...msg,
          _id: messageId,
          status: "sent",
        };
      });

      return { messages: sortMessages(updatedMessageArray) };
    }),

  // Mark message failed, for retries
  markFailed: (clientMessageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m,
      ),
    })),

  // Mark sending on retry
  markSending: (clientMessageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.clientMessageId === clientMessageId ? { ...m, status: "sending" } : m,
      ),
    })),

  setPagination: ({ cursor, hasMore }) => set({ cursor, hasMore }),

  setFetchingMore: (value) => set({ isFetchingMore: value }),

  clear: () =>
    set({
      activeConversationId: null,
      messages: [],
      hasMore: true,
      cursor: null,
    }),
}));

export default useMessageStore;
