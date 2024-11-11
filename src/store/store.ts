import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/authentication/services/authApi'; // Adjust path accordingly

const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware), // Add RTK Query middleware
});

export default store;
