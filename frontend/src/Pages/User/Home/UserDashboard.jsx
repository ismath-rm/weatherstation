import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faTemperatureHigh,
  faTint,
  faWind,
  faCloudRain,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { set_user_basic_details } from "../../../Redux/UserDetailsSlice";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [chartType, setChartType] = useState("line");
  const [weatherData, setWeatherData] = useState([]);
  const [todayWeather, setTodayWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [locationDetails, setLocationDetails] = useState({
    country: "Unknown",
    city: "Unknown",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(
      set_user_basic_details({
        id: null,
        name: null,
        email: null,
        is_superuser: false,
        is_authenticated: false,
      })
    );
    navigate("/");
  };

  const API_KEY = "1417d47aefb04546b44122035243009";

  useEffect(() => {
    const fetchWeatherData = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          "https://api.weatherapi.com/v1/forecast.json",
          {
            params: {
              key: API_KEY,
              q: `${latitude},${longitude}`,
              days: 3,
              aqi: "no",
            },
          }
        );

        const forecast = response.data.forecast.forecastday;
        const formattedData = forecast.map((day) => ({
          date: dayjs(day.date).format("dddd, DD MMMM"), // Format date as Friday, 28 ...
          avgTemp: day.day.avgtemp_c,
          avgHumidity: day.day.avghumidity,
          maxWindSpeed: day.day.maxwind_kph,
          condition: day.day.condition.text,
          icon: day.day.condition.icon, // Weather condition icon
        }));

        setWeatherData(formattedData);
        setTodayWeather({
          temperature: forecast[0].day.avgtemp_c,
          condition: forecast[0].day.condition.text,
          humidity: forecast[0].day.avghumidity,
          windSpeed: forecast[0].day.maxwind_kph,
          uvIndex: forecast[0].day.uv,
          precipitation: forecast[0].day.totalprecip_mm,
          icon: forecast[0].day.condition.icon,
          date: dayjs().format("dddd, DD MMMM"),
        });

        // Extract hourly forecast data for the second table
        const hourlyData = response.data.forecast.forecastday[0].hour
          .filter((hour) => {
            const hourTime = dayjs(hour.time).format("H");
            return [11, 13, 15, 17, 19].includes(parseInt(hourTime)); // Selecting specific times
          })
          .map((hour) => ({
            time: dayjs(hour.time).format("h:mm A"), // Format the time as 11:00 AM
            temp: hour.temp_c,
          }));

        setHourlyForecast(hourlyData);
        setLocationDetails({
          country: response.data.location.country,
          city: response.data.location.name,
        });
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];
  const ICONS = [faTemperatureHigh, faTint, faWind]; // Icons for temperature, humidity, wind

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-400 to-blue-500 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-transparent text-white py-4 px-6 flex items-center justify-between">
        <div className="flex-1 flex justify-center">
          <h1 className="text-black text-2xl md:text-3xl font-bold">
            Weather Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-black text-white p-2 rounded-full"
            aria-label="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div class="flex flex-col items-center justify-center w-full text-gray-700 p-4 md:p-10 bg-gradient-to-br from-purple-300 via-purple-400 to-blue-500">
        {/* Weather Card */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white p-6 rounded-xl ring-8 ring-white ring-opacity-40 mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-5xl md:text-6xl font-bold">
                {todayWeather.temperature}°C
              </span>
              <span className="font-semibold mt-1 text-gray-500">
                {locationDetails.city}, {locationDetails.country}
              </span>
              <span className="font-semibold mt-1 text-gray-500">
                {todayWeather.condition}
              </span>
              <span className="font-semibold mt-1 text-gray-500">
                {todayWeather.date}
              </span>{" "}
              {/* Today's Date */}
            </div>
            <img
              src={todayWeather.icon}
              alt="Weather Icon"
              className="h-20 w-20 md:h-24 md:w-24"
            />
          </div>
        </div>

        {/* Second Table with Hourly Forecast (Dynamic Data from API) */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white p-6 rounded-xl ring-8 ring-white ring-opacity-40 mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            {hourlyForecast.map((data, index) => (
              <div
                key={index}
                className="flex flex-col items-center mb-2 md:mb-0"
              >
                <span className="font-semibold text-lg">{data.temp}°C</span>
                <span className="font-semibold mt-1 text-sm">{data.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Third Table with Weather Forecast Data and Icons */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white p-6 rounded-xl ring-8 ring-white ring-opacity-40 mb-4 md:mb-8">
          {weatherData.map((data, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border-b border-gray-200"
            >
              <span className="font-semibold w-1/4">{data.date}</span>
              <FontAwesomeIcon icon={faTemperatureHigh} className="w-1/4" />
              <span className="w-1/4 font-semibold">{data.avgTemp}°C</span>
              <FontAwesomeIcon icon={faTint} className="w-1/4" />
              <span className="w-1/4 font-semibold">{data.avgHumidity}%</span>
              <FontAwesomeIcon icon={faWind} className="w-1/4" />
              <span className="w-1/4 font-semibold">
                {data.maxWindSpeed} km/h
              </span>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white p-6 rounded-xl ring-8 ring-white ring-opacity-40 mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Weather Forecast Chart
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded ${
                  chartType === "line"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded ${
                  chartType === "bar"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" && (
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgTemp" stroke="#8884d8" />
                <Line type="monotone" dataKey="avgHumidity" stroke="#82ca9d" />
                <Line type="monotone" dataKey="maxWindSpeed" stroke="#ffc658" />
              </LineChart>
            )}
            {chartType === "bar" && (
              <BarChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgTemp" fill="#8884d8" />
                <Bar dataKey="avgHumidity" fill="#82ca9d" />
                <Bar dataKey="maxWindSpeed" fill="#ffc658" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
