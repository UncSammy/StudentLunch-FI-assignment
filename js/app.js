const API_BASE = "https://media2.edu.metropolia.fi/restaurant";

const state = {
  restaurants: [],
  filteredRestaurants: [],
  selectedRestaurant: null,
  menuType: "daily",
  user: null,
  nearestId: null,
  usingDemoData: false
};

const DEMO_RESTAURANTS = [
  {
    id: "demo-1", name: "Restaurant Metropolia Myllypuro", city: "Helsinki",
    provider: "Sodexo", address: "Myllypurontie 1, Helsinki", lat: 60.2239, lon: 25.0806,
    menus: {
      daily: [{date: new Date().toISOString().slice(0,10), items: [
        {name:"Chicken curry with rice", diets:"L, A"},
        {name:"Vegetable pasta", diets:"L"},
        {name:"Salad buffet", diets:"G"}
      ]}],
      weekly: [
        {date:"Monday", items:["Chicken curry with rice","Vegetable pasta"]},
        {date:"Tuesday", items:["Salmon soup","Bean stew"]},
        {date:"Wednesday", items:["Pasta bolognese","Vegetable lasagne"]},
        {date:"Thursday", items:["Chicken fajitas","Chickpea curry"]},
        {date:"Friday", items:["Fish & potatoes","Vegetable rice bowl"]}
      ]
    }
  },
  {
    id: "demo-2", name: "Restaurant Metropolia Myyrmäki", city: "Vantaa",
    provider: "Sodexo", address: "Leiritie 1, Vantaa", lat: 60.2585, lon: 24.8448,
    menus: { daily: [{date:new Date().toISOString().slice(0,10), items:[{name:"Tomato chicken pasta",diets:"L"},{name:"Vegetable soup",diets:"VEG"}]}],
      weekly:[{date:"Monday",items:["Tomato chicken pasta","Vegetable soup"]},{date:"Tuesday",items:["Fish soup","Lentil stew"]},{date:"Wednesday",items:["Chicken noodles","Vegetable noodles"]},{date:"Thursday",items:["Beef stew","Vegetable curry"]},{date:"Friday",items:["Pizza","Vegan pizza"]}]}
  },
  {
    id: "demo-3", name: "Restaurant Luova", city: "Helsinki",
    provider: "Food & co.", address: "Hämeentie 135, Helsinki", lat: 60.2077, lon: 24.9750,
    menus: { daily:[{date:new Date().toISOString().slice(0,10),items:[{name:"Creamy salmon pasta",diets:"L"},{name:"Vegetable risotto",diets:"VEG"}]}],
      weekly:[{date:"Monday",items:["Creamy salmon pasta","Vegetable risotto"]},{date:"Tuesday",items:["Chicken soup","Tofu stir fry"]},{date:"Wednesday",items:["Meatballs and mash","Bean patties"]},{date:"Thursday",items:["Salmon and potatoes","Vegetable couscous"]},{date:"Friday",items:["Chicken burger","Vegan burger"]}]}
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  loadUser();
  bindEvents();
  await loadRestaurants();
  renderFilters();
  applyFilters();
  renderProfile();
}

function bindEvents() {
  $("#searchInput").addEventListener("input", applyFilters);
  $("#cityFilter").addEventListener("change", applyFilters);
  $("#providerFilter").addEventListener("change", applyFilters);
  $("#favoritesOnly").addEventListener("change", applyFilters);
  $("#locationButton").addEventListener("click", findNearest);
  $("#loginButton").addEventListener("click", openAuth);
  $("#profileLoginButton").addEventListener("click", openAuth);
  $("#logoutButton").addEventListener("click", logout);
  $("#profileForm").addEventListener("submit", saveProfile);
  $("#profilePicture").addEventListener("change", saveProfilePicture);
  $("#restaurantList").addEventListener("click", handleRestaurantAction);
  $("#mapList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-id]");
    if (button) selectMapRestaurant(button.dataset.mapId);
  });
  $$("#menuModal [data-close-modal]").forEach(el => el.addEventListener("click", closeMenuModal));
  $$("#authModal [data-close-auth]").forEach(el => el.addEventListener("click", closeAuth));
  $$("#menuModal .tab").forEach(tab => tab.addEventListener("click", () => {
    $$("#menuModal .tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    state.menuType = tab.dataset.menuType;
    if (state.selectedRestaurant) loadMenu(state.selectedRestaurant, state.menuType);
  }));
  $$("#authModal .tab").forEach(tab => tab.addEventListener("click", () => {
    $$("#authModal .tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    setAuthMode(tab.dataset.authType);
  }));
  $("#authForm").addEventListener("submit", handleAuth);
}

async function loadRestaurants() {
  const candidates = [
    `${API_BASE}/restaurants`,
    `${API_BASE}/api/restaurants`,
    `${API_BASE}/api/v1/restaurants`,
    API_BASE
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!response.ok) continue;
      const data = await response.json();
      const list = extractArray(data);
      if (list.length) {
        state.restaurants = list.map(normalizeRestaurant).filter(r => r.name);
        state.usingDemoData = false;
        $("#apiNotice").classList.add("hidden");
        return;
      }
    } catch (error) {
      // Try the next documented/compatible endpoint.
    }
  }

  state.restaurants = DEMO_RESTAURANTS.map(normalizeRestaurant);
  state.usingDemoData = true;
  $("#apiNotice").textContent = "The Metropolia API could not be reached from this browser right now. Demo data is shown so the UI can still be tested. The deployed application will use the API when it is available.";
  $("#apiNotice").classList.remove("hidden");
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  const keys = ["restaurants", "data", "items", "results"];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.[key]?.restaurants)) return data[key].restaurants;
  }
  return [];
}

function normalizeRestaurant(raw) {
  const coordinates = raw.coordinates || raw.location || {};
  return {
    id: String(raw.id ?? raw.restaurantId ?? raw._id ?? crypto.randomUUID()),
    name: raw.name ?? raw.restaurantName ?? raw.title ?? "Unnamed restaurant",
    city: raw.city ?? raw.locality ?? raw.town ?? "",
    provider: raw.provider ?? raw.serviceProvider ?? raw.company ?? raw.operator ?? "",
    address: raw.address ?? raw.streetAddress ?? raw.street ?? "",
    lat: Number(raw.lat ?? raw.latitude ?? coordinates.lat ?? coordinates.latitude),
    lon: Number(raw.lon ?? raw.lng ?? raw.longitude ?? coordinates.lon ?? coordinates.longitude),
    raw
  };
}

function renderFilters() {
  fillSelect("#cityFilter", unique(state.restaurants.map(r => r.city).filter(Boolean)));
  fillSelect("#providerFilter", unique(state.restaurants.map(r => r.provider).filter(Boolean)));
}

function fillSelect(selector, values) {
  const select = $(selector);
  const first = select.firstElementChild;
  select.innerHTML = "";
  select.appendChild(first);
  values.sort((a,b) => a.localeCompare(b)).forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function applyFilters() {
  const search = $("#searchInput").value.trim().toLowerCase();
  const city = $("#cityFilter").value;
  const provider = $("#providerFilter").value;
  const favoritesOnly = $("#favoritesOnly").checked;
  const favorites = getFavorites();

  state.filteredRestaurants = state.restaurants.filter(r => {
    const textMatch = !search || `${r.name} ${r.city} ${r.provider} ${r.address}`.toLowerCase().includes(search);
    return textMatch && (!city || r.city === city) && (!provider || r.provider === provider) && (!favoritesOnly || favorites.includes(r.id));
  });

  renderRestaurants();
  renderMapList();
  $("#restaurantCount").textContent = `${state.filteredRestaurants.length} restaurant${state.filteredRestaurants.length === 1 ? "" : "s"}`;
}

function renderRestaurants() {
  const container = $("#restaurantList");
  container.innerHTML = "";
  if (!state.filteredRestaurants.length) {
    container.innerHTML = `<div class="empty-state"><strong>No restaurants found.</strong><br>Try changing the filters.</div>`;
    return;
  }

  state.filteredRestaurants.forEach(restaurant => {
    const card = document.createElement("article");
    card.className = `restaurant-card ${state.nearestId === restaurant.id ? "nearest" : ""}`;
    const favorite = getFavorites().includes(restaurant.id);
    card.innerHTML = `
      <div class="card-top">
        <div>
          <span class="badge">${escapeHtml(restaurant.city || "Finland")}</span>
          <h3>${escapeHtml(restaurant.name)}</h3>
        </div>
        <button class="favorite-button ${favorite ? "active" : ""}" title="${favorite ? "Remove favourite" : "Add favourite"}" data-action="favorite" data-id="${escapeAttr(restaurant.id)}" aria-label="${favorite ? "Remove favourite" : "Add favourite"}">${favorite ? "★" : "☆"}</button>
      </div>
      <div class="card-meta">
        <div>${escapeHtml(restaurant.provider || "Service provider not available")}</div>
        <div>${escapeHtml(restaurant.address || "Address not available")}</div>
        ${state.nearestId === restaurant.id ? '<strong>📍 Nearest restaurant</strong>' : ""}
      </div>
      <div class="card-actions">
        <button class="button" data-action="menu" data-id="${escapeAttr(restaurant.id)}">View menu</button>
        <button class="button button-outline" data-action="map" data-id="${escapeAttr(restaurant.id)}">Show map</button>
      </div>`;
    container.appendChild(card);
  });
}

function handleRestaurantAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const restaurant = state.restaurants.find(r => r.id === button.dataset.id);
  if (!restaurant) return;

  if (button.dataset.action === "favorite") toggleFavorite(restaurant.id);
  if (button.dataset.action === "menu") openMenu(restaurant);
  if (button.dataset.action === "map") {
    selectMapRestaurant(restaurant.id);
    $("#map").scrollIntoView({ behavior: "smooth" });
  }
}

function getFavorites() {
  if (!state.user) return [];
  const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
  return users[state.user.email]?.favorites || [];
}

function toggleFavorite(id) {
  if (!state.user) {
    openAuth();
    showToast("Login to save favourite restaurants.");
    return;
  }
  const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
  const account = users[state.user.email];
  account.favorites = account.favorites || [];
  account.favorites = account.favorites.includes(id)
    ? account.favorites.filter(item => item !== id)
    : [...account.favorites, id];
  users[state.user.email] = account;
  localStorage.setItem("studentLunchUsers", JSON.stringify(users));
  applyFilters();
}

function renderMapList() {
  const container = $("#mapList");
  container.innerHTML = "";
  state.filteredRestaurants.forEach(r => {
    const button = document.createElement("button");
    button.className = "map-list-item";
    button.dataset.mapId = r.id;
    button.innerHTML = `<strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.city)} · ${escapeHtml(r.address)}</span>`;
    container.appendChild(button);
  });
}

function selectMapRestaurant(id) {
  const restaurant = state.restaurants.find(r => r.id === id);
  if (!restaurant || !Number.isFinite(restaurant.lat) || !Number.isFinite(restaurant.lon)) {
    showToast("This restaurant has no map coordinates in the API data.");
    return;
  }
  const delta = 0.025;
  const bbox = `${restaurant.lon-delta}%2C${restaurant.lat-delta}%2C${restaurant.lon+delta}%2C${restaurant.lat+delta}`;
  $("#mapFrame").src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${restaurant.lat}%2C${restaurant.lon}`;
  $("#mapExternalLink").href = `https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}#map=16/${restaurant.lat}/${restaurant.lon}`;
  $$(".map-list-item").forEach(item => item.classList.toggle("active", item.dataset.mapId === id));
}

async function openMenu(restaurant) {
  state.selectedRestaurant = restaurant;
  state.menuType = "daily";
  $$("#menuModal .tab").forEach(tab => tab.classList.toggle("active", tab.dataset.menuType === "daily"));
  $("#menuTitle").textContent = restaurant.name;
  $("#menuModal").classList.remove("hidden");
  $("#menuModal").setAttribute("aria-hidden", "false");
  await loadMenu(restaurant, "daily");
}

function closeMenuModal() {
  $("#menuModal").classList.add("hidden");
  $("#menuModal").setAttribute("aria-hidden", "true");
}

async function loadMenu(restaurant, type) {
  const container = $("#menuContent");
  container.innerHTML = `<p class="muted">Loading ${type} menu…</p>`;

  if (state.usingDemoData && restaurant.raw?.menus) {
    renderMenuData(restaurant.raw.menus[type] || [], type);
    return;
  }

  const id = encodeURIComponent(restaurant.id);
  const today = new Date().toISOString().slice(0, 10);
  const week = getIsoWeek(new Date());
  const candidates = type === "daily"
    ? [
        `${API_BASE}/restaurants/${id}/menu?date=${today}`,
        `${API_BASE}/restaurants/${id}/daily?date=${today}`,
        `${API_BASE}/restaurant/${id}/menu?date=${today}`,
        `${API_BASE}/restaurant/${id}/daily?date=${today}`,
        `${API_BASE}/menu/${id}?date=${today}`
      ]
    : [
        `${API_BASE}/restaurants/${id}/weekly?week=${week}`,
        `${API_BASE}/restaurants/${id}/menu/weekly?week=${week}`,
        `${API_BASE}/restaurant/${id}/weekly?week=${week}`,
        `${API_BASE}/restaurant/${id}/menu/weekly?week=${week}`,
        `${API_BASE}/menu/${id}/weekly?week=${week}`
      ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!response.ok) continue;
      const data = await response.json();
      const menu = normalizeMenu(data);
      if (menu.length) {
        renderMenuData(menu, type);
        return;
      }
    } catch (error) {}
  }

  container.innerHTML = `<div class="empty-state"><strong>Menu data is not available.</strong><br>Check the API endpoint used in class. The restaurant list is loaded from the Metropolia REST API when available.</div>`;
}

function normalizeMenu(data) {
  const source = Array.isArray(data) ? data : (data?.menu || data?.menus || data?.data || data?.items || []);
  if (!Array.isArray(source)) return [];
  return source.map(day => {
    const items = day.items || day.dishes || day.meals || day.menuItems || (typeof day === "string" ? [day] : []);
    return {
      date: day.date || day.day || day.name || "",
      items: Array.isArray(items) ? items.map(item => typeof item === "string" ? {name:item,diets:""} : {
        name: item.name || item.title || item.meal || item.description || "Menu item",
        diets: item.diets || item.diet || item.allergens || ""
      }) : []
    };
  }).filter(day => day.items.length);
}

function renderMenuData(menu, type) {
  const container = $("#menuContent");
  container.innerHTML = "";
  menu.forEach(day => {
    const section = document.createElement("div");
    section.className = "menu-day";
    const heading = document.createElement("h4");
    heading.textContent = day.date || (type === "daily" ? "Today" : "Menu");
    section.appendChild(heading);
    day.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "menu-item";
      row.innerHTML = `<span>${escapeHtml(item.name)}</span><span class="diet">${escapeHtml(item.diets)}</span>`;
      section.appendChild(row);
    });
    container.appendChild(section);
  });
}

function loadUser() {
  const email = localStorage.getItem("studentLunchCurrentUser");
  if (!email) return;
  const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
  if (users[email]) state.user = users[email];
}

function saveProfile(event) {
  event.preventDefault();
  if (!state.user) return;
  const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
  const oldEmail = state.user.email;
  const updated = {
    ...users[oldEmail],
    name: $("#profileName").value.trim(),
    email: $("#profileEmail").value.trim().toLowerCase(),
    city: $("#profileCity").value.trim()
  };
  if (!updated.email) return;
  if (updated.email !== oldEmail && users[updated.email]) {
    $("#profileStatus").textContent = "That email is already registered.";
    return;
  }
  delete users[oldEmail];
  users[updated.email] = updated;
  localStorage.setItem("studentLunchUsers", JSON.stringify(users));
  localStorage.setItem("studentLunchCurrentUser", updated.email);
  state.user = updated;
  renderProfile();
  $("#profileStatus").textContent = "Profile saved.";
}

function saveProfilePicture(event) {
  if (!state.user || !event.target.files[0]) return;
  const file = event.target.files[0];
  if (!file.type.startsWith("image/")) return;
  if (file.size > 2 * 1024 * 1024) {
    $("#profileStatus").textContent = "Please choose an image smaller than 2 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
    users[state.user.email].picture = reader.result;
    state.user.picture = reader.result;
    localStorage.setItem("studentLunchUsers", JSON.stringify(users));
    renderProfile();
  };
  reader.readAsDataURL(file);
}

function renderProfile() {
  const loggedOut = $("#profileLoggedOut");
  const form = $("#profileForm");
  if (!state.user) {
    loggedOut.classList.remove("hidden");
    form.classList.add("hidden");
    $("#loginButton").classList.remove("hidden");
    $("#logoutButton").classList.add("hidden");
    return;
  }
  loggedOut.classList.add("hidden");
  form.classList.remove("hidden");
  $("#loginButton").classList.add("hidden");
  $("#logoutButton").classList.remove("hidden");
  $("#profileName").value = state.user.name || "";
  $("#profileEmail").value = state.user.email || "";
  $("#profileCity").value = state.user.city || "";
  $("#profileNameHeading").textContent = state.user.name || "Profile";
  $("#profileEmailHeading").textContent = state.user.email;
  $("#profileImage").src = state.user.picture || makeAvatar(state.user.name || "Student");
}

function openAuth() {
  $("#authModal").classList.remove("hidden");
  $("#authModal").setAttribute("aria-hidden", "false");
  setAuthMode("login");
}

function closeAuth() {
  $("#authModal").classList.add("hidden");
  $("#authModal").setAttribute("aria-hidden", "true");
}

function setAuthMode(mode) {
  const register = mode === "register";
  $("#authTitle").textContent = register ? "Create your account" : "Welcome back";
  $("#authNameLabel").classList.toggle("hidden", !register);
  $("#authName").required = register;
  $("#authSubmit").textContent = register ? "Register" : "Login";
  $("#authStatus").textContent = "";
  $("#authForm").dataset.mode = mode;
}

function handleAuth(event) {
  event.preventDefault();
  const mode = $("#authForm").dataset.mode || "login";
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const name = $("#authName").value.trim();
  const users = JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");

  if (mode === "register") {
    if (users[email]) {
      $("#authStatus").textContent = "An account with this email already exists.";
      return;
    }
    users[email] = { name, email, password, city: "", picture: "", favorites: [] };
    localStorage.setItem("studentLunchUsers", JSON.stringify(users));
    state.user = users[email];
  } else {
    if (!users[email] || users[email].password !== password) {
      $("#authStatus").textContent = "Incorrect email or password.";
      return;
    }
    state.user = users[email];
  }
  localStorage.setItem("studentLunchCurrentUser", state.user.email);
  closeAuth();
  renderProfile();
  applyFilters();
  showToast(`Welcome, ${state.user.name || state.user.email}`);
}

function logout() {
  localStorage.removeItem("studentLunchCurrentUser");
  state.user = null;
  $("#favoritesOnly").checked = false;
  renderProfile();
  applyFilters();
  showToast("You have been logged out.");
}

function findNearest() {
  if (!navigator.geolocation) {
    $("#locationStatus").textContent = "Geolocation is not supported by this browser.";
    return;
  }
  $("#locationStatus").textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      let nearest = null;
      let nearestDistance = Infinity;
      state.restaurants.forEach(r => {
        if (!Number.isFinite(r.lat) || !Number.isFinite(r.lon)) return;
        const distance = haversine(latitude, longitude, r.lat, r.lon);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = r;
        }
      });
      if (!nearest) {
        $("#locationStatus").textContent = "No restaurants with coordinates were found.";
        return;
      }
      state.nearestId = nearest.id;
      $("#locationStatus").textContent = `Nearest: ${nearest.name} (${nearestDistance.toFixed(1)} km)`;
      applyFilters();
      selectMapRestaurant(nearest.id);
      $("#restaurants").scrollIntoView({ behavior: "smooth" });
    },
    () => {
      $("#locationStatus").textContent = "Location permission was denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function toRad(value) { return value * Math.PI / 180; }
function unique(values) { return [...new Set(values)]; }
function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}
function escapeAttr(value) { return escapeHtml(value); }
function makeAvatar(name) {
  const initials = name.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#e7ebf0"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="58" font-weight="700" fill="#111827">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
