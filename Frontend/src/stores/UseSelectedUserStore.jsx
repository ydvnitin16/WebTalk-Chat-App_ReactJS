import React from 'react';
import { formatDateTime } from '../services/utils.js';
import { create } from 'zustand';

const UseSelectedUserStore = create((set, get) => ({
    selectedUser: null,

    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },

    updateSelectedUser: (status, id) => {
        const current = get().selectedUser;
        if(!current) return
        if(current?.id !== id) return
        const isOnline = status === 'online' ? true : false;
        const lastSeen = formatDateTime(Date.now())
        set({ selectedUser: {...current, isOnline: isOnline, lastSeen: lastSeen} });
    }
}));

export { UseSelectedUserStore };
