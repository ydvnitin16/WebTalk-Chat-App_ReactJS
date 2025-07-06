import { useEffect } from 'react';
import { createContext, useMemo, useState } from 'react';
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
import { UseAuthStore } from './stores/UseAuthStore.jsx';

export const roomContext = createContext();
export let socket;

function App() {
    socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`, {
        withCredentials: true
    })); // connect to the socket server

    const [room, setRoom] = useState(null);
    const userStore = UseAuthStore((state) => state.userStore);

    useEffect(() => {
        socket.on('connect', () => {
            console.log(`Welcome, `, socket.id);
        });

        socket.emit('join-room', userStore?.id);
        receiveMessage(toast);
    }, []);

    useEffect(() => {
        console.log(`Room Changed: `, room);
    }, [room]);

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
            <roomContext.Provider value={{ setRoom, room }}>
                <RouterProvider router={router} />
            </roomContext.Provider>
        </>
    );
}

export default App;
