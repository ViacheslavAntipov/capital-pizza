const categoryMap = {
  pizza: { name: "🍕 Pizza", sizes: ["Mała (25 cm)", "Średnia (30 cm)", "Familijna (40 cm)"] },
  dodatki_pizza: { name: "🧀 Dodatki do pizzy", sizes: ["Mała", "Średnia", "Familijna"] },
  zestawy: { name: "🍗 Zestawy obiadowe" },
  burgery: { name: "🍔 Burgery" },
  salatki: { name: "🥗 Sałatki" },
  pierogi: { name: "🥟 Pierogi", sizes: ["Mała (10 szt.)", "Duża (16 szt.)"] },
  dodatki: { name: "🍟 Dodatki" },
  sosy_i_oliwy: { name: "🌶 Sosy i oliwy" },
  piwa: { name: "🍺 Piwa bezalkoholowe" },
  napoje: { name: "🧃 Napoje zimne", sizes: ["200 ml", "500 ml", "1 l"] }
};

async function loadMenu() {
  const container = document.getElementById("menu-container");
  try {
    const response = await fetch("menu.json");
    const data = await response.json();
    container.innerHTML = "";

    for (const [key, items] of Object.entries(data)) {
      const section = document.createElement("div");
      section.classList.add("menu-section");

      const sticky = document.createElement("div");
      sticky.classList.add("menu-sticky");

      const title = document.createElement("div");
      title.classList.add("menu-category");
      title.textContent = categoryMap[key]?.name || key;
      sticky.appendChild(title);

      if (categoryMap[key]?.sizes) {
        const sizesDiv = document.createElement("div");
        sizesDiv.classList.add("menu-sizes");
        sizesDiv.innerHTML = categoryMap[key].sizes.map(s => `<span>${s}</span>`).join("");
        sticky.appendChild(sizesDiv);
      }

      section.appendChild(sticky);

      const grid = document.createElement("div");
      grid.classList.add("menu-grid");

      items.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("menu-item");

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("menu-info");

        const nameEl = document.createElement("h4");
        nameEl.textContent = `${index + 1}. ${item.name}`;
        infoDiv.appendChild(nameEl);

        if (item.ingredients) {
          const ingr = document.createElement("p");
          ingr.textContent = item.ingredients;
          infoDiv.appendChild(ingr);
        }

        const priceDiv = document.createElement("div");
        priceDiv.classList.add("menu-prices");
        if (item.prices?.length) {
          item.prices.forEach(price => {
            const box = document.createElement("div");
            box.classList.add("price-box");
            box.textContent = price;
            priceDiv.appendChild(box);
          });
        }

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(priceDiv);

        // === Kliknięcie pozycji ===
        itemDiv.addEventListener("click", () => {
          if (!item.image) return;
          showPhotoPopup(item);
        });

        grid.appendChild(itemDiv);
      });

      section.appendChild(grid);
      container.appendChild(section);
    }
  } catch {
    container.innerHTML = "<p>Błąd podczas ładowania menu 😥</p>";
  }
}

// === POPUP I MODAL ===
function showPhotoPopup(item) {
  const popup = document.getElementById("photo-popup");
  popup.innerHTML = `
    <div class="box">
      <p>👀 Zobaczyć zdjęcie <strong>${item.name}</strong>?</p>
      <div>
        <button onclick='openPhoto(${JSON.stringify(item)})'>Pokaż</button>
        <button onclick="closePopup()">Anuluj</button>
      </div>
    </div>
  `;
  popup.classList.remove("hidden");
}

function closePopup() {
  document.getElementById("photo-popup").classList.add("hidden");
}

function openPhoto(item) {
  closePopup();
  const modal = document.getElementById("photo-modal");
  modal.innerHTML = `
    <div class="content">
      <span class="close" onclick="closePhoto()">×</span>
      <h2>${item.name}</h2>
      <img src="${item.image}" alt="${item.name}">
      <p>${item.ingredients}</p>
      <div class="menu-prices">${item.prices.join(" / ")}</div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function closePhoto() {
  document.getElementById("photo-modal").classList.add("hidden");
}

// === BURGER + SCROLL ===
document.getElementById("burger-icon").addEventListener("click", () =>
  document.getElementById("side-menu").classList.add("open")
);
document.getElementById("close-menu").addEventListener("click", () =>
  document.getElementById("side-menu").classList.remove("open")
);

const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) scrollBtn.classList.add("show");
  else scrollBtn.classList.remove("show");
});
scrollBtn.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

document.addEventListener("DOMContentLoaded", loadMenu);
