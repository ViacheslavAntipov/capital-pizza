// ===== Obsługa burger menu =====
const burger = document.getElementById('burger-icon');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');

burger.addEventListener('click', () => sideMenu.classList.add('open'));
closeMenu.addEventListener('click', () => sideMenu.classList.remove('open'));
sideMenu.addEventListener('click', e => {
  if (e.target.tagName === 'A') sideMenu.classList.remove('open');
});

// ===== Dynamiczne ładowanie menu z JSON =====
async function loadMenu() {
  const container = document.getElementById('menu-container');
  try {
    const response = await fetch('menu.json');
    const data = await response.json();

    let html = '';

    Object.keys(data).forEach(category => {
      html += `<h3 class="menu-category">${category.toUpperCase()}</h3>`;
      html += '<div class="menu-grid">';
      data[category].forEach(item => {
        html += `
          <div class="menu-item">
            <h4>${item.name}</h4>
            <p>${item.ingredients}</p>
            <span class="price">${item.price}</span>
          </div>
        `;
      });
      html += '</div>';
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p>Błąd podczas ładowania menu 😢</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadMenu);
