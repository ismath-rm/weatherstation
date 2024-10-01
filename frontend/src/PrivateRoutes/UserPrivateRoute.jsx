
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const UserPrivateRoute = ({ children }) => {
    const user_basic_details = useSelector((state) => state.user_basic_details);

    
    // If the user is not authenticated or their is_active field is false, redirect to login
    
        if (!user_basic_details.is_authenticated) {
            console.log("not authenticated")
            return <Navigate to="/" replace />;
        }

    
   

    // If authenticated, render the protected children components
    return children;
};

export default UserPrivateRoute;
