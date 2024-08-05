const methodForm = document.querySelector("#search-method");
const searchField = document.querySelector("#search");
const weatherCurrent = document.querySelector("#current");
const forecastFuture = document.querySelector("#future");
const historyLocation = document.querySelector("#history");


const apiKey = "d780d0d22838166792e6ed1b63c9754f";
let historySearch = [];


function displayCurrentWeather(city, weather) {
  const dateToday = dayjs().format("MM/DD/YYYY");

  const temperatureF = weather.main.temp;
  const windSpeedMph = weather.wind.speed;
  const humidityPercent = weather.main.humidity;
  const iconSource = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  const iconDesc = weather.weather[0].description || weather[0].main;

  
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const title = document.createElement("h2");
  const weatherImg = document.createElement("img");
  const tempText = document.createElement("p");
  const windText = document.createElement("p");
  const humidityText = document.createElement("p");

  
  card.classList.add("card", "bg-dark", "text-white");
  cardBody.classList.add("card-body");
  title.classList.add("h3", "card-title");
  weatherImg.classList.add("weather-img");
  tempText.classList.add("card-text");
  windText.classList.add("card-text");
  humidityText.classList.add("card-text");


  title.textContent = `${city} (${dateToday})`;
  weatherImg.src = iconSource;
  weatherImg.alt = iconDesc;
  tempText.textContent = `Temp: ${temperatureF}°F`;
  windText.textContent = `Wind: ${windSpeedMph} MPH`;
  humidityText.textContent = `Humidity: ${humidityPercent} %`;


  title.append(weatherImg);
  cardBody.append(title, tempText, windText, humidityText);
  card.append(cardBody);
  weatherCurrent.innerHTML = "";
  weatherCurrent.append(card);
}


function displayForecastCard(forecast) {
  
  const iconSource = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  const iconDesc = forecast.weather[0].description;
  const temperatureF = forecast.main.temp;
  const humidityPercent = forecast.main.humidity;
  const windSpeedMph = forecast.wind.speed;

 
  const column = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherImg = document.createElement("img");
  const tempText = document.createElement("p");
  const windText = document.createElement("p");
  const humidityText = document.createElement("p");


  column.classList.add("col-md", "forecast-card");
  card.classList.add("card", "bg-secondary", "h-100", "text-white");
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempText.classList.add("card-text");
  windText.classList.add("card-text");
  humidityText.classList.add("card-text");


  cardTitle.textContent = dayjs(forecast.dt_txt).format("MM/DD/YYYY");
  weatherImg.setAttribute("src", iconSource);
  weatherImg.setAttribute("alt", iconDesc);
  tempText.textContent = `Temp: ${temperatureF} °F`;
  windText.textContent = `Wind: ${windSpeedMph} MPH`;
  humidityText.textContent = `Humidity: ${humidityPercent} %`;

 
  column.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherImg, tempText, windText, humidityText);
  forecastFuture.append(column);
}


function displayForecast(dailyForecast) {

  const startTimestamp = dayjs().add(1, "day").startOf("day").unix();
  const endTimestamp = dayjs().add(6, "day").startOf("day").unix();

 
  const headingColumn = document.createElement("div");
  headingColumn.classList.add("col-12");
  const heading = document.createElement("h4");
  heading.textContent = "5-Day Forecast:";
  headingColumn.append(heading);

 
  forecastFuture.innerHTML = "";
  forecastFuture.append(headingColumn);

 
  const filteredForecast = dailyForecast.filter((data) => {
    return (
      data.dt >= startTimestamp && data.dt < endTimestamp && data.dt_txt.slice(11, 13) == "12"
    );
  });
  filteredForecast.forEach(displayForecastCard);
}


function renderWeatherData(city, data) {
  displayCurrentWeather(city, data.list[0], data.city.timezone);
  displayForecast(data.list);
}


function getWeatherData(location) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${apiKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => renderWeatherData(location.name, data))
    .catch((err) => console.error(err));
}


async function getCoordinates(search) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data[0]) {
        addToHistory(search);
        getWeatherData(data[0]);
      } else {
        alert("Location not found");
      }
    })
    .catch((err) => console.error(err));
}


function displaySearchHistory() {
  historyLocation.innerHTML = "";

  
  for (let i = historySearch.length - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.classList.add("history-btn", "btn-secondary");

  
    btn.dataset.search = historySearch[i];
    btn.textContent = historySearch[i];
    historyLocation.append(btn);
  }
}

// Function to update history in local storage and update displayed search history
function addToHistory(search) {
  // If the search term is already in the search history, do nothing
  if (historySearch.includes(search)) {
    return;
  }
  historySearch.push(search);

  localStorage.setItem("search-history", JSON.stringify(historySearch));
  displaySearchHistory();
}

// Function to get search history from local storage
function initializeSearchHistory() {
  const storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    historySearch = JSON.parse(storedHistory);
  }
  displaySearchHistory();
}

// Function to handle the form submission for a search query
function handleFormSubmit(event) {
  event.preventDefault();
  const search = searchField.value.trim();
  if (search) {
    getCoordinates(search);
    searchField.value = "";
  }
}

// Function to handle a click on a search history button
function handleHistoryClick(event) {
  if (event.target.matches(".btn-secondary")) {
    const search = event.target.dataset.search;
    getCoordinates(search);
  }
}

// Initialize the search history when the script is first loaded
initializeSearchHistory();

// Add event listeners to the search form and the search history list to handle form submissions and clicks on search history buttons
methodForm.addEventListener("submit", handleFormSubmit);
historyLocation.addEventListener("click", handleHistoryClick);