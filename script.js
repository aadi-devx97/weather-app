let currentUnit = "C";

async function getWeather() {
    const city = document.getElementById("cityInput").value;

    if (!city) {
        alert("Enter a city name");
        return;
    }

    const result = document.getElementById("weatherResult");
    const searchBtn = document.querySelector(".search-btn");
    const locationBtn = document.querySelector(".location-btn");

    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerText = "Loading...";
    }

    if (locationBtn) {
        locationBtn.disabled = true;
    }

    document.getElementById("mainWeather").innerHTML = "";
    document.getElementById("mainWeather").innerHTML = `<div class="spinner"></div>`;
    document.getElementById("weatherDetails").innerHTML = "";
    document.getElementById("forecast").innerHTML = "";

    const apiKey = "0ba36bc584981f5ac9f4bf03100deacf"

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod == "404") {
            document.getElementById("mainWeather").innerHTML = `
                <div class="error-box">
                    ❌ City not found
                </div>
            `;

            document.getElementById("weatherDetails").innerHTML = "";
            document.getElementById("forecast").innerHTML = "";

            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerText = "Search";
            }

            if (locationBtn) {
                locationBtn.disabled = false;
            }
            return;
        }

        displayWeather(data);
        localStorage.setItem("lastCity", city);
        getForecast(city);

        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerText = "Search";
        }

        if (locationBtn) {
            locationBtn.disabled = false;
        }
    } catch (error) {
        document.getElementById("mainWeather").innerHTML = `
            <div class="error-box">
                ⚠️ Something went wrong. Try again.
            </div>
        `;

        document.getElementById("weatherDetails").innerHTML = "";
        document.getElementById("forecast").innerHTML = "";

        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerText = "Search";
        }

        if (locationBtn) {
            locationBtn.disabled = false;
        }
    }
}

function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    const searchBtn = document.querySelector(".search-btn");
    const locationBtn = document.querySelector(".location-btn");

    if (locationBtn) {
        locationBtn.disabled = true;
    }

    if (searchBtn) {
        searchBtn.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const apiKey = "0ba36bc584981f5ac9f4bf03100deacf";

        const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

        let cityName = "Your Location";

        try {
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            cityName = geoData[0]?.name || "Your Location";
        } catch {
            console.log("Geo failed");
        }

        document.getElementById("cityInput").value = cityName;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const result = document.getElementById("weatherResult");

        // clear old content first
        document.getElementById("mainWeather").innerHTML = "";
        document.getElementById("weatherDetails").innerHTML = "";
        document.getElementById("forecast").innerHTML = "";

        // then show loading
        document.getElementById("mainWeather").innerHTML = `
            <div class="spinner"></div>
            <p style="text-align:center;">Getting your location...</p>
        `;

        try {
            const response = await fetch(url);

            const data = await response.json();

            displayWeather(data);

            getForecastByCoords(lat, lon);

            if (locationBtn) {
                locationBtn.disabled = false;
            }

            if (searchBtn) {
                searchBtn.disabled = false;
            }

        } catch (error) {
            result.innerHTML = `
                <p style="color:red;">
                    ⚠️ Failed to get location weather
                </p>
            `;

            if (locationBtn) {
                locationBtn.disabled = false;
            }
            if (searchBtn) {
                searchBtn.disabled = false;
            }
        }
    });
}

async function getForecastByCoords(lat, lon) {
    const apiKey = "0ba36bc584981f5ac9f4bf03100deacf";

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        displayForecast(data);
    } catch (error) {
        console.log("Forecast error:", error);
    }
}

function displayWeather(data) {
    const result = document.getElementById("weatherResult");

    const mainEL = document.getElementById("mainWeather");

    const detailsEL = document.getElementById("weatherDetails");

    if (!mainEL || !detailsEL) {
        return;
    }

    // remove old animation
    result.classList.remove("fade-in");

    // 🌈 Change background based on weather
    const weatherType = data.weather?.[0]?.main?.toLowerCase() || "clear";
    const body = document.body;

    const currentTime = Date.now() / 1000; // current time in seconds
    const isNight = currentTime > data.sys.sunset || currentTime < data.sys.sunrise;

    if (weatherType.includes("clear")) {
        if (isNight) {
            body.style.background = "linear-gradient(to right, #0f2027, #203a43, #2c5364)";
        } else {
            body.style.background = "linear-gradient(to right, #fceabb, #f8b500)";
        }
    }
    else if (weatherType.includes("cloud")) {
        body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
    } 
    else if (weatherType.includes("rain")) {
        body.style.background = "linear-gradient(to right, #4b79a1, #283e51)";
    } 
    else {
        body.style.background = "linear-gradient(to right, #00c6ff, #0072ff)";
    }

    // get sections

    const icon = data.weather[0].icon;

    // 🔥 MAIN SECTION
    let temp = data.main.temp;
    let feels = data.main.feels_like;

    if (currentUnit === "F") {
        temp = (temp * 9/5) + 32;
        feels = (feels * 9/5) + 32;
    }

    mainEL.innerHTML = `
        <h2>${data.name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:80px;" />
        <h1>${Math.round(temp)}°${currentUnit}</h1>
        <p>${data.weather[0].main}</p>
    `;

    // 📊 DETAILS SECTION
    detailsEL.innerHTML = `
        <div class="details-grid">
            <div>🤒 Feels Like<br><b>${Math.round(feels)}°${currentUnit}</b></div>
            <div>💧 Humidity<br><b>${data.main.humidity}%</b></div>
            <div>💨 Wind<br><b>${data.wind.speed} m/s</b></div>
            <div>🌡 Pressure<br><b>${data.main.pressure} hPa</b></div>
        </div>
    `;
    // add animation back
    result.classList.remove("fade-in");
    result.classList.add("fade-in");
}

async function getForecast(city) {
    const apiKey = "0ba36bc584981f5ac9f4bf03100deacf";

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        displayForecast(data);

    } catch (error) {
        console.log("Forecast error:", error);
    }
}

function displayForecast(data) {
    const forecastDiv = document.getElementById("forecast");

    if (!forecastDiv) {
        return;
    }

    let forecastHTML = `
        <h3>Next Hours Forecast:</h3>
        <div class="forecast-container">
    `;

    data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const icon = item.weather[0].icon;

        forecastHTML += `
            <div class="forecast-card">
                <p><b>${time}</b></p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
                <p>${item.main.temp}°C</p>
                <p>${item.weather[0].main}</p>
            </div>
        `;
    });

    forecastHTML += `</div>`;

    forecastDiv.innerHTML = forecastHTML;
}

function toggleUnit() {
    if (currentUnit === "C") {
        currentUnit = "F";
    } else {
        currentUnit = "C";
    }

    localStorage.setItem("unit", currentUnit);

    updateUnitButton();

    const city = document.getElementById("cityInput").value;

    if (city) {
        getWeather();
    }
}

function updateUnitButton() {
    const btn = document.getElementById("unitBtn");

    if (currentUnit === "C") {
        btn.innerText = "Switch to °F";
    } else {
        btn.innerText = "Switch to °C";
    }
}

document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        getWeather();
    }
});

document.getElementById("mainWeather").innerHTML = `
    <p style="opacity:0.6;">Search a city to see weather 🌍</p>
`;

window.onload = () => {
    const savedUnit = localStorage.getItem("unit");

    if (savedUnit) {
        currentUnit = savedUnit;
    }

    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        document.getElementById("cityInput").value = lastCity;
        getWeather();
    }

    updateUnitButton();
};