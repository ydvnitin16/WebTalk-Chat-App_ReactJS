import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "@/stores/useAuthStore";

const useProfile = () => {
    const { updateCurrentUser } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateProfile = async ({ name, username, avatar }) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            if (name) formData.append("name", name);
            if (username) formData.append("username", username);
            if (avatar instanceof File) {
                formData.append("avatar", avatar);
            }

            const res = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/profile`,
                {
                    method: "PUT",
                    body: formData,
                    credentials: "include",
                },
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            updateCurrentUser(data.user);
            toast.success("Profile updated successfully");

            return data.user;
        } catch (err) {
            const message = err.message || "Something went wrong";
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateProfile,
        loading,
        error,
    };
};

export default useProfile;
