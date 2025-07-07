import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUsers } from '../services/fetchUsers.js';

const UseContactStore = create(
    persist((set, get) => ({
        contacts: [],

        setContacts: async () => {
            const res = await fetchUsers();
            const data = await res.json();
            const contacts = data.users;
            set({ contacts });
        },

        setStatus: (id, status) => {
            const isOnline = status === 'online' ? true : false;
            set({
                contacts: get().contacts.map((user) =>
                    user._id === id ? { ...user, isOnline: isOnline, lastSeen: Date.now() } : user
                ),
            });
        },
    }))
);

export { UseContactStore };
