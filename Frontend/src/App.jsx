import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import { Suspense } from "react";
import Loading from "./components/ui/Loading.jsx";

function App() {
    return (
        <>
            <Toaster position='top-right' />
            <Suspense fallback={<Loading />}>
                <RouterProvider router={router} />
            </Suspense>
        </>
    );
}

export default App;
