import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import toast from "react-hot-toast";

const ProtectedRoute = () => {
    const location = useLocation();
    const { isAuthenticated, clearAuth } = useAuthStore();

    const authenticated = isAuthenticated();
    if (!authenticated) {
        clearAuth(); // clear stale persisted session
        toast("Please login again!");
        return <Navigate to='/login' replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
