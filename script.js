
const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';


function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errEl = document.getElementById('login-error');

  if (username === 'admin' && password === 'admin123') {
    window.location.href = 'issues.html';
  } else {
    errEl.classList.remove('hidden');
    setTimeout(() => errEl.classList.add('hidden'), 3000);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('signin-btn');
  if (btn) {
    btn.addEventListener('click', handleLogin);
  }

  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');

  if (usernameField) {
    usernameField.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLogin();
    });
  }

  if (passwordField) {
    passwordField.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLogin();
    });
  }
});
