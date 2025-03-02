import { useState } from "react";
import {
  FaSearch,
  FaExclamationCircle,
  FaCloudRain,
  FaTemperatureLow,
  FaSun,
  FaCloudSun,
} from "react-icons/fa";
import { fetchData } from "../services/api-client.js";
import "../WeatherDisplay.css";
import { PulseLoader } from "react-spinners";

const SearchInput = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const getTemperatureValue = (tempString) => {
    return parseInt(tempString.replace("°C", ""), 10);
  };

  const getTemperatureColor = (temp) => {
    if (temp < 20) {
      return "#1E90FF";
    } else if (temp >= 20 && temp < 28) {
      return "#98FB98";
    } else if (temp >= 28 && temp < 33) {
      return "orange";
    } else {
      return "red";
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const weatherData = await fetchData("/data/locations.json");

      if (!location.trim()) {
        setData(weatherData);
        setError(null);
        return;
      }

      const result = weatherData.filter((item) =>
        item.city.toLowerCase().includes(location.toLowerCase())
      );

      if (result.length > 0) {
        setData(result);
        setError(null);
      } else {
        setData([]);
        setError("City not found");
      }
    } catch (err) {
      setError("Failed to fetch data", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="search-container sm:w-[100%] xs:flex-col md:w-[80%] md:flex-row">
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter location ..."
          className="search-input xs:w-[100%] md:w-[75%]"
        />
        <button className="search-button" onClick={handleSearch}>
          <FaSearch style={{ fontSize: "12px" }} /> Search
        </button>
      </div>

      {loading && (
        <PulseLoader
          loading={loading}
          color={"#fff"}
          size={20}
          aria-label="Loading Spinner"
          data-testid="loader"
        >
          <p>Loading...</p>
        </PulseLoader>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationCircle />
          <p>{error}</p>
        </div>
      )}

      <div className="cards-wrapper">
        {data &&
          data.map((item, index) => (
            <div
              key={index}
              className="weather-card xs:flex-col xs:gap-3 md:flex-row md:gap-3 xs:p-[.5rem] md:p-[.75rem] lg:p-[1rem]"
            >
              <div className="card-header">
                <h2 className="city">{item.city}</h2>
              </div>
              <div className="card-content xs:w-[100%] xs:flex-col xs:gap-3 sm:flex-row sm:w-[75%]">
                <div className="temp-info xs:w-[100%] sm:w-[50%] md:w-[180px] lg:w-[200px]">
                  <FaTemperatureLow
                    style={{
                      color: getTemperatureColor(
                        getTemperatureValue(item.temperature)
                      ),
                    }}
                  />
                  <p className="text-2xl">{item.temperature}</p>
                </div>
                <div className="weather-info xs:w-[100%] sm:w-[50%] md:w-[180px] lg:w-[200px]">
                  {item.weather === "Rainy" ? (
                    <FaCloudRain />
                  ) : item.weather === "Sunny" ? (
                    <FaSun />
                  ) : (
                    <FaCloudSun />
                  )}
                  <p>{item.weather}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default SearchInput;
