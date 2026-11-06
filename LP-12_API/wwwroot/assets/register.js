(() => {
  'use strict';
  const form = document.querySelector('#register-form');
  const username = form.querySelector('#username');
  const password = form.querySelector('#password');
  const confirmation = form.querySelector('#confirm-password');
  const submit = form.querySelector('button[type="submit"]');
  const error = document.querySelector('#register-error');
  const toggle = form.querySelector('.password-toggle');
  let submitting = false;

  function fieldError(input, message) {
    const target = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    target.textContent = message;
    target.hidden = !message;
  }

  function validate() {
    const name = username.value.trim();
    fieldError(username, /^[A-Za-z0-9._-]{3,30}$/.test(name)
      ? '' : 'Bitte verwende 3–30 Zeichen: A–Z, a–z, 0–9, Punkt, _ oder -.');
    fieldError(password, password.value.length < 8 || password.value.length > 72 ||
      new TextEncoder().encode(password.value).length > 72 || !password.value.trim()
      ? (password.value.length < 8 || !password.value.trim()
        ? 'Bitte wähle ein Passwort mit mindestens 8 Zeichen.'
        : 'Dieses Passwort ist zu lang. Bitte wähle ein kürzeres.') : '');
    fieldError(confirmation, confirmation.value && confirmation.value === password.value
      ? '' : 'Die Passwörter stimmen nicht überein.');
    const invalid = form.querySelector('[aria-invalid="true"]');
    if (invalid) invalid.focus();
    return !invalid;
  }

  function requestError(message) {
    error.textContent = message;
    error.hidden = !message;
  }

  for (const input of [username, password, confirmation]) {
    input.addEventListener('input', () => {
      fieldError(input, '');
      requestError('');
      if (input === password) fieldError(confirmation, '');
    });
  }

  toggle.addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? 'Verbergen' : 'Anzeigen';
    toggle.setAttribute('aria-label', visible ? 'Passwort verbergen' : 'Passwort anzeigen');
    toggle.setAttribute('aria-pressed', String(visible));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    requestError('');
    if (!validate()) return;

    submitting = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.firstElementChild.textContent = 'Konto wird erstellt …';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/Account/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value.trim(), password: password.value }),
        signal: controller.signal
      });
      if (response.status === 409) {
        fieldError(username, 'Dieser Benutzername ist bereits vergeben.');
        requestError('Dieser Benutzername ist bereits vergeben. Bitte wähle einen anderen.');
        username.focus();
        return;
      }
      if (response.status === 400) {
        requestError('Die Eingaben wurden nicht akzeptiert. Bitte prüfe Benutzername und Passwort.');
        return;
      }
      if (response.status === 429) {
        requestError('Zu viele Versuche. Bitte warte einen Moment.');
        return;
      }
      if (response.status !== 201) {
        requestError('Dein Konto konnte gerade nicht erstellt werden. Bitte versuche es später erneut.');
        return;
      }
      form.reset();
      password.type = 'password';
      form.hidden = true;
      document.querySelector('#register-success').hidden = false;
      document.querySelector('#success-title').focus();
    } catch (failure) {
      requestError(failure.name === 'AbortError'
        ? 'Der Server antwortet zu langsam. Prüfe vor einem neuen Versuch, ob du dich bereits anmelden kannst.'
        : 'Der Server ist nicht erreichbar. Bitte prüfe deine Verbindung und ob die API läuft.');
    } finally {
      clearTimeout(timeout);
      submitting = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      submit.firstElementChild.textContent = 'Konto erstellen';
    }
  });
})();
