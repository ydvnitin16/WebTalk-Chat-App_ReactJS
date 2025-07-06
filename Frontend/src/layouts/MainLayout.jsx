import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UseAuthStore } from '../stores/UseAuthStore';

const MainLayout = () => {
    const isAuthExpired = UseAuthStore((state) => state.isAuthExpired);
    const logoutStore = UseAuthStore((state) => state.logoutStore);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthExpired()) {
            logoutStore();
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
