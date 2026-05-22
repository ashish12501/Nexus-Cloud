import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAppLoading: true, // Always true when the app first opens
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAppLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAppLoading = false;
    },
    setAppReady: (state) => {
      state.isAppLoading = false;
    },
  },
});

export const { setCredentials, logout, setAppReady } = authSlice.actions;
export default authSlice.reducer;
