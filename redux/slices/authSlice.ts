import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    loading: boolean;
    showPassword: boolean;
    failedAttempts: number;
    token: string;
    captchaPassed: boolean;
}

const initialState: AuthState = {
    loading: false,
    showPassword: false,
    failedAttempts: 0,
    token: "",
    captchaPassed: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        toggleShowPassword: (state) => {
            state.showPassword = !state.showPassword;
        },
        incrementFailedAttempts: (state) => {
            state.failedAttempts += 1;
        },
        resetFailedAttempts: (state) => {
            state.failedAttempts = 0;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setCaptchaPassed: (state, action: PayloadAction<boolean>) => {
            state.captchaPassed = action.payload;
        },
    },
});

export const {
    toggleShowPassword,
    incrementFailedAttempts,
    resetFailedAttempts,
    setToken,
    setCaptchaPassed,
} = authSlice.actions;

export default authSlice.reducer;
