// ===== Burger menu =====
const burger = document.getElementById('burger-icon');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');

burger.addEventListener('click', () => sideMenu.classList.add('open'));
closeMenu.addEventListener('click', () => sideMenu.classList.remove('open'));
sideMenu.addEventListener('click', e => {
  if (e.target.tagName === 'A') sideMenu.classList.remove('open');
});

// ===== Dynamiczne menu JSON =====
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
          </div>`;
      });
      html += '</div>';
    });

    container.innerHTML = html;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.menu-item').forEach(item => observer.observe(item));

    const headers = document.querySelectorAll('.menu-category');
    window.addEventListener('scroll', () => {
      headers.forEach(h => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 70 && rect.bottom > 0) h.classList.add('sticky-shadow');
        else h.classList.remove('sticky-shadow');
      });
    });

  } catch {
    container.innerHTML = '<p>Błąd podczas ładowania menu 😢</p>';
  }
}
document.addEventListener('DOMContentLoaded', loadMenu);

// ===== Przycisk "Wróć na górę" =====
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) scrollTopBtn.classList.add('show');
  else scrollTopBtn.classList.remove('show');
});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
