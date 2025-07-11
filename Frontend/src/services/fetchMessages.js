import { UseAuthStore } from "../stores/UseAuthStore"

const userStore = UseAuthStore.getState().userStore;

export const fetchMessages = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/messages`, {
        credentials: 'include'
    });
    
    const data = await res.json()
    return data.messages
}