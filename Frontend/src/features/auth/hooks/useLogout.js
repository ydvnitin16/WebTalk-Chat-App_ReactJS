import { logoutUser } from "../services/auth.api";
import useAuthStore from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { disconnectSocket } from "@/lib/socket";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();

    async function handleLogout() {
        try {
            await logoutUser();

            clearAuth();
            disconnectSocket();
            navigate("/login");
            toast.success("User logout Successfull");
        } catch (err) {
            console.log(err.message);
        }
    }
    return { handleLogout };
};

export default useLogout;
