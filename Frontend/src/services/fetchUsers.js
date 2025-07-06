export const fetchUsers = async () => {
    return await fetch(`${import.meta.env.VITE_SERVER_URL}/users`, {
        credentials: 'include',
    });
};
