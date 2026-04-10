import { create } from "zustand";

// Currently we have the separate users object we are not getting user populated in conversation or message and if we are getting than we normalise it by keeping only id not avatar and name.
// So we can keep the user details in the message later

const sortMessages = (messages = []) =>
    [...messages].sort((a, b) => {
        const timeDiff =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        if (timeDiff !== 0) return timeDiff;

        return String(a._id || a.tempId || "").localeCompare(
            String(b._id || b.tempId || ""),
        );
    });

const mergeMessages = (messages = []) => {
    const uniqueMessages = new Map();

    for (const message of messages) {
        const existingMessage =
            uniqueMessages.get(message._id) ||
            (message.tempId && uniqueMessages.get(message.tempId));

        const mergedMessage = { ...existingMessage, ...message };

        if (mergedMessage._id) {
            uniqueMessages.set(mergedMessage._id, mergedMessage);
        }

        if (mergedMessage.tempId) {
            uniqueMessages.set(mergedMessage.tempId, mergedMessage);
        }
    }

    return sortMessages(
        Array.from(new Set(uniqueMessages.values())).filter(Boolean),
    );
};

const useChatStore = create((set, get) => ({
    conversations: [],
    messages: [],
    selectedUserId: null,
    typingUsers: {},
    users: {},
    draftsByConversation: {},
    cursor: null,
    hasMore: true,
    isFetching: false,

    setPagination: ({ cursor, hasMore }) => set({ cursor, hasMore }),

    prependMessages: (olderMessages) =>
        set((state) => ({
            messages: mergeMessages([...olderMessages, ...state.messages]),
        })),

    setFetching: (value) => set({ isFetching: value }),

    setConversations: (conversations) =>
        set({ conversations: conversations || [] }),

    addConversation: (newConversation) =>
        set((state) => {
            const alreadyExists = state.conversations.some((conversation) => {
                if (
                    newConversation._id &&
                    conversation._id === newConversation._id
                ) {
                    return true;
                }

                return (
                    conversation.participants?.includes(
                        newConversation.participants?.[0],
                    ) &&
                    conversation.participants?.includes(
                        newConversation.participants?.[1],
                    )
                );
            });

            if (alreadyExists) return state;

            return {
                conversations: [newConversation, ...state.conversations],
            };
        }),

    setSelectedUserId: (id) => set({ selectedUserId: id }),

    setMessages: (messages) => set({ messages: mergeMessages(messages || []) }),

    addMessage: (message) =>
        set((state) => {
            const selectedUserId = get().selectedUserId;

            const shouldShowInCurrentChat =
                selectedUserId &&
                (selectedUserId === message.sender ||
                    selectedUserId === message.receiver);

            if (!shouldShowInCurrentChat) {
                return state;
            }

            return {
                messages: mergeMessages([...state.messages, message]),
            };
        }),

    updateMessageStatus: ({ tempId = null, messageId, status }) =>
        set((state) => {
            const messages = get().messages;
            const isMessageExists = messages.some(
                (msg) => msg._id === messageId || msg._id === tempId,
            );

            if (!isMessageExists) {
                return state;
            }
            const updatedMessageArray = messages.map((msg) => {
                const matchesMessageId = msg._id === messageId;
                const matchesTempId =
                    (tempId && msg._id === tempId) ||
                    (tempId && msg.tempId === tempId);

                if (!matchesMessageId && !matchesTempId) {
                    return msg;
                }

                return {
                    ...msg,
                    _id: messageId || msg._id,
                    tempId: msg.tempId || tempId || null,
                    status,
                };
            });

            return { messages: mergeMessages(updatedMessageArray) };
        }),

    updateAllMessagesStatus: ({ sendTo, messageIds, status }) =>
        set((state) => {
            const selectedUserId = state.selectedUserId;

            const shouldUpdateCurrentMessages =
                selectedUserId && selectedUserId === sendTo;

            if (!shouldUpdateCurrentMessages) {
                return state;
            }

            const idsSet = new Set(messageIds);

            let hasChanges = false;

            const updatedMessages = state.messages.map((msg) => {
                if (idsSet.has(msg._id) && msg.status !== status) {
                    hasChanges = true;
                    return { ...msg, status };
                }
                return msg;
            });

            // prevent unnecessary state update
            if (!hasChanges) return state;

            return { messages: updatedMessages };
        }),

    updateConversationLastMessage: (message) =>
        set((state) => {
            const conversationIndex = state.conversations.findIndex(
                (conversation) =>
                    conversation._id === message.conversation ||
                    (conversation.participants?.includes(message.sender) &&
                        conversation.participants?.includes(message.receiver)),
            );

            if (conversationIndex === -1) {
                const newConversation = {
                    _id: message.conversation,
                    participants: [message.sender, message.receiver],
                    lastMessage: message,
                };
                return {
                    conversations: [newConversation, ...state.conversations],
                };
            }
            const updatedConversation = {
                ...state.conversations[conversationIndex],
                _id:
                    message.conversation ||
                    state.conversations[conversationIndex]._id,
                lastMessage: message,
            };

            const rest = state.conversations.filter(
                (_, index) => index !== conversationIndex,
            );

            return {
                conversations: [updatedConversation, ...rest],
            };
        }),

    updateConversationUnreadCount: ({ conversationId, userId, count }) =>
        set((state) => {
            const conversationIndex = state.conversations.findIndex(
                (conversation) => conversation._id === conversationId,
            );

            if (conversationIndex === -1) {
                return state;
            }

            const conversation = state.conversations[conversationIndex];
            const updatedConversation = {
                ...conversation,
                unreadCounts: {
                    ...(conversation.unreadCounts || {}),
                    [userId]: count,
                },
            };

            const rest = state.conversations.filter(
                (_, index) => index !== conversationIndex,
            );

            return {
                conversations: [updatedConversation, ...rest],
            };
        }),

    setTyping: (userId, value) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: value },
        })),

    setUsers: (users) => set({ users: users || {} }),

    addUser: (user) =>
        set((state) => ({
            users: { ...state.users, [user._id]: user },
        })),

    setUserStatus: (userId, isOnline) =>
        set((state) => {
            const isUserExists = state.users[userId];
            if (!isUserExists) {
                return state;
            }

            return {
                users: {
                    ...state.users,
                    [userId]: {
                        ...state.users[userId],
                        isOnline,
                        lastSeen: isOnline
                            ? state.users[userId]?.lastSeen
                            : new Date().toISOString(),
                    },
                },
            };
        }),
    setDraft: (conversationId, text) =>
        set((state) => ({
            draftsByConversation: {
                ...state.draftsByConversation,
                [conversationId]: text,
            },
        })),

    getDraft: (conversationId) => {
        return get().draftsByConversation[conversationId] || "";
    },

    clearDraft: (conversationId) =>
        set((state) => {
            const updatedDrafts = { ...state.draftsByConversation };
            delete updatedDrafts[conversationId];
            return { draftsByConversation: updatedDrafts };
        }),
}));

export default useChatStore;
