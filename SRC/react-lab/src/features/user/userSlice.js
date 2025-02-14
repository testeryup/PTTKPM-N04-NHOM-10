// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from '../../services/userService';
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, thunkAPI) => {
        try {
            const response = await userService.getUserProfile();
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message);
        }
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        role: null,
        language: 'vn', // Example user preference
        profile: null,
        error: null
    },
    reducers: {
        setUserRole: (state, action) => {
            state.role = action.payload;
        },
        clearUserProfile: (state) => {
            state.role = null;
            state.profile = null;
            state.error = null;
        },
        setUserLanguage: (state, action) => {
            state.language = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.loading = false;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                // state.error = action.payload;
                state.loading = false;
            });
    }
});

export const { setUserRole, clearUserProfile, setUserLanguage } = userSlice.actions;
export default userSlice.reducer;