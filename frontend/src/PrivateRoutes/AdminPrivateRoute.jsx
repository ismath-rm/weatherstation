import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


const AdminPrivateRoute = ({children}) => {
    const user_basic_details = useSelector((state) => state.user_basic_details);

    
    // If the user is not authenticated or their is_active field is false, redirect to login
    
        if (!user_basic_details?.is_authenticated && !user_basic_details?.is_superuser
        ) {
            return <Navigate to="/" replace />;
        }

    
   

    // If authenticated, render the protected children components
    return children;
};


export default AdminPrivateRoute