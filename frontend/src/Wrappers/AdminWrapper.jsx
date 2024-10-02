import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../Pages/User/Home/UserDashboard";
import Sidebar from "../Component/Admin/AdminSidebar";
import UserManagement from "../Pages/Admin/UserManagement";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { set_user_basic_details } from "../Redux/UserDetailsSlice";
import axiosInstance from "../Component/Api/Api";
import AdminPrivateRoute from "../PrivateRoutes/AdminPrivateRoute";

// Implement this component as needed

const AdminWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");
  const user_basic_details = useSelector((state) => state.user_basic_details);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchUserData = async () => {
    try {
      const res = await axiosInstance.get("auth/user-details/", {
        headers: {
          authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const userData = res.data.data;
      console.log("response is", userData);
      dispatch(
        set_user_basic_details({
          id: userData.id,
          name: userData.username,
          email: userData.email,
          is_superuser: userData.is_superuser,
        })
      );
      setIsLoading(false); // Set loading state to false after data is fetched
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData(); // Fetch user data if token exists
    } else {
      setIsLoading(false); // No token means no need to wait
    }
  }, [location.pathname, user_basic_details]);

  // Show loading indicator or null while fetching user data
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a better loading UI
  }

  return (
    <Routes>
      {/* Use the Sidebar for routes that need it */}
      <Route
        path="/dashboard"
        element={
          <AdminPrivateRoute>
            <Sidebar>
              <Dashboard />
            </Sidebar>
          </AdminPrivateRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <AdminPrivateRoute>
            <Sidebar>
              <UserManagement />
            </Sidebar>
          </AdminPrivateRoute>
        }
      />

      {/* Add more routes here that require Sidebar */}
    </Routes>
  );
};

export default AdminWrapper;
