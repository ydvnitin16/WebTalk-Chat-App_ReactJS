import { lazy, Suspense } from "react";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
const Login = lazy(() => import("./features/auth/pages/Login"));
const Signup = lazy(() => import("./features/auth/pages/Signup"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Interface = lazy(() => import("./pages/Interface"));
import ProtectedRoute from "@/components/ui/ProtectedRoutes.jsx";
import Loading from "./components/ui/Loading";
import AppShellSkeleton from "./components/skeletons/AppShellSkeleton";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route
                path='/login'
                element={
                    <Suspense fallback={<Loading />}>
                        <Login />
                    </Suspense>
                }
            ></Route>
            <Route
                path='/signup'
                element={
                    <Suspense fallback={<Loading />}>
                        <Signup />
                    </Suspense>
                }
            ></Route>
            <Route element={<ProtectedRoute />}>
                <Route
                    path='/'
                    element={
                        <Suspense fallback={<AppShellSkeleton />}>
                            <MainLayout />
                        </Suspense>
                    }
                >
                    <Route
                        index
                        element={
                            <Suspense fallback={<AppShellSkeleton />}>
                                <Interface />
                            </Suspense>
                        }
                    />
                </Route>
            </Route>
        </>,
    ),
);

export default router;
