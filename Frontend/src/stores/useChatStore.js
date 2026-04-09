import { create } from "zustand";

// Currently we have the separate users object we are not getting user populated in conversation or message and if we are getting than we normalise it by keeping only id not avatar and name.
// So we can keep the user details in the message later

const useChatStore = create((set, get) => ({
    conversations: [],
    messages: [],
    selectedUserId: null,
    typingUsers: {},
    users: {},

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

    setMessages: (messages) => set({ messages: messages || [] }),

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
                messages: [...state.messages, message],
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
            const updatedMessageArray = messages.map((msg) =>
                msg._id === messageId || msg._id === tempId
                    ? { ...msg, _id: messageId, status }
                    : msg,
            );

            return { messages: updatedMessageArray };
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

            // 🔥 prevent unnecessary state update
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
}));

export default useChatStore;
