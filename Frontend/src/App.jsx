import { useEffect } from 'react';
import { useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom';
import { io } from 'socket.io-client';
import MainLayout from './layouts/MainLayout.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import { receiveMessage } from './services/socket.js';
import { UseSelectedUserStore } from './stores/UseSelectedUserStore.jsx';

export let socket;

function App() {
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);


    socket = useMemo(() =>
        io(`${import.meta.env.VITE_SERVER_URL}`, {
            withCredentials: true,
        })
    ); // connect to the socket server


    useEffect(() => {
        socket.on('connect', () => {
            console.log(`Welcome, `, socket.id);
        });

        socket.emit('join-room');
        receiveMessage(toast);
    }, []);
    

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/signup" element={<Signup />}></Route>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Chat />} />
                </Route>
            </>
        )
    );

    return (
        <>
            <Toaster position="top-right" />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
