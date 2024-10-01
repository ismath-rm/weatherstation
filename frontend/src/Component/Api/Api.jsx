import axios from 'axios';
import { BASE_URL } from '../../constants/Constants';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Add other configurations like timeout, headers, etc., if needed
});

// Request interceptor to add token to the headers
axiosInstance.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = 'Bearer ' + accessToken;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Check if it’s a 401 error and retry flag is not set
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (!refreshToken) {
                console.error("No refresh token found in localStorage");
                return Promise.reject(error);
            }

            try {
                // Log the refresh attempt
                console.log("Attempting to refresh token...");

                const refreshResponse = await axios.post(`${BASE_URL}token/refresh/`, { refresh: refreshToken });

                if (refreshResponse.status === 200) {
                    const newAccessToken = refreshResponse.data.access;
                    const newRefreshToken = refreshResponse.data.refresh;

                    localStorage.setItem('access_token', newAccessToken);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

                    // Retry the original request with the new token
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Optionally, redirect to login page here
            }
        }

        // If it's not a 401 error or token refresh failed, reject the error
        return Promise.reject(error);
    }
);

export default axiosInstance;
