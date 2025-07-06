import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UseAuthStore } from '../stores/UseAuthStore';

const MainLayout = () => {
    const isAuthExpired = UseAuthStore((state) => state.isAuthExpired);
    const clearUserStore = UseAuthStore((state) => state.clearUserStore);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthExpired()) {
            clearUserStore();
            navigate('/login');
            toast('Please Login!');
        }
    }, []);
    return (
        <>
            <Outlet />
        </>
    );
};

export default MainLayout;
