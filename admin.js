// === LOGOWANIE Z SESJĄ ===
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minut

// Sprawdź przy starcie, czy użytkownik ma aktywną sesję
checkLoginSession();

function checkLoginSession() {
  const session = JSON.parse(localStorage.getItem("adminSession"));
  const now = Date.now();

  if (session && session.loggedIn && (now - session.lastActivity < SESSION_TIMEOUT)) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    init();
  } else {
    localStorage.removeItem("adminSession");
  }
}

// Obsługa logowania
document.getElementById("login-btn").addEventListener("click", () => {
  const pass = document.getElementById("admin-password").value;
  if (pass === PASSWORD) {
    localStorage.setItem("adminSession", JSON.stringify({
      loggedIn: true,
      lastActivity: Date.now()
    }));
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    init();
  } else {
    document.getElementById("login-error").textContent = "❌ Nieprawidłowe hasło";
  }
});

// Nasłuchiwanie aktywności – przedłużenie sesji
document.addEventListener("click", updateLastActivity);
document.addEventListener("keypress", updateLastActivity);

function updateLastActivity() {
  const session = JSON.parse(localStorage.getItem("adminSession"));
  if (session && session.loggedIn) {
    session.lastActivity = Date.now();
    localStorage.setItem("adminSession", JSON.stringify(session));
  }
}

// Funkcja wylogowania (np. do dodania przycisku „Wyloguj”)
function logoutAdmin() {
  localStorage.removeItem("adminSession");
  location.reload();
}
