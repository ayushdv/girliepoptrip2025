// ─────────────────────────────────────────────────────────────
// 1. DARK MODE TOGGLE
// ─────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById("theme-toggle");
const rootElement = document.documentElement; // <html> element

// Check if user has a saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  rootElement.setAttribute("data-theme", savedTheme);
  themeToggleBtn.textContent =
    savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Toggle function
themeToggleBtn.addEventListener("click", () => {
  const currentTheme = rootElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    rootElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  } else {
    rootElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggleBtn.textContent = "☀️ Light Mode";
  }
});

// ─────────────────────────────────────────────────────────────
// 2. INITIALIZE LEAFLET MAP
// ─────────────────────────────────────────────────────────────
// Center coordinates roughly in the middle of India
const indiaCenter = [22.5937, 78.9629];
const map = L.map("map", {
  center: indiaCenter,
  zoom: 5,
  zoomControl: false, // we’ll add our own zoom control style
});

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Custom zoom control placement
L.control
  .zoom({
    position: "topright",
  })
  .addTo(map);

// Marker data for your trip cities
const cities = [
  {
    name: "Delhi",
    coords: [28.6139, 77.2090],
    date: "2025-11-23 to 2025-11-25",
  },
];

// Loop through cities and add markers
cities.forEach((city) => {
  const marker = L.marker(city.coords).addTo(map);
  marker.bindPopup(
    `<strong>${city.name}</strong><br>${city.date}`
  );
});

// ─────────────────────────────────────────────────────────────
// 3. FULLCALENDAR (Itinerary Calendar)
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Fetch the JSON itinerary file
  fetch("data/itinerary.json")
    .then((response) => response.json())
    .then((events) => {
      // Initialize FullCalendar
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        themeSystem: "standard",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        events: events,
        // Minimalist styling
        eventColor: "#ff69b4",
        eventTextColor: "#ffffff",
      });
      calendar.render();
    })
    .catch((error) => {
      console.error("Error loading itinerary:", error);
      calendarEl.innerHTML = "<p>Unable to load itinerary.</p>";
    });
});

// ─────────────────────────────────────────────────────────────
// 4. WEATHER FORECAST (OpenWeatherMap)
// ─────────────────────────────────────────────────────────────
const weatherContainer = document.getElementById("weather-cards");

// Your OpenWeatherMap API key (replace with your own!)
const OPENWEATHER_API_KEY = "02b0eb085eecd46e3c9ec65c50e28352";

const weatherCities = [
  { name: "Delhi", coords: { lat: 28.6139, lon: 77.209 } },
];

// Helper: Create a single weather card
function createWeatherCard(name, tempC, iconCode) {
  const card = document.createElement("div");
  card.classList.add("weather-card");

  const cityEl = document.createElement("h3");
  cityEl.textContent = name;
  card.appendChild(cityEl);

  const iconEl = document.createElement("img");
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.alt = "weather icon";
  iconEl.style.width = "60px";
  iconEl.style.height = "60px";
  card.appendChild(iconEl);

  const tempEl = document.createElement("p");
  tempEl.textContent = `${tempC.toFixed(1)}°C`;
  card.appendChild(tempEl);

  return card;
}

// Fetch weather for each city
weatherCities.forEach((city) => {
  const { lat, lon } = city.coords;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const tempC = data.main.temp;
      const iconCode = data.weather[0].icon;
      const card = createWeatherCard(city.name, tempC, iconCode);
      weatherContainer.appendChild(card);
    })
    .catch((err) => {
      console.error(`Weather fetch failed for ${city.name}:`, err);
    });
});
