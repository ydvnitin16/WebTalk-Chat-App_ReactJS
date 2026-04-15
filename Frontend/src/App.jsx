import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

function App() {
    return (
        <>
            <Toaster position='top-right' />
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </>
    );
}

export default App;
