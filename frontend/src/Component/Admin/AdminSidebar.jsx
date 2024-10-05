import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowLeft, faTachometerAlt, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { set_user_basic_details } from '../../Redux/UserDetailsSlice';

const Sidebar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.clear(); 
    dispatch(
        set_user_basic_details({
            id : null,
            name: null,
            email: null,
            is_superuser: false,
            is_authenticated: false,
        })
    ); 
    navigate("/"); // Redirect to the login page
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? "block p-4 bg-purple-300 text-black flex items-center transition-colors duration-200" // Active link styles
      : "block p-4 text-white flex items-center transition-colors duration-200"; // No hover effect


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-black text-white flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-64"
        }`}
      >
        {/* Admin Panel title */}
        <div className="flex justify-between items-center p-4 text-2xl font-bold transition-opacity duration-300">
          <span className={`${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
            Admin Panel
          </span>
          {/* Toggle button when sidebar is open */}
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="text-white p-2 rounded-full shadow-lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
        </div>

        <nav className="flex-grow">
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className={navLinkClasses}>
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                <span className={`${isSidebarOpen ? "inline" : "hidden"}`}>
                  Dashboard
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/user-management" className={navLinkClasses}>
                <FontAwesomeIcon icon={faUsers} className="mr-3" />
                <span className={`${isSidebarOpen ? "inline" : "hidden"}`}>
                  Users
                </span>
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-4 hover:bg-gray-700 text-gray-300 flex items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                <span className={`${isSidebarOpen ? "inline" : "hidden"}`}>
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={`flex-grow bg-white shadow-lg rounded-lg  lg:w-3/4 ${
          isSidebarOpen ? "ml-64" : ""
        }`}
      >
        {/* Toggle button when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-0 left-4 text-black p-4 rounded-full shadow-lg mt-2"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}

        {children}
      </main>
    </div>
  );
};

export default Sidebar;