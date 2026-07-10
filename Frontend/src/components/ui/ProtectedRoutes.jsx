import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const ProtectedRoute = () => {
    const location = useLocation();
    const { isAuthenticated, clearAuth } = useAuthStore();

    const authenticated = isAuthenticated();
    if (!authenticated) {
        clearAuth(); // clear stale persisted session
        return <Navigate to='/login' replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
