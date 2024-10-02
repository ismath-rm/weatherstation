  import React, { useState } from "react";
  import axios from "../../../Component/Api/Api";
  import { Link, useNavigate } from "react-router-dom";
  import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
  import { useDispatch } from "react-redux";
  import { set_user_basic_details } from "../../../Redux/UserDetailsSlice";
  import { toast } from "react-toastify";

  const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
      username: "",
      email: "",
      password: "",
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Handle input changes and validation
    const handleInputChange = (e) => {
      const { id, value } = e.target;
      if (id === "username") {
        setUsername(value.trim());
        setErrors((prevErrors) => ({
          ...prevErrors,
          username:
            value.trim().length < 3 && value.trim().length > 0
              ? "Username must be longer than 3 characters"
              : "",
        }));
      } else if (id === "email") {
        setEmail(value.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setErrors((prevErrors) => ({
          ...prevErrors,
          email:
            !emailRegex.test(value.trim()) && value.trim().length > 0
              ? "Invalid email address"
              : "",
        }));
      } else if (id === "password") {
        setPassword(value.trim());
        setErrors((prevErrors) => ({
          ...prevErrors,
          password:
            value.trim().length < 4 && value.trim().length > 0
              ? "Password must be longer than 4 characters"
              : "",
        }));
      }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (errors.username || errors.email || errors.password) return;
      console.log("Validation errors:", errors); 

      try {
        console.log("Sending signup request with data:", { username, email, password });
        const response = await axios.post("auth/signup/", {  // Include the trailing slash
          username,
          email,
          password,
        });

        console.log("Signup successful:", response.data);

        if (response.status === 201) {
          toast.success("Account created successfully!", { autoClose: 3000 });
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (error) {
        console.error("Signup failed:", error);
        if (error.response && error.response.data) {
          toast.error(error.response.data.error || "Signup failed", { autoClose: 3000 });
        } else {
          toast.error("Signup failed", { autoClose: 3000 });
        }
      }
  };

    const handleGoogleSuccess = async (credentialResponse) => {
      const token = credentialResponse.credential;
      try {
        const response = await axios.post("auth/google-login", { token });

        if (response.status === 200) {
          const {
            access,
            refresh,
            is_superuser,
            id,
            username,
            email,
            is_authenticated,
          } = response.data;

          // Store tokens and user details
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);

          const userData = {
            id: id,
            name: username,
            is_superuser: is_superuser,
            email: email,
            is_authenticated: is_authenticated,
          };

          // Dispatch user details to the store
          dispatch(set_user_basic_details(userData));

          // Show success toast
          toast.success("User has successfully logged in");

          // Navigate based on user role
          if (is_superuser) {
            navigate("/admin/dashboard");
          } else {
            navigate("/user-dashboard");
          }
        } else {
          // If status is not 200, show error toast (fallback case)
          toast.error("An unexpected error occurred during login.");
        }
      } catch (error) {
        // Log error details for debugging
        console.error("Error during Google login:", error);

        // Check if the error is a 400 response (e.g., email already in use or other issues)
        if (error.response && error.response.status === 400) {
          const errorMessage =
            error.response.data?.error || "Invalid login attempt.";
          toast.error(errorMessage);
        } else {
          // Handle other errors (500 or network-related errors)
          toast.error("An error occurred while logging in. Please try again.");
        }
      }
    };
    return (
      <div className="relative flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-green-200">
        {/* Add ToastContainer to display toasts */}
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-16 mx-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="font-bold mt-1">Create an account </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={!!errors.username || !!errors.email || !!errors.password}
          >
            Sign Up
          </button>

          <div className="mt-4 flex justify-center">
            <GoogleOAuthProvider clientId="718063435397-dogv0560m9kv5jga6hukl1njmvikpmuc.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Google login failed")}
                className="w-full"
              />
            </GoogleOAuthProvider>
          </div>
          </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Login
            </Link>
          
        </div>
        {/* </div> */}
      </div>
      </div>
    );
  };

  export default Signup;
