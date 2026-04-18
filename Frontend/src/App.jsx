import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import ServerBootBanner from "./components/ui/ServerBootBanner.jsx";

function App() {
    return (
        <div>
            <ServerBootBanner />
            <Toaster position='top-right' />
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </div>
    );
}

export default App;
