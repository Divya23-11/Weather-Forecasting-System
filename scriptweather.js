const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");

const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "cd4d6778c265b5f2b4326cbc701a9135";

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const iconUrl = index === 0 
        ? `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`
        : `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;

    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="${iconUrl}" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else {
        return `
            <li class="card">
                <h3>${date}</h3>
                <img src="${iconUrl}" alt="weather-icon">
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];

            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather details!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name, lat, lon } = data[0];
                    getWeatherDetails(name, lat, lon);
                })
                .catch(() => {
                    alert("An error occurred while fetching your location!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location access and try again.");
            } else {
                alert("Unable to retrieve your location.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") getCityCoordinates();
});
