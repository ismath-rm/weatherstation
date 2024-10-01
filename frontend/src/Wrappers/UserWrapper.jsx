import React, { useState, useEffect } from 'react'
import {useLocation, Route, Routes } from 'react-router-dom'
import Login from '../Pages/User/Login/Login'
import Signup from '../Pages/User/Signup/Signup'
import Dashboard from '../Pages/User/Home/UserDashboard'
import UserPrivateRoute from '../PrivateRoutes/UserPrivateRoute'
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../Component/Api/Api'
import { set_user_basic_details } from "../Redux/UserDetailsSlice"

const UserWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = localStorage.getItem('access_token');
  const user_basic_details = useSelector((state) => state.user_basic_details);  

  const [isLoading, setIsLoading] = useState(true);  // Add loading state

  const fetchUserData = async () => {
    console.log(`Bearer ${token}`);
    try {
      const res = await axiosInstance.get('auth/user-details/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log(`Bearer ${token}`);


      const userData = res.data.data;
      console.log(userData);
      
      dispatch(
        set_user_basic_details({
          id: userData.id,
          name: userData.username,
          email: userData.email,
          is_superuser: userData.is_superuser,
          is_authenticated: userData.is_active,
        })
      );
      setIsLoading(false);  // Set loading state to false after data is fetched
    } catch (error) {
      console.log(error);
      setIsLoading(false);  // Set loading state to false even if there is an error
    }
  };

  useEffect(() => {
    // localStorage.clear()
    if (token) {
      fetchUserData();  // Fetch user data if token exists
    } else {
      setIsLoading(false);  // No token means no need to wait
    }
  }, [location.pathname, user_basic_details]);

  // Show loading indicator or null while fetching user data
  if (isLoading) {
    return <div>Loading...</div>;  // You can replace this with a better loading UI
  }


  
  return (
    <Routes>
      <Route path='' element = {<Login/>}/>
      <Route path='signup' element= {<Signup/>} />
      <Route path="user-dashboard" element={<UserPrivateRoute><Dashboard /></UserPrivateRoute>} />
    </Routes>
  )
}

export default UserWrapper