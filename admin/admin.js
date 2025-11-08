const PASSWORD = "admin123";
const menuKey = "capitalPizzaMenu";
let editIndex = null;
let editCategory = null;

// === LOGOWANIE ===
document.getElementById("login-btn").addEventListener("click", () => {
  const pass = document.getElementById("admin-password").value;
  if (pass === PASSWORD) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    loadMenu();
  } else {
    document.getElementById("login-error").textContent = "❌ Nieprawidłowe hasło";
  }
});

// === WCZYTANIE MENU ===
function loadMenu() {
  const data = JSON.parse(localStorage.getItem(menuKey)) || {};
  const listDiv = document.getElementById("menu-list");
  listDiv.innerHTML = "";

  if (Object.keys(data).length === 0) {
    listDiv.innerHTML = "<p>Brak pozycji w menu. Dodaj pierwszą pozycję!</p>";
    return;
  }

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
  clearForm();
  loadMenu();
});

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("ingredients").value = "";
  document.getElementById("prices").value = "";
  document.getElementById("category").value = "pizza";
}

function editItem(category, index) {
  const menu = JSON.parse(localStorage.getItem(menuKey)) || {};
  const item = menu[category][index];
  document.getElementById("name").value = item.name;
  document.getElementById("ingredients").value = item.ingredients;
  document.getElementById("prices").value = item.prices.join(", ");
  document.getElementById("category").value = category;

  editIndex = index;
  editCategory = category;
}

function deleteItem(category, index) {
  if (!confirm("Na pewno usunąć pozycję?")) return;
  const menu = JSON.parse(localStorage.getItem(menuKey)) || {};
  menu[category].splice(index, 1);
  localStorage.setItem(menuKey, JSON.stringify(menu));
  loadMenu();
}

// === WYCZYŚĆ ===
document.getElementById("clear-btn").addEventListener("click", () => {
  if (confirm("Na pewno usunąć CAŁE menu?")) {
    localStorage.removeItem(menuKey);
    loadMenu();
  }
});

// === EKSPORT ===
document.getElementById("export-btn").addEventListener("click", () => {
  const data = localStorage.getItem(menuKey);
  if (!data) return alert("Brak danych do eksportu!");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "menu.json";
  a.click();
});

// === IMPORT Z PLIKU ===
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      localStorage.setItem(menuKey, JSON.stringify(imported));
      alert("✅ Pomyślnie zaimportowano menu!");
      loadMenu();
    } catch {
      alert("❌ Błąd podczas importu – nieprawidłowy format JSON!");
    }
  };
  reader.readAsText(file);
});
