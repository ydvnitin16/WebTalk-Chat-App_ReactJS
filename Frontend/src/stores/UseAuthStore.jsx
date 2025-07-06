import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EXPIRY_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days

const UseAuthStore = create(
    persist(
        (set, get) => ({
            userStore: null,
            loginTime: null,

            setUserStore: (userInfo) => {
                set({ userStore: userInfo, loginTime: Date.now() });
            },

            clearUserStore: () => {
                set({ userStore: null, loginTime: null });
            },

            isAuthExpired: () => {
                const loginTime = get().loginTime;
                if (!loginTime) return true;
                return Date.now() - loginTime > EXPIRY_TIME;
            },
        }),
        { name: 'auth-storage' }
    )
);

export { UseAuthStore };
