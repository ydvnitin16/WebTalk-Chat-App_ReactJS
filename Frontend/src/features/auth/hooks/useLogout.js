import React from "react";
import { logoutUser } from "../services/auth.api";
import useAuthStore from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { socket } from "@/lib/socket";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();

    async function handleLogout() {
        try {
            const data = await logoutUser();

            clearAuth();
            navigate("/login");
            toast.success("User logout Successfull");
            socket.disconnect();
        } catch (err) {
            console.log(err.message);
        }
    }
    return { handleLogout };
};

export default useLogout;
