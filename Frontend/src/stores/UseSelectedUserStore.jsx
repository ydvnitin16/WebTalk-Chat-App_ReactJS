import React from 'react';
import { create } from 'zustand';

const UseSelectedUserStore = create((set, get) => ({
    selectedUser: null,

    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },
}));

export { UseSelectedUserStore };
