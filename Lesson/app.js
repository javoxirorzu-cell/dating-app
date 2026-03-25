// Basic front-end logic for Luvora demo

const storageKeys = {
  user: "luv_user",
  auth: "luv_auth",
  profile: "luv_profile",
  prefs: "luv_preferences",
  matches: "luv_matches"
};

function getJSON(key, fallback) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  const host = document.getElementById("toastHost");
  if (!host) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// Registration
function register() {
  const email = document.getElementById("regEmail")?.value.trim();
  const pass = document.getElementById("regPass")?.value.trim();
  const country = document.getElementById("regCountry")?.value.trim();
  if (!email || !pass || !country) return alert("Fill all fields, including your country");

  setJSON(storageKeys.user, { email, pass, country });

  const existingProfile = getJSON(storageKeys.profile, {});
  setJSON(storageKeys.profile, {
    ...existingProfile,
    country,
    name: existingProfile.name || "",
    age: existingProfile.age || "",
    bio: existingProfile.bio || "",
    goal: existingProfile.goal || "Long-term relationship",
    interests: existingProfile.interests || "Travel, coffee, movies",
    photo: existingProfile.photo
  });

  alert("Account created");
  window.location.href = "login.html";
}

// Login
function login() {
  const email = document.getElementById("email")?.value.trim();
  const pass = document.getElementById("pass")?.value.trim();
  const saved = getJSON(storageKeys.user, null);
  if (!saved) return alert("No account found, register first.");
  if (email === saved.email && pass === saved.pass) {
    localStorage.setItem(storageKeys.auth, "true");
    window.location.href = "app.html";
  } else {
    alert("Wrong credentials");
  }
}

function requireAuth() {
  if (localStorage.getItem(storageKeys.auth) !== "true") {
    window.location.href = "login.html";
  }
}

// Profile save/load
function saveProfile() {
  const savedUser = getJSON(storageKeys.user, null);
  const profile = {
    name: document.getElementById("name")?.value || "",
    age: document.getElementById("age")?.value || "",
    country: savedUser?.country || document.getElementById("country")?.value || "",
    bio: document.getElementById("bio")?.value || "",
    goal: document.getElementById("goal")?.value || "Long-term relationship",
    interests: document.getElementById("interests")?.value || "",
    photo: document.getElementById("avatar")?.src
  };
  setJSON(storageKeys.profile, profile);
  showToast("Profile updated successfully");
}

function loadProfileData() {
  const p = getJSON(storageKeys.profile, {});
  const savedUser = getJSON(storageKeys.user, null);
  if (document.getElementById("name")) document.getElementById("name").value = p.name || "";
  if (document.getElementById("age")) document.getElementById("age").value = p.age || "";
  if (document.getElementById("country")) {
    document.getElementById("country").value = savedUser?.country || p.country || "";
    document.getElementById("country").setAttribute("disabled", "true");
  }
  if (document.getElementById("bio")) document.getElementById("bio").value = p.bio || "";
  if (document.getElementById("goal")) document.getElementById("goal").value = p.goal || "Long-term relationship";
  if (document.getElementById("interests")) document.getElementById("interests").value = p.interests || "";
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
  { name: "Alice", age: 24, city: "Paris", country: "France", vibe: "Romantic", goal: "Long-term relationship", verified: true, img: "https://i.pravatar.cc/450?img=5" },
  { name: "Leo", age: 28, city: "Berlin", country: "Germany", vibe: "Adventurous", goal: "Dating", verified: false, img: "https://i.pravatar.cc/450?img=8" },
  { name: "Mina", age: 26, city: "Seoul", country: "South Korea", vibe: "Creative", goal: "Long-term relationship", verified: true, img: "https://i.pravatar.cc/450?img=32" },
  { name: "Diego", age: 30, city: "Mexico City", country: "Mexico", vibe: "Energetic", goal: "Serious commitment", verified: true, img: "https://i.pravatar.cc/450?img=47" },
  { name: "Nora", age: 25, city: "New York", country: "USA", vibe: "Ambitious", goal: "Dating", verified: true, img: "https://i.pravatar.cc/450?img=15" },
  { name: "Kenji", age: 29, city: "Tokyo", country: "Japan", vibe: "Calm", goal: "Long-term relationship", verified: false, img: "https://i.pravatar.cc/450?img=20" },
  { name: "Sara", age: 27, city: "Madrid", country: "Spain", vibe: "Social", goal: "Dating", verified: true, img: "https://i.pravatar.cc/450?img=38" },
  { name: "Ava", age: 31, city: "Los Angeles", country: "USA", vibe: "Creative", goal: "Serious commitment", verified: true, img: "https://i.pravatar.cc/450?img=55" }
];

let swipeIndex = 0;

function calculateCompatibility(candidate) {
  const prefs = getJSON(storageKeys.prefs, {
    prefAgeMin: 22,
    prefAgeMax: 32,
    prefVibe: "Any",
    verifiedOnly: false,
    sortBy: "score"
  });
  const profile = getJSON(storageKeys.profile, { goal: "Long-term relationship" });

  let score = 55;

  if (candidate.age >= Number(prefs.prefAgeMin) && candidate.age <= Number(prefs.prefAgeMax)) score += 20;
  else score -= 10;

  if (prefs.prefVibe === "Any" || prefs.prefVibe === candidate.vibe) score += 15;

  if (profile.goal && candidate.goal && profile.goal.toLowerCase().includes(candidate.goal.toLowerCase().split(" ")[0])) {
    score += 10;
  }

  if (candidate.verified) score += 5;

  return Math.max(35, Math.min(99, score));
}

function savePreferences() {
  const prefAgeMin = Number(document.getElementById("prefAgeMin")?.value || 22);
  const prefAgeMax = Number(document.getElementById("prefAgeMax")?.value || 32);
  const prefVibe = document.getElementById("prefVibe")?.value || "Any";
  const verifiedOnly = Boolean(document.getElementById("verifiedOnly")?.checked);
  const sortBy = document.getElementById("sortBy")?.value || "score";

  setJSON(storageKeys.prefs, { prefAgeMin, prefAgeMax, prefVibe, verifiedOnly, sortBy });
}

function hydratePreferences() {
  const prefs = getJSON(storageKeys.prefs, {
    prefAgeMin: 22,
    prefAgeMax: 32,
    prefVibe: "Any",
    verifiedOnly: false,
    sortBy: "score"
  });

  if (document.getElementById("prefAgeMin")) document.getElementById("prefAgeMin").value = prefs.prefAgeMin;
  if (document.getElementById("prefAgeMax")) document.getElementById("prefAgeMax").value = prefs.prefAgeMax;
  if (document.getElementById("prefVibe")) document.getElementById("prefVibe").value = prefs.prefVibe;
  if (document.getElementById("verifiedOnly")) document.getElementById("verifiedOnly").checked = prefs.verifiedOnly;
  if (document.getElementById("sortBy")) document.getElementById("sortBy").value = prefs.sortBy;
}

// Search page
function searchUsers() {
  savePreferences();

  const prefs = getJSON(storageKeys.prefs, {});
  const nameQuery = document.getElementById("searchName")?.value.toLowerCase().trim() || "";
  const cityQuery = document.getElementById("searchCity")?.value.toLowerCase().trim() || "";
  const countryQuery = document.getElementById("searchCountry")?.value.toLowerCase().trim() || "";
  const ageMin = parseInt(document.getElementById("ageMin")?.value, 10);
  const ageMax = parseInt(document.getElementById("ageMax")?.value, 10);

  const box = document.getElementById("searchResults") || document.getElementById("users");
  if (!box) return;

  let filtered = demoUsers.filter((u) => {
    const matchesName = !nameQuery || u.name.toLowerCase().includes(nameQuery);
    const matchesCity = !cityQuery || u.city.toLowerCase().includes(cityQuery);
    const matchesCountry = !countryQuery || u.country.toLowerCase().includes(countryQuery);
    const matchesAgeMin = Number.isNaN(ageMin) || u.age >= ageMin;
    const matchesAgeMax = Number.isNaN(ageMax) || u.age <= ageMax;
    const matchesPrefsAge = u.age >= Number(prefs.prefAgeMin) && u.age <= Number(prefs.prefAgeMax);
    const matchesVibe = prefs.prefVibe === "Any" || prefs.prefVibe === u.vibe;
    const matchesVerified = !prefs.verifiedOnly || u.verified;
    return matchesName && matchesCity && matchesCountry && matchesAgeMin && matchesAgeMax && matchesPrefsAge && matchesVibe && matchesVerified;
  });

  if (prefs.sortBy === "age") filtered = filtered.sort((a, b) => a.age - b.age);
  if (prefs.sortBy === "name") filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (prefs.sortBy === "score") filtered = filtered.sort((a, b) => calculateCompatibility(b) - calculateCompatibility(a));

  const cards = filtered
    .map((u) => {
      const score = calculateCompatibility(u);
      return `
      <div class="profile-card">
        <div class="card-photo" style="background-image:url('${u.img}')">
          <div class="badge">${u.city}</div>
          <div class="score-badge">${score}% match</div>
        </div>
        <div class="card-body">
          <div class="card-title">${u.name}, ${u.age} ${u.verified ? '<span class="verified">✔ Verified</span>' : ''}</div>
          <div class="card-meta">${u.city} • ${u.country} • ${u.vibe}</div>
          <div class="card-meta">Goal: ${u.goal}</div>
          <div class="card-actions">
            <button class="ghost" onclick="swipe('pass')">Pass</button>
            <button onclick="swipe('like')">Match</button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  box.innerHTML = cards || `<div class="muted">No matches yet — try loosening filters.</div>`;

  const countLabel = document.getElementById("resultCount");
  if (countLabel) countLabel.innerText = `${filtered.length} match${filtered.length === 1 ? "" : "es"}`;
}

function renderSwipeCard() {
  const card = document.getElementById("swipeCard");
  const peek = document.getElementById("swipePeek");
  const counter = document.getElementById("swipeCounter");
  if (!card) return;
  const current = demoUsers[swipeIndex % demoUsers.length];
  const score = calculateCompatibility(current);
  card.innerHTML = `
    <div class="card-photo" style="background-image:url('${current.img}')">
      <div class="badge">${current.city}</div>
      <div class="score-badge">${score}% match</div>
    </div>
    <div class="card-body">
      <div class="card-title">${current.name}, ${current.age}</div>
      <div class="card-meta">${current.city} • ${current.country} • ${current.vibe}</div>
      <p class="muted">Personalized by your profile goal and vibe preferences.</p>
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
  if (counter) counter.innerText = `Card ${(swipeIndex % demoUsers.length) + 1} of ${demoUsers.length}`;
}

function swipe(action) {
  const current = demoUsers[swipeIndex % demoUsers.length];
  if (action === "like") {
    const matches = getJSON(storageKeys.matches, []);
    const exists = matches.some((m) => m.name === current.name);
    if (!exists) {
      matches.push(current);
      setJSON(storageKeys.matches, matches);
      showToast(`${current.name} added to your matches`);
    }
  }
  swipeIndex = (swipeIndex + 1) % demoUsers.length;
  renderSwipeCard();
  loadMatches();
}

function seedMatchesOnce() {
  if (!localStorage.getItem(storageKeys.matches)) {
    setJSON(storageKeys.matches, demoUsers.slice(0, 3));
  }
}

function loadMatches() {
  seedMatchesOnce();
  const matches = getJSON(storageKeys.matches, []);
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
  const matches = getJSON(storageKeys.matches, []);
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
  const msgs = getJSON(`luv_chat_${currentChat.name}`, []);
  const box = document.getElementById("messages");
  if (!box) return;
  box.innerHTML = msgs
    .map((m) => `<div class="msg ${m.from === 'me' ? 'me' : 'them'}">${m.text}</div>`)
    .join("");
  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  if (!currentChat) return;
  const input = document.getElementById("msgInput");
  const text = input?.value.trim();
  if (!text) return;
  const key = `luv_chat_${currentChat.name}`;
  const msgs = getJSON(key, []);
  msgs.push({ from: "me", text });
  setJSON(key, msgs);
  input.value = "";
  loadMessages();

  setTimeout(() => {
    const replies = [
      "That sounds great ✨",
      "I like your vibe!",
      "Want to plan coffee this week?",
      "Tell me more 🙂"
    ];
    const next = getJSON(key, []);
    next.push({ from: "them", text: replies[Math.floor(Math.random() * replies.length)] });
    setJSON(key, next);
    loadMessages();
  }, 700);
}

function populateHome() {
  const list = document.getElementById("homeProfiles");
  if (!list) return;
  list.innerHTML = demoUsers
    .map((u) => {
      const score = calculateCompatibility(u);
      return `
      <div class="profile-card compact">
        <div class="card-photo" style="background-image:url('${u.img}')">
          <div class="badge">${u.city}</div>
          <div class="score-badge">${score}%</div>
        </div>
        <div class="card-body">
          <div class="card-title">${u.name}, ${u.age}</div>
          <div class="card-meta">${u.city}, ${u.country}</div>
          <div class="card-actions">
            <button class="ghost" onclick="swipe('pass')">Pass</button>
            <button onclick="swipe('like')">Match</button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const stat = document.getElementById("statTotal");
  if (stat) stat.innerText = `${demoUsers.length}`;
}

document.addEventListener("DOMContentLoaded", () => {
  hydratePreferences();
  searchUsers();
  populateHome();
  renderSwipeCard();

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

  ["searchName", "searchCity", "searchCountry", "ageMin", "ageMax", "prefAgeMin", "prefAgeMax", "prefVibe", "verifiedOnly", "sortBy"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => searchUsers());
    if (el && el.tagName === "SELECT") el.addEventListener("change", () => searchUsers());
  });
});
