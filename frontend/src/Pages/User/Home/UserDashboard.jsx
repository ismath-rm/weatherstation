import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  BarChart,
  PieChart,
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
} from "@fortawesome/free-solid-svg-icons"; // Import icons
import { useSelector, useDispatch } from "react-redux";
import { set_user_basic_details } from "../../../Redux/UserDetailsSlice";
import dayjs from "dayjs"; // For date formatting
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [chartType, setChartType] = useState("line");
  const [weatherData, setWeatherData] = useState([]);
  const [todayWeather, setTodayWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]); // For the second table
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
    navigate("/"); // Redirect to the login page
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
              q: `${latitude},${longitude}`, // Pass latitude and longitude to get weather data based on user's location
              days: 14,
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
          icon: forecast[0].day.condition.icon, // Icon for today's weather
          date: dayjs().format("dddd, DD MMMM"), // Today's date
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weather Dashboard</h1>

        <div className="flex items-center space-x-4">
          <div className="relative inline-block">
            <select
              className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer focus:outline-none"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
            aria-label="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </header>

      <div className="text-center mt-2">
        <h3 className="text-xl font-semi-bold">
          Weather Forecast For The Next 14 Days :
        </h3>
      </div>

      {/* Main content */}
      <main className="flex-grow p-8 bg-white shadow-lg rounded-lg mt-4 mx-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
        </h2>

        {/* Line Chart */}
        {chartType === "line" && weatherData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weatherData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTemp"
                stroke="#8884d8"
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="avgHumidity"
                stroke="#82ca9d"
                name="Humidity (%)"
              />
              <Line
                type="monotone"
                dataKey="maxWindSpeed"
                stroke="#ffc658"
                name="Wind Speed (km/h)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Bar Chart */}
        {chartType === "bar" && weatherData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={weatherData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTemp" fill="#8884d8" name="Temperature (°C)" />
              <Bar dataKey="avgHumidity" fill="#82ca9d" name="Humidity (%)" />
              <Bar
                dataKey="maxWindSpeed"
                fill="#ffc658"
                name="Wind Speed (km/h)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Pie Chart */}
        {chartType === "pie" && weatherData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Average Temperature (°C)",
                    value:
                      weatherData.reduce((sum, data) => sum + data.avgTemp, 0) /
                        weatherData.length || 0,
                  },
                  {
                    name: "Average Humidity (%)",
                    value:
                      weatherData.reduce(
                        (sum, data) => sum + data.avgHumidity,
                        0
                      ) / weatherData.length || 0,
                  },
                  {
                    name: "Total Wind Speed (km/h)",
                    value:
                      weatherData.reduce(
                        (sum, data) => sum + data.maxWindSpeed,
                        0
                      ) || 0,
                  },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
