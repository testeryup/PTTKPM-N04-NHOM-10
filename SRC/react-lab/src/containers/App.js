import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { path } from '../ultils';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, clearError } from '../features/auth/authSlice';
import { fetchUserProfile } from '../features/user/userSlice';

import { setAuthToken } from '../axios';

import Application from '../components/Application';
import Home from '../components/Home';
import Login from '../features/auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminDashboard, SellerDashboard } from '../containers/System';
import UserDashboard from '../containers/System/UserDashboard';
import UserProfile from './Header/User/UserProfile';
import SignUp from '../features/auth/SignUp';

import { ToastContainer, toast, Bounce } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (auth.token) {
                setAuthToken(auth.token);
                await dispatch(fetchUserProfile());
            }
            setIsInitialized(true);
        };
        initializeAuth();
    }, [dispatch, auth.token]);

    if (!isInitialized) return <div>Loading...</div>;

    return (<>
        <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

        <Routes>

            <Route path={path.UNAUTHORIZED} element={<h1>Unauthorized Access</h1>} />
            <Route path={path.HOME} element={<Home></Home>} />
            <Route path={path.APP} element={<Application />} />
            <Route path={path.LOGIN} element={<Login />} />
            <Route path={path.SIGNUP} element={auth.isAuthenticated ? <Home></Home> : <SignUp></SignUp>}></Route>

            <Route
                path={path.USER_DASHBOARD}
                element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path={path.PROFILE}
                element={
                    <ProtectedRoute allowedRoles={['user', 'seller', 'admin']}>
                        <UserProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path={path.SELLER_DASHBOARD}
                element={
                    <ProtectedRoute allowedRoles={['seller']}>
                        <SellerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path={path.ADMIN_DASHBOARD}
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Catch-All Route */}
            <Route path='*' element={<h1>404 - Page Not Found</h1>} />


        </Routes>
    </>
    );
}