import React, { useState, useEffect } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { set_user_basic_details } from "../Redux/UserDetailsSlice";
import axiosInstance from "../Component/Api/Api";
import Login from "../Pages/User/Login/Login";
import Signup from "../Pages/User/Signup/Signup";
import Dashboard from "../Pages/User/Home/UserDashboard";
import UserPrivateRoute from "../PrivateRoutes/UserPrivateRoute";

const UserWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");
  const user_basic_details = useSelector((state) => state.user_basic_details);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await axiosInstance.get("auth/user-details/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data.data;
      dispatch(
        set_user_basic_details({
          id: userData.id,
          name: userData.username,
          email: userData.email,
          is_superuser: userData.is_superuser,
          is_authenticated: userData.is_active,
        })
      );
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUserData();
    else setIsLoading(false);
  }, [location.pathname]);

  if (isLoading) return <div>Loading...</div>;

  // If a superuser is trying to access user routes, redirect to admin dashboard
  if (user_basic_details.is_superuser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user_basic_details.is_authenticated ? (
            <Navigate to="/user-dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/user-dashboard"
        element={
          <UserPrivateRoute>
            <Dashboard />
          </UserPrivateRoute>
        }
      />
    </Routes>
  );
};

export default UserWrapper;
