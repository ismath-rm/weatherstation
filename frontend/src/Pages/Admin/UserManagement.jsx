import React, { useEffect, useState } from 'react';
import axios from '../../Component/Api/Api';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/superadmin/user-management');
        const data = response.data; // Ensure this is an array of user objects
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Send PATCH request with the userId in the request body
      const response = await axios.patch(`/superadmin/user-management`, {
        userId: userId,
        is_active: !currentStatus, // Toggling the active status
      });

      if (response.status === 200) {
        // Update the user status in the frontend based on the response
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, is_active: !user.is_active } : user
        );
        setUsers(updatedUsers);

        // Show appropriate toast notification based on the new user status
        const updatedUser = updatedUsers.find(user => user.id === userId);
        if (updatedUser.is_active) {
          toast.success("User has been unblocked successfully");
        } else {
          toast.error("User has been blocked successfully");
        }
      } else {
        console.error("Failed to update user status.");
        toast.error("Failed to update user status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("An error occurred while updating the user status.");
    }
  };

  return (
    <div className="w-full overflow-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-800 text-white text-center">Name</th>
            <th className="py-2 px-4 bg-gray-800 text-white text-center">Email</th>
            <th className="py-2 px-4 bg-gray-800 text-white text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2 px-4 text-center align-middle">{user.username}</td>
              <td className="py-2 px-4 text-center align-middle">{user.email}</td>
              <td className="py-2 px-4 text-center align-middle">
                <button
                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                  className={`p-2 rounded ${
                    user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {user.is_active ? (
                    <>
                      <LockOpenIcon className="h-5 w-5 inline" />
                      {' Active'}
                    </>
                  ) : (
                    <>
                      <LockIcon className="h-5 w-5 inline" />
                      {' Blocked'}
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LockIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LockOpenIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export default UserManagement;