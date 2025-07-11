import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UseAuthStore } from '../stores/UseAuthStore';
import toast from 'react-hot-toast';
import { UseMessagesStore } from '../stores/UseMessagesStore';

const MainLayout = () => {
    const isAuthExpired = UseAuthStore((state) => state.isAuthExpired);
    const clearUserStore = UseAuthStore((state) => state.clearUserStore);
    const fetchMessages = UseMessagesStore(state => state.fetchMessages);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthExpired()) {
            toast('Please Login!');
            clearUserStore();
            navigate('/login');
        }
    }, [isAuthExpired, clearUserStore, navigate]);

    useEffect(() => {
      fetchMessages()
    }, [])
    

    return (
        <>
            <Outlet />
        </>
    );
};

export default MainLayout;
