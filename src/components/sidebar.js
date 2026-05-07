/**
 * Top Navigation Bar — Luxelens ReviewAI
 * Floating pill nav matching the clean SaaS dashboard style.
 */
import { api } from '../api.js';

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',   badge: null },
  { path: '/play-store', label: 'Play Store',   badge: null },
  { path: '/app-store',  label: 'App Store',    badge: null },
  { path: '/gmb',        label: 'GMB Reviews',  badge: null },
  { path: '/approval',   label: 'Queue',        badgeId: 'nav-approval-badge' },
  { path: '/seo-audit',  label: 'SEO Audit',    badge: null },
  { path: '/chatbot',    label: 'AI Chat',      badge: null },
  { path: '/settings',   label: 'Settings',     badge: null },
];

export function renderSidebar(container) {
  const currentPath = window.location.hash.slice(1) || '/';
  const settings    = api.getSettings();
  const isLive      = settings.mode === 'live';

  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  nav.id = 'top-nav';

  nav.innerHTML = `
    <!-- Logo -->
    <div class="nav-logo">
      <div class="nav-logo-icon">&#x2B50;</div>
      <span>LUXELENS<sup style="font-size:9px;font-weight:700;opacity:.6">™</sup></span>
    </div>

    <!-- Links -->
    <div class="nav-links">
      ${NAV_ITEMS.map(item => `
        <a class="nav-link ${currentPath === item.path ? 'active' : ''}"
           href="#${item.path}"
           data-path="${item.path}">
          ${item.label}
          ${item.badgeId
            ? `<span class="nav-badge" id="${item.badgeId}" style="display:none">0</span>`
            : ''}
        </a>
      `).join('')}
    </div>

    <!-- Right actions -->
    <div class="nav-actions">
      <button class="nav-icon-btn" id="nav-refresh" title="Refresh reviews">
        <span class="material-symbols-rounded">refresh</span>
      </button>
      <button class="nav-mode-btn" id="nav-mode-toggle" title="Toggle Demo / Live mode">
        <span class="nav-mode-label-text" id="nav-mode-label">${isLive ? 'Live' : 'Demo'}</span>
        <span class="nav-toggle-track ${isLive ? 'live' : ''}" id="nav-toggle-track">
          <span class="nav-toggle-thumb" id="nav-toggle-thumb"></span>
        </span>
      </button>
      <button class="nav-theme-toggle" id="nav-theme-toggle">
        ☀ LIGHT
      </button>
      <button class="nav-icon-btn" id="nav-logout" title="Sign out">
        <span class="material-symbols-rounded">logout</span>
      </button>
    </div>
  `;

  container.prepend(nav);

  // Update active link on navigation
  window.addEventListener('hashchange', _updateActiveLink);

  return nav;
}

function _updateActiveLink() {
  const currentPath = window.location.hash.slice(1) || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    link.classList.toggle('active', linkPath === currentPath);
  });
}

export function updateSidebarStatus(mode) {
  const label = document.getElementById('nav-mode-label');
  const track = document.getElementById('nav-toggle-track');
  const isLive = mode === 'live';
  if (label) label.textContent = isLive ? 'Live' : 'Demo';
  if (track) track.className = `nav-toggle-track ${isLive ? 'live' : ''}`;
}

/** Call this with pending count to show/hide the approval badge */
export function updateApprovalBadge(count) {
  const badge = document.getElementById('nav-approval-badge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}
