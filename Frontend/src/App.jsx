import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";

function App() {
    return (
        <>
            <Toaster position='top-right' />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
