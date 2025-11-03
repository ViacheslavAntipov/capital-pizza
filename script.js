// === MAPA KATEGORII ===
const categoryMap = {
  pizza: "🍕 Pizza",
  dodatki_pizza: "🧀 Dodatki do pizzy",
  zestawy: "🍗 Zestawy obiadowe",
  burgery: "🍔 Burgery",
  salatki: "🥗 Sałatki",
  pierogi: "🥟 Pierogi",
  dodatki: "🍟 Dodatki",
  sosy_i_oliwy: "🌶 Sosy i oliwy",
  piwa: "🍺 Piwa bezalkoholowe",
  napoje: "🧃 Napoje zimne"
};

// === POBIERANIE MENU ===
async function loadMenu() {
  const container = document.getElementById("menu-container");
  try {
    const response = await fetch("menu.json");
    if (!response.ok) throw new Error("Błąd ładowania menu");
    const data = await response.json();

    container.innerHTML = "";

    for (const [key, items] of Object.entries(data)) {
      const section = document.createElement("div");
      section.classList.add("menu-section");

      // Tytuł kategorii
      const title = document.createElement("h3");
      title.textContent = categoryMap[key] || key;
      title.classList.add("menu-category");
      section.appendChild(title);

      // Jeśli pizza – dodaj nagłówek z rozmiarami
      if (key === "pizza") {
        const sizes = document.createElement("div");
        sizes.classList.add("menu-sizes");
        sizes.innerHTML = "<span>Mała (25 cm)</span><span>Średnia (30 cm)</span><span>Familijna (40 cm)</span>";
        section.appendChild(sizes);
      }

      // Kontener pozycji
      const grid = document.createElement("div");
      grid.classList.add("menu-grid");

      items.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("menu-item");

        // Lewa strona: nazwa + składniki
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

        // Prawa strona: ceny
        const priceDiv = document.createElement("div");
        priceDiv.classList.add("menu-prices");

        if (item.prices && item.prices.length > 0) {
          item.prices.forEach(price => {
            const box = document.createElement("div");
            box.classList.add("price-box");
            box.textContent = price;
            priceDiv.appendChild(box);
          });
        }

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(priceDiv);
        grid.appendChild(itemDiv);
      });

      section.appendChild(grid);
      container.appendChild(section);
    }
  } catch (err) {
    container.innerHTML = "<p>Błąd podczas ładowania menu 😥</p>";
  }
}

// === BURGER MENU ===
const burger = document.getElementById("burger-icon");
const sideMenu = document.getElementById("side-menu");
const closeMenu = document.getElementById("close-menu");

burger.addEventListener("click", () => sideMenu.classList.add("open"));
closeMenu.addEventListener("click", () => sideMenu.classList.remove("open"));

// === SCROLL TO TOP ===
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) scrollBtn.classList.add("show");
  else scrollBtn.classList.remove("show");
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// === INIT ===
document.addEventListener("DOMContentLoaded", loadMenu);
