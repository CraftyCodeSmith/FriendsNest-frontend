import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8081', // Your API base URL
        prepareHeaders: (headers) => {
            // Optionally, add any headers here if needed (e.g., Authorization)
            const token = sessionStorage.getItem('authToken');
            if (token) {
                // Attach the token to the Authorization header
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
        // Custom response handling to treat JWT as a plain text response
        responseHandler: (response) => response.text(),  // This will treat the response as raw text (JWT token)
    }),
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            // Transform the raw JWT string into an object with the 'token' property
            transformResponse: (response) => {
                return { token: response };  // response is already plain text JWT
            },
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
