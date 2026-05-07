/**
 * Login Page — Luxelens ReviewAI
 */
import { attemptLogin, getRateLimitStatus } from '../auth.js';

export function renderLogin(onSuccess) {
  const existing = document.getElementById('login-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'login-overlay';
  overlay.className = 'login-overlay';

  overlay.innerHTML = `
    <div class="login-card animate-fade-in">
      <div class="login-logo">
        <div class="login-logo-icon">&#x2B50;</div>
        <span class="login-logo-text">LUXELENS<sup style="font-size:9px;font-weight:700;opacity:.6">™</sup></span>
      </div>

      <h2 class="login-title">Welcome back</h2>
      <p class="login-sub">Sign in to your ReviewAI dashboard</p>

      <form class="login-form" id="login-form" autocomplete="off">
        <div class="login-field">
          <label class="label" for="login-username">Username</label>
          <input class="input-field" type="text" id="login-username"
            placeholder="Enter your username"
            autocomplete="username" spellcheck="false" />
        </div>

        <div class="login-field">
          <label class="label" for="login-password">Password</label>
          <div class="login-pw-wrap">
            <input class="input-field" type="password" id="login-password"
              placeholder="Enter your password"
              autocomplete="current-password" />
            <button type="button" class="login-pw-eye" id="login-pw-toggle" tabindex="-1">
              <span class="material-symbols-rounded" id="login-eye-icon">visibility</span>
            </button>
          </div>
        </div>

        <div class="login-error" id="login-error" style="display:none"></div>

        <button class="btn btn-primary login-btn" type="submit" id="login-submit">
          <span id="login-btn-label">Sign In</span>
          <span id="login-spinner" class="material-symbols-rounded" style="display:none;animation:spin 0.8s linear infinite;font-size:18px">refresh</span>
        </button>
      </form>

      <p class="login-footer">Luxelens ReviewAI &copy; 2025</p>
    </div>
  `;

  document.body.appendChild(overlay);
  _attachListeners(overlay, onSuccess);

  // Focus username after animation
  setTimeout(() => overlay.querySelector('#login-username')?.focus(), 300);
}

function _attachListeners(overlay, onSuccess) {
  const form      = overlay.querySelector('#login-form');
  const errorEl   = overlay.querySelector('#login-error');
  const submitBtn = overlay.querySelector('#login-submit');
  const label     = overlay.querySelector('#login-btn-label');
  const spinner   = overlay.querySelector('#login-spinner');
  const pwInput   = overlay.querySelector('#login-password');
  const eyeBtn    = overlay.querySelector('#login-pw-toggle');
  const eyeIcon   = overlay.querySelector('#login-eye-icon');

  // Show lockout message immediately if already locked
  const status = getRateLimitStatus();
  if (status.locked) _showError(errorEl, `Account locked. Try again in ${Math.ceil(status.remaining / 60)} min.`, true);

  // Toggle password visibility
  eyeBtn.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? 'visibility' : 'visibility_off';
  });

  // Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const username = overlay.querySelector('#login-username').value;
    const password = pwInput.value;

    if (!username || !password) {
      _showError(errorEl, 'Please enter both username and password.');
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    label.style.display = 'none';
    spinner.style.display = 'inline-block';
    _hideError(errorEl);

    // Small artificial delay so timing attacks learn nothing
    const [result] = await Promise.all([
      attemptLogin(username, password),
      new Promise(r => setTimeout(r, 600))
    ]);

    submitBtn.disabled = false;
    label.style.display = 'inline';
    spinner.style.display = 'none';

    if (result.success) {
      overlay.classList.add('login-fade-out');
      setTimeout(() => { overlay.remove(); onSuccess(); }, 400);
    } else {
      _showError(errorEl, result.error, result.locked);
      pwInput.value = '';
      pwInput.focus();
      // Shake the card
      const card = overlay.querySelector('.login-card');
      card.classList.add('login-shake');
      setTimeout(() => card.classList.remove('login-shake'), 500);
    }
  });
}

function _showError(el, msg, isLock = false) {
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = isLock ? '#d97706' : '#dc2626';
}
function _hideError(el) { el.style.display = 'none'; }
