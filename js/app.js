const API_BASE = "https://media2.edu.metropolia.fi/restaurant";

const state = {
  restaurants: [],
  filteredRestaurants: [],
  selectedRestaurant: null,
  menuType: "daily",
  user: null,
  nearestId: null
};

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
  $("#searchInput")?.addEventListener("input", applyFilters);
  $("#cityFilter")?.addEventListener("change", applyFilters);
  $("#providerFilter")?.addEventListener("change", applyFilters);
  $("#favoritesOnly")?.addEventListener("change", applyFilters);
  $("#locationButton")?.addEventListener("click", findNearest);
  $("#loginButton")?.addEventListener("click", openAuth);
  $("#profileLoginButton")?.addEventListener("click", openAuth);
  $("#logoutButton")?.addEventListener("click", logout);
  $("#profileForm")?.addEventListener("submit", saveProfile);
  $("#profilePicture")?.addEventListener("change", saveProfilePicture);
  $("#authForm")?.addEventListener("submit", handleAuth);
  $("#restaurantList")?.addEventListener("click", handleRestaurantAction);

  $("#mapList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-id]");
    if (button) selectMapRestaurant(button.dataset.mapId);
  });

  $$("#menuModal [data-close-modal]").forEach((el) => el.addEventListener("click", closeMenuModal));
  $$("#authModal [data-close-auth]").forEach((el) => el.addEventListener("click", closeAuth));

  $$("#menuModal .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$("#menuModal .tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      state.menuType = tab.dataset.menuType;
      if (state.selectedRestaurant) loadMenu(state.selectedRestaurant, state.menuType);
    });
  });

  $$("#authModal .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$("#authModal .tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      setAuthMode(tab.dataset.authType);
    });
  });
}

async function loadRestaurants() {
  const url = `${API_BASE}/api/v1/restaurants`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const list = Array.isArray(data)
      ? data
      : data.restaurants || data.data || data.items || data.results || [];

    state.restaurants = list.map(normalizeRestaurant).filter((r) => r.id && r.name);
    $("#apiNotice")?.classList.add("hidden");
  } catch (error) {
    console.error("Restaurant API error:", error);
    state.restaurants = [];
    const notice = $("#apiNotice");
    if (notice) {
      notice.textContent = "Restaurant data could not be loaded from the Metropolia API.";
      notice.classList.remove("hidden");
    }
  }
}

function normalizeRestaurant(raw) {
  const coordinates = raw.location?.coordinates;

  let longitude = null;
  let latitude = null;

  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    longitude = Number(coordinates[0]);
    latitude = Number(coordinates[1]);
  }

  return {
    id: String(raw.id ?? raw.restaurantId ?? raw._id ?? crypto.randomUUID()),
    name: raw.name ?? raw.restaurantName ?? raw.title ?? "Unnamed restaurant",
    city: raw.city ?? raw.locality ?? raw.town ?? "",
    provider: raw.provider ?? raw.serviceProvider ?? raw.company ?? raw.operator ?? "",
    address: raw.address ?? raw.streetAddress ?? raw.street ?? "",
    lat: latitude,
    lon: longitude,
    raw
  };
}

function renderFilters() {
  fillSelect("#cityFilter", unique(state.restaurants.map((r) => r.city).filter(Boolean)));
  fillSelect("#providerFilter", unique(state.restaurants.map((r) => r.provider).filter(Boolean)));
}

function fillSelect(selector, values) {
  const select = $(selector);
  if (!select) return;

  const first = select.firstElementChild;
  select.innerHTML = "";
  if (first) select.appendChild(first);

  values.sort((a, b) => a.localeCompare(b)).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function applyFilters() {
  const search = $("#searchInput")?.value.trim().toLowerCase() || "";
  const city = $("#cityFilter")?.value || "";
  const provider = $("#providerFilter")?.value || "";
  const favoritesOnly = $("#favoritesOnly")?.checked || false;
  const favorites = getFavorites();

  state.filteredRestaurants = state.restaurants.filter((restaurant) => {
    const text = `${restaurant.name} ${restaurant.city} ${restaurant.provider} ${restaurant.address}`.toLowerCase();

    return (
      (!search || text.includes(search)) &&
      (!city || restaurant.city === city) &&
      (!provider || restaurant.provider === provider) &&
      (!favoritesOnly || favorites.includes(restaurant.id))
    );
  });

  renderRestaurants();
  renderMapList();

  const count = state.filteredRestaurants.length;
  if ($("#restaurantCount")) {
    $("#restaurantCount").textContent = `${count} restaurant${count === 1 ? "" : "s"}`;
  }
}

function renderRestaurants() {
  const container = $("#restaurantList");
  if (!container) return;

  container.innerHTML = "";

  if (!state.filteredRestaurants.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No restaurants found.</strong><br>
        Try changing the filters.
      </div>`;
    return;
  }

  state.filteredRestaurants.forEach((restaurant) => {
    const favorite = getFavorites().includes(restaurant.id);
    const nearest = state.nearestId === restaurant.id;
    const card = document.createElement("article");

    card.className = `restaurant-card ${nearest ? "nearest" : ""}`;
    card.innerHTML = `
      <div class="card-top">
        <div>
          <span class="badge">${escapeHtml(restaurant.city || "Finland")}</span>
          <h3>${escapeHtml(restaurant.name)}</h3>
        </div>
        <button class="favorite-button ${favorite ? "active" : ""}"
          data-action="favorite" data-id="${escapeAttr(restaurant.id)}"
          aria-label="${favorite ? "Remove favourite" : "Add favourite"}">
          ${favorite ? "★" : "☆"}
        </button>
      </div>
      <div class="card-meta">
        <div>${escapeHtml(restaurant.provider || "Service provider not available")}</div>
        <div>${escapeHtml(restaurant.address || "Address not available")}</div>
        ${nearest ? "<strong>📍 Nearest restaurant</strong>" : ""}
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

  const restaurant = state.restaurants.find((r) => r.id === button.dataset.id);
  if (!restaurant) return;

  if (button.dataset.action === "favorite") toggleFavorite(restaurant.id);
  if (button.dataset.action === "menu") openMenu(restaurant);
  if (button.dataset.action === "map") {
    selectMapRestaurant(restaurant.id);
    $("#map")?.scrollIntoView({ behavior: "smooth" });
  }
}

async function openMenu(restaurant) {
  state.selectedRestaurant = restaurant;
  state.menuType = "daily";

  $$("#menuModal .tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.menuType === "daily");
  });

  $("#menuTitle").textContent = restaurant.name;
  $("#menuModal")?.classList.remove("hidden");
  $("#menuModal")?.setAttribute("aria-hidden", "false");

  await loadMenu(restaurant, "daily");
}

function closeMenuModal() {
  $("#menuModal")?.classList.add("hidden");
  $("#menuModal")?.setAttribute("aria-hidden", "true");
}

async function loadMenu(restaurant, type) {
  const container = $("#menuContent");
  if (!container) return;

  container.innerHTML = `<p class="muted">Loading ${escapeHtml(type)} menu…</p>`;

  const id = encodeURIComponent(restaurant.id);

  // Daily endpoint verified from the Metropolia Restaurant API documentation:
  // /api/v1/restaurants/daily/:id/:lang
  //
  // Weekly uses the corresponding weekly route.
  const url = type === "daily"
    ? `${API_BASE}/api/v1/restaurants/daily/${id}/fi`
    : `${API_BASE}/api/v1/restaurants/weekly/${id}/fi`;

  console.log("Loading menu:", url);

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("Menu API response:", data);

    const menu = normalizeMenu(data);

if (!menu.length) {
  container.innerHTML = `
    <div class="empty-state">
      <strong>No menu available today.</strong>
      <p>This restaurant has no menu published for this day.</p>
    </div>
  `;
  return;
}

renderMenuData(menu, type);
  } catch (error) {
    console.error("Menu API error:", error);
    container.innerHTML = `
      <div class="empty-state">
        <strong>Menu data is not available.</strong><br><br>
        API request failed.
        <br><small>${escapeHtml(error.message)}</small>
      </div>`;
  }
}

function normalizeMenu(data) {
  if (!data) return [];

  // Daily menu:
  // { courses: [...] }
  if (Array.isArray(data.courses)) {
    // No courses available
    if (data.courses.length === 0) {
      return [];
    }

    return [
      {
        date: "Today",
        items: data.courses.map(normalizeMenuItem)
      }
    ];
  }

  // Weekly menu:
  // { days: [{ date: "...", courses: [...] }, ...] }
  if (Array.isArray(data.days)) {
    return data.days
      .map((day) => ({
        date: day.date || day.day || day.name || "",
        items: Array.isArray(day.courses)
          ? day.courses.map(normalizeMenuItem)
          : []
      }))
      .filter((day) => day.items.length);
  }

  // Other possible API response formats
  if (Array.isArray(data)) {
    return data
      .map((day) => ({
        date: day.date || day.day || day.name || "",
        items: (
          day.courses ||
          day.items ||
          day.dishes ||
          day.meals ||
          []
        ).map(normalizeMenuItem)
      }))
      .filter((day) => day.items.length);
  }

  const source = data.menu || data.menus || data.data || data.items;

  if (Array.isArray(source)) {
    return source
      .map((day) => ({
        date: day.date || day.day || day.name || "",
        items: (
          day.courses ||
          day.items ||
          day.dishes ||
          day.meals ||
          []
        ).map(normalizeMenuItem)
      }))
      .filter((day) => day.items.length);
  }

  return [];
}

function normalizeMenuItem(item) {
  if (typeof item === "string") return { name: item, price: "", diets: "" };

  return {
    name: item.name || item.title || item.meal || item.description || "Menu item",
    price: item.price || "",
    diets: item.diets || item.diet || item.allergens || ""
  };
}

function renderMenuData(menu, type) {
  const container = $("#menuContent");
  if (!container) return;

  container.innerHTML = "";

  menu.forEach((day) => {
    const section = document.createElement("div");
    section.className = "menu-day";

    const heading = document.createElement("h4");
    heading.textContent = day.date || (type === "daily" ? "Today" : "Menu");
    section.appendChild(heading);

    day.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-item";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          ${item.diets ? `<div class="diet">${escapeHtml(item.diets)}</div>` : ""}
        </div>
        ${item.price ? `<span class="price">${escapeHtml(item.price)}</span>` : ""}`;
      section.appendChild(row);
    });

    container.appendChild(section);
  });
}

function getUsers() {
  return JSON.parse(localStorage.getItem("studentLunchUsers") || "{}");
}

function getFavorites() {
  if (!state.user) return [];
  return getUsers()[state.user.email]?.favorites || [];
}

function toggleFavorite(id) {
  if (!state.user) {
    openAuth();
    showToast("Login to save favourite restaurants.");
    return;
  }

  const users = getUsers();
  const account = users[state.user.email];
  account.favorites = account.favorites || [];

  account.favorites = account.favorites.includes(id)
    ? account.favorites.filter((item) => item !== id)
    : [...account.favorites, id];

  users[state.user.email] = account;
  localStorage.setItem("studentLunchUsers", JSON.stringify(users));
  applyFilters();
}

function renderMapList() {
  const container = $("#mapList");
  if (!container) return;

  container.innerHTML = "";

  state.filteredRestaurants.forEach((restaurant) => {
    const button = document.createElement("button");
    button.className = "map-list-item";
    button.dataset.mapId = restaurant.id;
    button.innerHTML = `
      <strong>${escapeHtml(restaurant.name)}</strong>
      <span>${escapeHtml(restaurant.city)} · ${escapeHtml(restaurant.address)}</span>`;
    container.appendChild(button);
  });
}

function selectMapRestaurant(id) {
  const restaurant = state.restaurants.find((r) => r.id === id);

  if (!restaurant || !Number.isFinite(restaurant.lat) || !Number.isFinite(restaurant.lon)) {
    showToast("This restaurant has no map coordinates in the API data.");
    return;
  }

  const delta = 0.025;
  const bbox = `${restaurant.lon - delta}%2C${restaurant.lat - delta}%2C${restaurant.lon + delta}%2C${restaurant.lat + delta}`;

  $("#mapFrame").src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${restaurant.lat}%2C${restaurant.lon}`;

  $("#mapExternalLink").href =
    `https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}#map=16/${restaurant.lat}/${restaurant.lon}`;

  $$(".map-list-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.mapId === id);
  });
}

function findNearest() {
  if (!navigator.geolocation) {
    $("#locationStatus").textContent = "Geolocation is not supported.";
    return;
  }

  $("#locationStatus").textContent = "Finding your location…";

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      let nearest = null;
      let nearestDistance = Infinity;

      state.restaurants.forEach((restaurant) => {
        if (!Number.isFinite(restaurant.lat) || !Number.isFinite(restaurant.lon)) return;

        const distance = haversine(
          coords.latitude, coords.longitude,
          restaurant.lat, restaurant.lon
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = restaurant;
        }
      });

      if (!nearest) {
        $("#locationStatus").textContent = "No restaurants with coordinates were found.";
        return;
      }

      state.nearestId = nearest.id;
      $("#locationStatus").textContent =
        `Nearest: ${nearest.name} (${nearestDistance.toFixed(1)} km)`;

      applyFilters();
      selectMapRestaurant(nearest.id);
      $("#restaurants")?.scrollIntoView({ behavior: "smooth" });
    },
    () => {
      $("#locationStatus").textContent = "Location permission was denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function loadUser() {
  const email = localStorage.getItem("studentLunchCurrentUser");
  if (!email) return;

  const users = getUsers();
  if (users[email]) state.user = users[email];
}

function openAuth() {
  $("#authModal")?.classList.remove("hidden");
  $("#authModal")?.setAttribute("aria-hidden", "false");
  setAuthMode("login");
}

function closeAuth() {
  $("#authModal")?.classList.add("hidden");
  $("#authModal")?.setAttribute("aria-hidden", "true");
}

function setAuthMode(mode) {
  const register = mode === "register";
  $("#authTitle").textContent = register ? "Create your account" : "Welcome back";
  $("#authNameLabel")?.classList.toggle("hidden", !register);
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
  const users = getUsers();

  if (mode === "register") {
    if (users[email]) {
      $("#authStatus").textContent = "An account with this email already exists.";
      return;
    }

    users[email] = { name, email, password, city: "", picture: "", favorites: [] };
    state.user = users[email];
    localStorage.setItem("studentLunchUsers", JSON.stringify(users));
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
  if ($("#favoritesOnly")) $("#favoritesOnly").checked = false;
  renderProfile();
  applyFilters();
  showToast("You have been logged out.");
}

function renderProfile() {
  const loggedOut = $("#profileLoggedOut");
  const form = $("#profileForm");

  if (!state.user) {
    loggedOut?.classList.remove("hidden");
    form?.classList.add("hidden");
    $("#loginButton")?.classList.remove("hidden");
    $("#logoutButton")?.classList.add("hidden");
    return;
  }

  loggedOut?.classList.add("hidden");
  form?.classList.remove("hidden");
  $("#loginButton")?.classList.add("hidden");
  $("#logoutButton")?.classList.remove("hidden");

  $("#profileName").value = state.user.name || "";
  $("#profileEmail").value = state.user.email || "";
  $("#profileCity").value = state.user.city || "";
  $("#profileNameHeading").textContent = state.user.name || "Profile";
  $("#profileEmailHeading").textContent = state.user.email;
  $("#profileImage").src = state.user.picture || makeAvatar(state.user.name || "Student");
}

function saveProfile(event) {
  event.preventDefault();
  if (!state.user) return;

  const users = getUsers();
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
    const users = getUsers();
    users[state.user.email].picture = reader.result;
    state.user.picture = reader.result;
    localStorage.setItem("studentLunchUsers", JSON.stringify(users));
    renderProfile();
  };
  reader.readAsDataURL(file);
}

function unique(values) {
  return [...new Set(values)];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function makeAvatar(name) {
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#e7ebf0"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="58" font-weight="700" fill="#111827">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
