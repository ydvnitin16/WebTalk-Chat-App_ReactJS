import { useEffect } from 'react';
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
import { useSocketEvents } from './services/useSocketEvents.js';
import { UseAuthStore } from './stores/UseAuthStore.jsx';

export let socket;

function App() {
    const userStore = UseAuthStore(state => state.userStore)
    socket = 
        io(`${import.meta.env.VITE_SERVER_URL}`, {
            withCredentials: true,
        }) // connect to the socket server

    useSocketEvents(toast);

    useEffect(() => {
        socket.on('connect', () => {
            console.log(`Welcome, `, socket.id);
            
        });

        socket.on('reconnect', (attempt) => {
            console.log(`Socket reconnected after: `, attempt, 'attempts')
        })

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
