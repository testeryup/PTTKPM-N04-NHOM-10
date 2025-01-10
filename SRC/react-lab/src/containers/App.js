import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { path } from '../ultils';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from '../features/auth/authSlice';
import { fetchUserProfile } from '../features/user/userSlice';

import { setAuthToken } from '../axios';

import Application from '../components/Application';
import Home from '../components/Home';
import Login from '../features/auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminDashboard, SellerDashboard } from '../containers/System';
import UserDashboard from '../containers/System/UserDashboard';
import UserProfile from './Header/User/UserProfile';

export default function App() {
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

    useEffect(() => {
        if (auth.token) {
            console.log("Restoring token from store:", auth.token);
            setAuthToken(auth.token);
            dispatch(fetchUserProfile());
        } else {
            console.log("No token in store, trying refresh");
            dispatch(refreshToken());
        }
    }, [dispatch, auth.token]);

    if (auth.loading && !auth.isAuthenticated) {
        return <div>Loading...</div>; // Or your custom loading component
    }
    return (
        <Routes>
            {/* <Route path="/" element={<Navigate to={path.HOME} />} /> */}
            <Route path={path.UNAUTHORIZED} element={<h1>Unauthorized Access</h1>} />
            <Route path={path.HOME} element={<Home></Home>} />
            <Route path={path.APP} element={<Application />} />
            <Route path={path.LOGIN} element={<Login />} />
            <Route path={path.PROFILE} element={<UserProfile></UserProfile>}></Route>
            {/* Protected Routes */}
            <Route
                path={path.USER_DASHBOARD}
                element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <UserDashboard />
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
    );
}