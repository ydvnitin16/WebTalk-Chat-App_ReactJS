import toast from "react-hot-toast";
import { loginUser, signupUser } from "../services/auth.api.js";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../stores/useAuthStore.js";
import { useState } from "react";

export const useAuthHandle = ({ type, reset }) => {
    const { setAuthUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (formData) => {
        try {
            setLoading(true);
            const action = type === "login" ? loginUser : signupUser;

            const data = await action(formData);

            setAuthUser(data.user);
            toast.success(
                type === "login"
                    ? "Login successful"
                    : "Account created successfully",
            );

            reset();
            navigate("/");
        } catch (err) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return { onSubmit, loading };
};
