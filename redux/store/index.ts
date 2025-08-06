import { configureStore } from "@reduxjs/toolkit";
import authReducer from '@/redux/slices/authSlice'
import reportReducer from '@/redux/slices/reportSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        report: reportReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
