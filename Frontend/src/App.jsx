import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout, setAppReady } from "./features/auth/authSlice";
import { apiClient } from "./api/client";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";

function App() {
  const dispatch = useDispatch();
  const { isAppLoading, token } = useSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        // The Silent Refresh Call
        // withCredentials: true is CRITICAL so the browser sends the Refresh Cookie
        const response = await apiClient.get("/auth/refresh-token", {
          withCredentials: true,
        });

        // If successful, store the new access token in Redux memory
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
          }),
        );
      } catch (error) {
        // If it fails (no cookie, expired cookie), clear state
        dispatch(logout());
      } finally {
        // Always unlock the app, whether success or failure
        dispatch(setAppReady());
      }
    };

    initializeAuth();
  }, [dispatch]);

  // 🚨 THE ANTI-FLICKER LOCK
  // Show absolutely nothing (or a cool spinner) until the backend responds
  if (isAppLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/signup"
          element={token ? <Navigate to="/dashboard" replace /> : <Signup />}
        />

        <Route
          path="/verify-otp"
          element={token ? <Navigate to="/dashboard" replace /> : <VerifyOtp />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add /trash, /settings, etc. here */}
        </Route>

        {/* Catch all */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
