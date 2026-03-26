import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import MainLayout from "./layouts/MainLayout";
import Interface from "./pages/Interface";
import ProtectedRoute from "@/components/ui/ProtectedRoutes.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signup' element={<Signup />}></Route>
            <Route element={<ProtectedRoute />}>
                <Route path='/' element={<MainLayout />}>
                    <Route index element={<Interface />} />
                </Route>
            </Route>
        </>,
    ),
);

export default router;
