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

    updateConversationLastMessage: (message) =>
        set((state) => {
            const conversationIndex = state.conversations.findIndex(
                (conversation) =>
                    conversation._id === message.conversation ||
                    (conversation.participants?.includes(message.sender) &&
                        conversation.participants?.includes(message.receiver)),
            );

            console.log(conversationIndex);

            if (conversationIndex === -1) {
                console.log("Creating conversation");
                const newConversation = {
                    _id: message.conversation,
                    participants: [message.sender, message.receiver],
                    lastMessage: message,
                };
                console.log(newConversation);
                return {
                    conversations: [newConversation, ...state.conversations],
                };
            }
            console.log("Updating conversation");
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
