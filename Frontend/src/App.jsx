import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { connectSocket, disconnectSocket, socket } from "./lib/socket.js";
import router from "./routes.jsx";
import { useSocketEvents } from "./hooks/useSocketEvents.js";
import useAuthStore from "./stores/useAuthStore.js";

function App() {
    const currentUser = useAuthStore((state) => state.currentUser);
    useSocketEvents(toast);

    useEffect(() => {
        if (currentUser) {
            connectSocket();
            return;
        }

        disconnectSocket();
    }, [currentUser]);

    return (
        <>
            <Toaster position='top-right' />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
