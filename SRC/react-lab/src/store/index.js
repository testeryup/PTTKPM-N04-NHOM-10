// src/store/index.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import cartReducer from '../features/cart/cartSlice';

import { authMiddleware } from '../middlewares/authMiddleware';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'user', 'cart'] // Only persist these reducers
};

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    cart: cartReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(authMiddleware),
});

export const persistor = persistStore(store);
export default store;