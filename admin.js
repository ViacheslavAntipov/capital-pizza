const PASSWORD = "admin123";
const menuKey = "capitalPizzaMenu";
const repoOwner = "viacheslavantipov";
const repoName = "capital-pizza";
const filePath = "menu.json";
const rawUrl = "https://viacheslavantipov.github.io/capital-pizza/menu.json";

let editIndex = null;
let editCategory = null;

// === LOGOWANIE ===
document.getElementById("login-btn").addEventListener("click", () => {
  const pass = document.getElementById("admin-password").value;
  if (pass === PASSWORD) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    init();
  } else {
    document.getElementById("login-error").textContent = "❌ Nieprawidłowe hasło";
  }
});

// === INICJALIZACJA ===
async function init() {
  loadToken();
  await loadMenuFromGitHub();
}

// === TOKEN GITHUB ===
document.getElementById("save-token-btn").addEventListener("click", () => {
  const token = document.getElementById("github-token").value.trim();
  const status = document.getElementById("token-status");

  if (!token) {
    status.textContent = "⚠️ Wklej token przed zapisaniem.";
    status.style.color = "darkred";
    return;
  }

  localStorage.setItem("githubToken", token);
  status.textContent = "✅ Token zapisany lokalnie. Sprawdzam połączenie z GitHub...";
  status.style.color = "green";

  // Test połączenia z GitHub API
  fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.login) {
        status.textContent = `🔒 Połączono jako: ${data.login}`;
        status.style.color = "green";
      } else {
        status.textContent = "⚠️ Token zapisany, ale GitHub nie potwierdził autoryzacji.";
        status.style.color = "orange";
      }
    })
    .catch(() => {
      status.textContent = "⚠️ Nie udało się połączyć z GitHub.";
      status.style.color = "darkred";
    });
});

document.getElementById("clear-token-btn").addEventListener("click", () => {
  localStorage.removeItem("githubToken");
  const status = document.getElementById("token-status");
  status.textContent = "❌ Token usunięty";
  status.style.color = "darkred";
});

function loadToken() {
  const token = localStorage.getItem("githubToken");
  const status = document.getElementById("token-status");
  if (token) {
    status.textContent = "🔒 Token zapisany w przeglądarce";
    status.style.color = "green";
  } else {
    status.textContent = "⚠️ Token nie jest jeszcze zapisany";
    status.style.color = "darkred";
  }
}


document.getElementById("clear-token-btn").addEventListener("click", () => {
  localStorage.removeItem("githubToken");
  document.getElementById("token-status").textContent = "❌ Token usunięty";
});

function loadToken() {
  const token = localStorage.getItem("githubToken");
  if (token) {
    document.getElementById("token-status").textContent = "🔒 Token zapisany w przeglądarce";
  }
}

// === WCZYTANIE MENU Z GITHUB ===
async function loadMenuFromGitHub() {
  try {
    const res = await fetch(rawUrl + "?t=" + Date.now());
    const data = await res.json();
    localStorage.setItem(menuKey, JSON.stringify(data));
    populateCategories(data);
    renderMenu(data);
  } catch (err) {
    alert("⚠️ Błąd wczytywania menu z GitHub. Sprawdź połączenie.");
  }
}

// === RENDEROWANIE MENU ===
function renderMenu(data) {
  const listDiv = document.getElementById("menu-list");
  listDiv.innerHTML = "";

  Object.entries(data).forEach(([category, items]) => {
    const catHeader = document.createElement("h3");
    catHeader.textContent = category;
    listDiv.appendChild(catHeader);

    items.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("menu-item");

      div.innerHTML = `
        <span>${item.name} — ${item.prices.join(", ")}</span>
        <div>
          <button onclick="editItem('${category}', ${index})">✏️</button>
          <button onclick="deleteItem('${category}', ${index})">🗑</button>
        </div>
      `;
      listDiv.appendChild(div);
    });
  });
}

function populateCategories(data) {
  const select = document.getElementById("category");
  select.innerHTML = "";
  Object.keys(data).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// === DODAWANIE / EDYCJA ===
document.getElementById("add-btn").addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const name = document.getElementById("name").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const prices = document.getElementById("prices").value.split(",").map(p => p.trim());

  if (!name) return alert("Wpisz nazwę pozycji!");

  let menu = JSON.parse(localStorage.getItem(menuKey)) || {};
  if (!menu[category]) menu[category] = [];

  const newItem = { name, ingredients, prices };

  if (editIndex !== null) {
    menu[editCategory][editIndex] = newItem;
    editIndex = null;
    editCategory = null;
  } else {
    menu[category].push(newItem);
  }

  localStorage.setItem(menuKey, JSON.stringify(menu));
  renderMenu(menu);
});

// === DODAJ NOWĄ KATEGORIĘ ===
document.getElementById("add-category-btn").addEventListener("click", () => {
  const newCat = prompt("Podaj nazwę nowej kategorii:");
  if (!newCat) return;
  const menu = JSON.parse(localStorage.getItem(menuKey)) || {};
  if (!menu[newCat]) menu[newCat] = [];
  localStorage.setItem(menuKey, JSON.stringify(menu));
  populateCategories(menu);
  renderMenu(menu);
});

// === USUWANIE ===
function deleteItem(category, index) {
  const menu = JSON.parse(localStorage.getItem(menuKey)) || {};
  menu[category].splice(index, 1);
  localStorage.setItem(menuKey, JSON.stringify(menu));
  renderMenu(menu);
}

// === EKSPORT ===
document.getElementById("export-btn").addEventListener("click", () => {
  const data = localStorage.getItem(menuKey);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "menu.json";
  a.click();
});

// === ZAPISZ MENU NA GITHUB ===
document.getElementById("upload-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("githubToken");
  if (!token) return alert("❌ Najpierw wklej swój token GitHub API.");

  const menuData = localStorage.getItem(menuKey);
  const message = "Aktualizacja menu.json przez panel admina";

  try {
    // Pobierz sha istniejącego pliku
    const shaRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`);
    const shaData = await shaRes.json();
    const sha = shaData.sha;

    // Zaktualizuj plik menu.json
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(menuData))),
        sha,
      }),
    });

    if (res.ok) {
      alert("✅ Menu zapisane na stronie!");
    } else {
      const err = await res.json();
      console.error(err);
      alert("❌ Błąd podczas zapisywania: " + (err.message || "nieznany"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Wystąpił błąd połączenia z GitHub.");
  }
});

