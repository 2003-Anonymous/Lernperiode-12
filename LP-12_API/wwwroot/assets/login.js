const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#login-error");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  errorMessage.textContent = "";
  submitButton.disabled = true;

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch("/Account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({ username, password })
    });

    if (response.status === 401) {
      errorMessage.textContent = "Benutzername oder Passwort falsch.";
      return;
    }

    if (!response.ok) {
      errorMessage.textContent = "Die Anmeldung ist gerade nicht möglich.";
      return;
    }

    window.location.href = "home.html";
  } catch {
    errorMessage.textContent =
      "Der Server ist nicht erreichbar. Bitte prüfe, ob die API läuft.";
  } finally {
    submitButton.disabled = false;
  }
});