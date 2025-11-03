// === CONFIG ===
// Mapowanie kategorii na ładne tytuły + emoji
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
    if (!response.ok) throw new Error("Błąd podczas pobierania menu");
    const data = await response.json();

    container.innerHTML = "";

    // Dla każdej kategorii twórz sekcję
    for (const [key, items] of Object.entries(data)) {
      const section = document.createElement("div");
      section.classList.add("menu-section");

      // Nagłówek kategorii
      const title = document.createElement("h3");
      title.textContent = categoryMap[key] || key;
      title.classList.add("menu-category");
      section.appendChild(title);

      // Kontener pozycji
      const grid = document.createElement("div");
      grid.classList.add("menu-grid");

      // Tworzenie pozycji
      items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("menu-item");

        // Nazwa + składniki
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("menu-info");
        const nameEl = document.createElement("h4");
        nameEl.textContent = item.name;
        infoDiv.appendChild(nameEl);

        if (item.ingredients) {
          const ingr = document.createElement("p");
          ingr.textContent = item.ingredients;
          infoDiv.appendChild(ingr);
        }

        if (item.note) {
          const note = document.createElement("p");
          note.classList.add("note");
          note.style.fontSize = "12px";
          note.style.color = "#666";
          note.textContent = item.note;
          infoDiv.appendChild(note);
        }

        // Ceny i rozmiary
        const priceDiv = document.createElement("div");
        priceDiv.classList.add("menu-prices");

        if (item.prices && item.prices.length > 0) {
          for (let i = 0; i < item.prices.length; i++) {
            const row = document.createElement("div");
            row.classList.add("price-row");

            if (item.sizes && item.sizes[i]) {
              const size = document.createElement("span");
              size.classList.add("size");
              size.textContent = item.sizes[i];
              row.appendChild(size);
            }

            const price = document.createElement("span");
            price.classList.add("price");
            price.textContent = item.prices[i];
            row.appendChild(price);

            priceDiv.appendChild(row);
          }
        }

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(priceDiv);
        grid.appendChild(itemDiv);
      });

      section.appendChild(grid);
      container.appendChild(section);
    }

    // Efekt pojawiania się elementów
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".menu-item").forEach(el => observer.observe(el));

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Błąd podczas ładowania menu 😥</p>";
  }
}

// === STICKY SHADOW ===
window.addEventListener("scroll", () => {
  const cats = document.querySelectorAll(".menu-category");
  cats.forEach(cat => {
    const rect = cat.getBoundingClientRect();
    if (rect.top <= 70 && rect.bottom >= 70) {
      cat.classList.add("sticky-shadow");
    } else {
      cat.classList.remove("sticky-shadow");
    }
  });
});

// === BURGER MENU ===
const burger = document.getElementById("burger-icon");
const sideMenu = document.getElementById("side-menu");
const closeMenu = document.getElementById("close-menu");

burger.addEventListener("click", () => sideMenu.classList.add("open"));
closeMenu.addEventListener("click", () => sideMenu.classList.remove("open"));

// === SCROLL TO TOP BUTTON ===
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// === INICJALIZACJA ===
document.addEventListener("DOMContentLoaded", loadMenu);
