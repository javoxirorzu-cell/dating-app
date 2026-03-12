// Basic front-end logic for Luvora demo

// Registration
function register() {
  const email = document.getElementById("regEmail")?.value.trim();
  const pass = document.getElementById("regPass")?.value.trim();
  const country = document.getElementById("regCountry")?.value.trim();
  if (!email || !pass || !country) return alert("Fill all fields, including your country");
  localStorage.setItem("luv_user", JSON.stringify({ email, pass, country }));
  // also seed profile with locked country
  const existingProfile = JSON.parse(localStorage.getItem("luv_profile") || "null") || {};
  localStorage.setItem(
    "luv_profile",
    JSON.stringify({ ...existingProfile, country, name: existingProfile.name || "", age: existingProfile.age || "", bio: existingProfile.bio || "", photo: existingProfile.photo })
  );
  alert("Account created");
  window.location.href = "login.html";
}

// Login
function login() {
  const email = document.getElementById("email")?.value.trim();
  const pass = document.getElementById("pass")?.value.trim();
  const saved = JSON.parse(localStorage.getItem("luv_user") || "null");
  if (!saved) return alert("No account found, register first.");
  if (email === saved.email && pass === saved.pass) {
    localStorage.setItem("luv_auth", "true");
    window.location.href = "app.html";
  } else {
    alert("Wrong credentials");
  }
}

// Protect pages
function requireAuth() {
  if (localStorage.getItem("luv_auth") !== "true") {
    window.location.href = "login.html";
  }
}

// Profile save/load
function saveProfile() {
  const savedUser = JSON.parse(localStorage.getItem("luv_user") || "null");
  const profile = {
    name: document.getElementById("name")?.value || "",
    age: document.getElementById("age")?.value || "",
    country: savedUser?.country || document.getElementById("country")?.value || "",
    bio: document.getElementById("bio")?.value || "",
    photo: document.getElementById("avatar")?.src
  };
  localStorage.setItem("luv_profile", JSON.stringify(profile));
  alert("Profile saved");
}

function loadProfileData() {
  const p = JSON.parse(localStorage.getItem("luv_profile") || "null") || {};
  const savedUser = JSON.parse(localStorage.getItem("luv_user") || "null");
  if (document.getElementById("name")) document.getElementById("name").value = p.name || "";
  if (document.getElementById("age")) document.getElementById("age").value = p.age || "";
  if (document.getElementById("country")) {
    document.getElementById("country").value = savedUser?.country || p.country || "";
    document.getElementById("country").setAttribute("disabled", "true");
  }
  if (document.getElementById("bio")) document.getElementById("bio").value = p.bio || "";
  if (document.getElementById("avatar")) document.getElementById("avatar").src = p.photo || document.getElementById("avatar").src;
}

// Photo upload preview
document.addEventListener("change", (e) => {
  if (e.target.id === "photoInput") {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = document.getElementById("avatar");
      if (avatar) avatar.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Demo profiles for matches/search
const demoUsers = [
  { name: "Alice", age: 24, city: "Paris", country: "France", img: "https://i.pravatar.cc/150?img=5" },
  { name: "Leo", age: 28, city: "Berlin", country: "Germany", img: "https://i.pravatar.cc/150?img=8" },
  { name: "Mina", age: 26, city: "Seoul", country: "South Korea", img: "https://i.pravatar.cc/150?img=32" },
  { name: "Diego", age: 30, city: "Mexico City", country: "Mexico", img: "https://i.pravatar.cc/150?img=47" },
  { name: "Nora", age: 25, city: "New York", country: "USA", img: "https://i.pravatar.cc/150?img=15" },
  { name: "Kenji", age: 29, city: "Tokyo", country: "Japan", img: "https://i.pravatar.cc/150?img=20" },
  { name: "Sara", age: 27, city: "Madrid", country: "Spain", img: "https://i.pravatar.cc/150?img=38" },
  { name: "Ava", age: 31, city: "Los Angeles", country: "USA", img: "https://i.pravatar.cc/150?img=55" }
];

// Swipe state
let swipeIndex = 0;

// Search page
function searchUsers() {
  const nameQuery = document.getElementById("searchName")?.value.toLowerCase().trim() || "";
  const cityQuery = document.getElementById("searchCity")?.value.toLowerCase().trim() || "";
  const countryQuery = document.getElementById("searchCountry")?.value.toLowerCase().trim() || "";
  const ageMin = parseInt(document.getElementById("ageMin")?.value, 10);
  const ageMax = parseInt(document.getElementById("ageMax")?.value, 10);

  const box = document.getElementById("searchResults") || document.getElementById("users");
  if (!box) return;

  const filtered = demoUsers.filter((u) => {
    const matchesName = !nameQuery || u.name.toLowerCase().includes(nameQuery);
    const matchesCity = !cityQuery || u.city.toLowerCase().includes(cityQuery);
    const matchesCountry = !countryQuery || u.country.toLowerCase().includes(countryQuery);
    const matchesAgeMin = Number.isNaN(ageMin) || u.age >= ageMin;
    const matchesAgeMax = Number.isNaN(ageMax) || u.age <= ageMax;
    return matchesName && matchesCity && matchesCountry && matchesAgeMin && matchesAgeMax;
  });

  const cards = filtered
    .map(
      (u) => `
      <div class="profile-card">
        <div class="card-photo" style="background-image:url('${u.img}')">
          <div class="badge">${u.city}</div>
        </div>
        <div class="card-body">
          <div class="card-title">${u.name}, ${u.age}</div>
          <div class="card-meta">${u.city} • ${u.country}</div>
          <div class="card-actions">
            <button class="ghost">Pass</button>
            <button>Match</button>
          </div>
        </div>
      </div>`
    )
    .join("");

  box.innerHTML = cards || `<div class="muted">No matches yet — try loosening filters.</div>`;

  const countLabel = document.getElementById("resultCount");
  if (countLabel) countLabel.innerText = `${filtered.length} match${filtered.length === 1 ? "" : "es"}`;
}

// Swipe / like-dislike
function renderSwipeCard() {
  const card = document.getElementById("swipeCard");
  const peek = document.getElementById("swipePeek");
  const counter = document.getElementById("swipeCounter");
  if (!card) return;
  const current = demoUsers[swipeIndex % demoUsers.length];
  card.innerHTML = `
    <div class="card-photo" style="background-image:url('${current.img}')">
      <div class="badge">${current.city}</div>
    </div>
    <div class="card-body">
      <div class="card-title">${current.name}, ${current.age}</div>
      <div class="card-meta">${current.city} • ${current.country}</div>
      <p class="muted">Swipe-like actions: Pass or Like. Likes are saved to your Matches.</p>
    </div>
  `;
  if (peek) {
    const previews = [];
    for (let i = 1; i <= 3; i++) {
      const u = demoUsers[(swipeIndex + i) % demoUsers.length];
      previews.push(`
        <div class="peek-card">
          <img src="${u.img}" alt="${u.name}">
          <div>
            <div class="name">${u.name}</div>
            <div class="meta">${u.city}</div>
          </div>
        </div>
      `);
    }
    peek.innerHTML = previews.join("");
  }
  if (counter) counter.innerText = `Card ${ (swipeIndex % demoUsers.length) + 1 } of ${demoUsers.length}`;
}

function swipe(action) {
  const current = demoUsers[swipeIndex % demoUsers.length];
  if (action === "like") {
    const matches = JSON.parse(localStorage.getItem("luv_matches") || "[]");
    const exists = matches.some((m) => m.name === current.name);
    if (!exists) {
      matches.push(current);
      localStorage.setItem("luv_matches", JSON.stringify(matches));
    }
  }
  swipeIndex = (swipeIndex + 1) % demoUsers.length;
  renderSwipeCard();
  loadMatches(); // refresh sidebar if user is on chats page
}

// Matches/chat
function seedMatchesOnce() {
  if (!localStorage.getItem("luv_matches")) {
    localStorage.setItem("luv_matches", JSON.stringify(demoUsers.slice(0, 3)));
  }
}

function loadMatches() {
  seedMatchesOnce();
  const matches = JSON.parse(localStorage.getItem("luv_matches") || "[]");
  const box = document.getElementById("matches");
  if (!box) return;
  box.innerHTML = matches
    .map(
      (p, i) => `
      <div class="user" onclick="openChat(${i})" style="cursor:pointer;">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <div class="name">${p.name}</div>
          <div class="meta">${p.city}, ${p.country || ""}</div>
        </div>
      </div>`
    )
    .join("");
}

let currentChat = null;

function openChat(index) {
  const matches = JSON.parse(localStorage.getItem("luv_matches") || "[]");
  currentChat = matches[index];
  if (!currentChat) return;
  const chatBox = document.getElementById("chatBox");
  if (chatBox) chatBox.style.display = "block";
  const empty = document.getElementById("chatEmpty");
  if (empty) empty.style.display = "none";
  const chatName = document.getElementById("chatName");
  if (chatName) chatName.innerText = currentChat.name;
  loadMessages();
}

function loadMessages() {
  if (!currentChat) return;
  const msgs = JSON.parse(localStorage.getItem(`luv_chat_${currentChat.name}`) || "[]");
  const box = document.getElementById("messages");
  if (!box) return;
  box.innerHTML = msgs.map((m) => `<div class="msg me">${m}</div>`).join("");
  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  if (!currentChat) return;
  const input = document.getElementById("msgInput");
  const text = input?.value.trim();
  if (!text) return;
  const key = `luv_chat_${currentChat.name}`;
  const msgs = JSON.parse(localStorage.getItem(key) || "[]");
  msgs.push(text);
  localStorage.setItem(key, JSON.stringify(msgs));
  input.value = "";
  loadMessages();
}

// Dashboard cards on app.html
function populateHome() {
  const list = document.getElementById("homeProfiles");
  if (!list) return;
  list.innerHTML = demoUsers
    .map(
      (u) => `
      <div class="profile-card compact">
        <div class="card-photo" style="background-image:url('${u.img}')">
          <div class="badge">${u.city}</div>
        </div>
        <div class="card-body">
          <div class="card-title">${u.name}, ${u.age}</div>
          <div class="card-meta">${u.city}, ${u.country}</div>
          <div class="card-actions">
            <button class="ghost">Pass</button>
            <button>Match</button>
          </div>
        </div>
      </div>`
    )
    .join("");

  const stat = document.getElementById("statTotal");
  if (stat) stat.innerText = `${demoUsers.length}`;
}

document.addEventListener("DOMContentLoaded", () => {
  searchUsers();
  populateHome();
  renderSwipeCard();

  // Wire chips on the search page
  const chips = document.getElementById("quickChips");
  if (chips) {
    chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      if (chip.dataset.city) document.getElementById("searchCity").value = chip.dataset.city;
      if (chip.dataset.country) document.getElementById("searchCountry").value = chip.dataset.country;
      searchUsers();
    });
  }

  // Live search on inputs
  ["searchName", "searchCity", "searchCountry", "ageMin", "ageMax"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => searchUsers());
  });
});
