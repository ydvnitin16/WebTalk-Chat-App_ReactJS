import { create } from "zustand";

const normalizeUserId = (value) => String(value?._id || value || "");

const useMemberStore = create((set) => ({
  membersCursor: {},
  users: {},

  setUsers: (users = {}) => {
    set({ users });
  },

  setCursors: (membersCursor = {}) => {
    set({ membersCursor });
  },

  addUser: (user) => {
    const userId = normalizeUserId(user);

    if (!userId) return;

    set((state) => ({
      users: {
        ...state.users,
        [userId]: user,
      },
    }));
  },

  addCursor: (conversationId, cursor) =>
    set((state) => ({
      membersCursor: { ...state.membersCursor, [conversationId]: cursor },
    })),

  updateDeliveryPointer: ({ conversationId, userId, messageId }) =>
    set((state) => {
      const cursor = state.membersCursor[conversationId];
      if (!cursor) return state;

      if (
        cursor.otherLastDeliveredMessageId &&
        cursor.otherLastDeliveredMessageId >= messageId
      ) {
        return state; // out of order
      }

      return {
        membersCursor: {
          ...state.membersCursor,
          [conversationId]: {
            ...cursor,
            otherLastDeliveredMessageId: messageId,
          },
        },
      };
    }),

  updateSeenPointer: ({ conversationId, userId, messageId }) =>
    set((state) => {
      const cursor = state.membersCursor[conversationId];
      if (!cursor) return state;

      const seenAdvanced =
        !cursor.otherLastSeenMessageId ||
        messageId > cursor.otherLastSeenMessageId;
      if (!seenAdvanced) return state; // out of order

      const deliveredMax =
        cursor.otherLastDeliveredMessageId &&
        cursor.otherLastDeliveredMessageId > messageId
          ? cursor.otherLastDeliveredMessageId
          : messageId;

      return {
        membersCursor: {
          ...state.membersCursor,
          [conversationId]: {
            ...cursor,
            otherLastDeliveredMessageId: deliveredMax,
            otherLastSeenMessageId: messageId,
          },
        },
      };
    }),

  getCursorById: (conversationId) =>
    get().membersCursor[conversationId] || null,

  setUserOnline: (userId, isOnline) => {
    set((state) => {
      const lastSeen = isOnline ? undefined : new Date().toISOString();
      const users = state.users[userId]
        ? {
            ...state.users,
            [userId]: {
              ...state.users[userId],
              isOnline,
              lastSeen: lastSeen || state.users[userId].lastSeen,
            },
          }
        : state.users;

      return { users };
    });
  },
}));

export default useMemberStore;
