export const fetchMessages = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/messages`, {
        credentials: 'include'
    });
    
    if (!res.ok) {
        // Most common: 401 when cookie isn't present/valid
        return [];
    }

    const data = await res.json();
    return data?.messages ?? [];
}