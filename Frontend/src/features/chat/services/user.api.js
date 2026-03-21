const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const searchUserByUsername = async (username) => {
    const res = await fetch(`${BASE_URL}/user/search?username=${username}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "User not found");
    }

    return data;
};
