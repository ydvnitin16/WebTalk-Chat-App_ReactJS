import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { socket } from "./lib/socket.js";
import router from "./routes.jsx";
import { useSocketEvents } from "./hooks/useSocketEvents.js";

function App() {
    useSocketEvents(toast);

    useEffect(() => {
        socket.on("connect", () => {
            console.log(`Welcome, `, socket.id);
        });

        socket.on("reconnect", (attempt) => {
            console.log(`Socket reconnected after: `, attempt, "attempts");
        });

        return () => {
            socket.off("connect");
            socket.off("reconnect");
        };
    }, []);

    return (
        <>
            <Toaster position='top-right' />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
