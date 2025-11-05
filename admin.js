const repoOwner = "viacheslavantipov"; // 🔧 ZMIEŃ jeśli repozytorium ma innego właściciela
const repoName = "capital-pizza";
const branch = "main";
const menuPath = "menu.json";
const imagesFolder = "images/";

let githubToken = localStorage.getItem("githubToken");

// === Logowanie ===
const loginBox = document.getElementById("login-box");
const adminPanel = document.getElementById("admin-panel");
document.getElementById("save-token").addEventListener("click", () => {
  githubToken = document.getElementById("github-token").value.trim();
  if (!githubToken) return alert("Wklej token!");
  localStorage.setItem("githubToken", githubToken);
  loginBox.classList.add("hidden");
  adminPanel.classList.remove("hidden");
});

if (githubToken) {
  loginBox.classList.add("hidden");
  adminPanel.classList.remove("hidden");
}

// === Ładowanie menu ===
document.getElementById("load-menu").addEventListener("click", loadMenu);
document.getElementById("add-item").addEventListener("click", addMenuItem);
document.getElementById("save-menu").addEventListener("click", saveMenu);

let menuData = {};

async function loadMenu() {
  const res = await fetch(menuPath + "?t=" + Date.now());
  menuData = await res.json();
  renderEditor();
}

function renderEditor() {
  const editor = document.getElementById("menu-editor");
  editor.innerHTML = "";
  for (const [category, items] of Object.entries(menuData)) {
    const h3 = document.createElement("h3");
    h3.textContent = category;
    editor.appendChild(h3);

    items.forEach((item, idx) => {
      const box = document.createElement("div");
      box.classList.add("item-box");

      box.innerHTML = `
        <input type="text" class="name" value="${item.name}" placeholder="Nazwa">
        <textarea class="ingredients" placeholder="Składniki">${item.ingredients || ""}</textarea>
        <input type="text" class="prices" value="${item.prices.join(", ")}" placeholder="Ceny (oddzielone przecinkami)">
        ${item.image ? `<img src="${item.image}" class="image-preview">` : ""}
        <label class="image-upload-label">📸 Dodaj zdjęcie
          <input type="file" class="image-upload" accept="image/*" hidden>
        </label>
        <button class="remove-btn">Usuń pozycję</button>
      `;

      // === Upload zdjęcia ===
      box.querySelector(".image-upload").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await toBase64(file);
        const filePath = `${imagesFolder}${file.name}`;
        await uploadFile(filePath, base64, `Upload ${file.name}`);
        item.image = filePath;
        renderEditor();
      });

      // === Usuwanie pozycji ===
      box.querySelector(".remove-btn").addEventListener("click", () => {
        items.splice(idx, 1);
        renderEditor();
      });

      editor.appendChild(box);
    });
  }
}

function addMenuItem() {
  const firstCategory = Object.keys(menuData)[0];
  if (!firstCategory) return alert("Najpierw załaduj menu!");
  menuData[firstCategory].push({ name: "Nowa pozycja", ingredients: "", prices: ["0 zł"], image: "" });
  renderEditor();
}

// === Zapis menu na GitHub ===
async function saveMenu() {
  const editor = document.getElementById("menu-editor");
  let idx = 0;
  for (const [category, items] of Object.entries(menuData)) {
    const boxes = editor.querySelectorAll(".item-box");
    items.forEach(item => {
      const box = boxes[idx++];
      item.name = box.querySelector(".name").value;
      item.ingredients = box.querySelector(".ingredients").value;
      item.prices = box.querySelector(".prices").value.split(",").map(p => p.trim());
    });
  }

  const jsonContent = JSON.stringify(menuData, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(jsonContent)));

  const sha = await getFileSha(menuPath);
  await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${menuPath}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Aktualizacja menu przez Admin Panel",
      content: encoded,
      sha: sha
    })
  });
  alert("✅ Menu zostało zapisane!");
}

async function uploadFile(path, base64, message) {
  const encoded = base64.split(",")[1];
  const sha = await getFileSha(path).catch(() => null);
  const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: encoded,
      sha
    })
  });
  return res.json();
}

async function getFileSha(path) {
  const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
    headers: { "Authorization": `token ${githubToken}` }
  });
  const data = await res.json();
  return data.sha;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
