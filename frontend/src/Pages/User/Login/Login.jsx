import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { set_user_basic_details } from "../../../Redux/UserDetailsSlice";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../constants/Constants";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const base_url = BASE_URL;
  const base_url = "https://weatherapp.backend.footvibe.store/";

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "username") {
      const alphaRegex = /^[a-zA-Z]+$/; // Only alphabetic characters allowed
      setUsername(value.trim());

      if (value.trim().length < 4 && value.trim().length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "Username must be longer than 3 characters",
        }));
      } else if (!alphaRegex.test(value.trim()) && value.trim().length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "Username must contain only alphabetic characters",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, username: "" }));
      }
    } else if (id === "password") {
      setPassword(value.trim());

      if (value.trim().length < 4 && value.trim().length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must be longer than 4 characters",
        }));
      } else if (value.includes(" ")) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password cannot contain spaces",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.username || errors.password) return;

    const loginData = {
      username: username,
      password: password,
    };

    try {
      const response = await axios.post(base_url + "auth/login/", loginData);

      if (response.status === 200) {
        const {
          access,
          refresh,
          is_superuser,
          username,
          email,
          id,
          is_authenticated,
        } = response.data;
        localStorage.setItem("access_token", access);
        console.log("acces tocken", access);
        localStorage.setItem("refresh_token", refresh);
        console.log("refresh tocken", refresh);

        const userData = {
          id: id,
          name: username,
          is_superuser: is_superuser,
          email: email,
          is_authenticated: is_authenticated,
        };

        toast.success("Login successful");
        dispatch(set_user_basic_details(userData));

        if (is_superuser) {
          navigate("/admin/dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        login: "Invalid username or password",
      }));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    console.log("google tocken:", credentialResponse.credential);

    try {
      console.log("Sending token to backend...");
      const response = await axios.post(base_url + "auth/google-login", {
        token,
      });
      console.log("Response from backend:", response);

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

        console.log("Response data:", response.data);

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

        console.log("User data:", userData);

        // Dispatch user details to the store
        dispatch(set_user_basic_details(userData));

        // Navigate based on user role
        if (is_superuser) {
          console.log("Navigating to admin dashboard...");
          navigate("/admin/dashboard");
          toast.success("User has successfully logged in");
        } else {
          console.log("Navigating to user dashboard...");
          navigate("/user-dashboard");
          toast.success("User has successfully logged in");
        }
      }
    } catch (error) {
      // Log error details for debugging
      console.error("Error occurred during login:", error);
      toast.error(error);

      // Check if the error is a 400 response (e.g., email already in use or other issues)
      if (error.response && error.response.status === 400) {
        const errorMessage =
          error.response.data?.error || "Invalid login attempt.";
        console.error("400 Error response:", error.response);
        toast.error(errorMessage);
      } else {
        // Handle other errors (500 or network-related errors)
        console.error("Other error occurred:", error);
        toast.error("An error occurred while logging in. Please try again.");
      }
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-purple-300 via-purple-400 to-blue-500">
      {/* Login Form */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-16 mx-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Welcome to WeatherApp</h2>
          <p className="text-black">
            Sign in to access the latest weather forecasts and insights.
          </p>
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={passwordVisible ? faEyeSlash : faEye}
                  className="text-gray-500"
                />
              </div>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={!!errors.username || !!errors.password}
          >
            Login
          </button>
        </form>

        {/* Google Login */}
        <div className="mt-4 flex justify-center">
          <GoogleOAuthProvider clientId="718063435397-dogv0560m9kv5jga6hukl1njmvikpmuc.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google login failed")}
              className="w-full"
            />
          </GoogleOAuthProvider>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
