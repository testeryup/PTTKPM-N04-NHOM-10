// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setUserRole, clearUserProfile } from "../user/userSlice";
import authService from "../../services/authService";

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, thunkAPI) => {
        try {
            const response = await authService.login(email, password);
            console.log("check response:", response);
            thunkAPI.dispatch(setUserRole(response.role));
            return response;
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password, username, verifyPassword }, thunkAPI) => {
        try {
            if (password !== verifyPassword) {
                return thunkAPI.rejectWithValue('Passwords do not match');
            }
            const response = await authService.register(email, password, username);
            console.log("check response from register:", response);
            if (response.role) {
                thunkAPI.dispatch(setUserRole(response.role));
            }
            return response;
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || 'Register failed');
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, thunkAPI) => {
        try {
            const response = await authService.refresh();
            if (response.data.role) {
                thunkAPI.dispatch(setUserRole(response.data.role));
            }
            return response.data;
        } catch (error) {
            thunkAPI.dispatch(clearUserProfile());
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Get new token failed');
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            const response = await authService.logout();
            thunkAPI.dispatch(clearUserProfile());
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Log out failed')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState:
    {
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        // Refresh Token
        builder
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.token = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
            });
        // Logout
        builder
            .addCase(logout.fulfilled, (state) => {
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                state.loading = false;
           })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload;
                console.log("check logout failed")

            });
    }
});
export const {clearError} = authSlice.actions;
export default authSlice.reducer;