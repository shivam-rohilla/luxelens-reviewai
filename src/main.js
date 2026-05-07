/**
 * Luxelens Review Dashboard — Main Entry Point
 */
import './css/variables.css';
import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/pages.css';

import { Router }           from './router.js';
import { renderSidebar, updateSidebarStatus, updateApprovalBadge } from './components/sidebar.js';
import { renderDashboard }  from './pages/dashboard.js';
import { renderReviews as renderPlayStoreReviews } from './pages/playStore.js';
import { renderAppStoreReviews } from './pages/appStore.js';
import { renderGmbReviews }      from './pages/gmb.js';
import { renderSeoAudit }        from './pages/seoAudit.js';
import { renderApprovalQueue }   from './pages/approvalQueue.js';
import { renderSettings }        from './pages/settings.js';
import { renderChatbot }         from './pages/chatbot.js';
import { api }              from './api.js';
import { showToast }        from './components/modal.js';
import { isLoggedIn, logout } from './auth.js';
import { renderLogin }      from './pages/login.js';

function initApp() {
  if (!isLoggedIn()) {
    renderLogin(() => _bootApp());
    return;
  }
  _bootApp();
}

function _bootApp() {
  const app = document.getElementById('app');

  // App shell — just a top-nav + scrollable main content area
  app.innerHTML = `
    <main class="main-content">
      <div class="page-body" id="page-body"></div>
    </main>
  `;

  // Render top navigation bar
  renderSidebar(app);

  // Sync mode indicator in nav
  const settings = api.getSettings();
  updateSidebarStatus(settings.mode);

  // Routes
  const routes = [
    { path: '/',           render: renderDashboard },
    { path: '/play-store', render: renderPlayStoreReviews },
    { path: '/app-store',  render: renderAppStoreReviews },
    { path: '/gmb',        render: renderGmbReviews },
    { path: '/approval',   render: renderApprovalQueue },
    { path: '/settings',   render: renderSettings },
    { path: '/chatbot',    render: renderChatbot },
    { path: '/seo-audit',  render: renderSeoAudit },
  ];

  const router = new Router(routes);

  // Update approval badge on every navigation
  const _refreshBadge = () => {
    const pending = api.getReviews().filter(r => r.status === 'pending' || (r.aiReply && r.status === 'replied')).length;
    updateApprovalBadge(pending);
  };
  _refreshBadge();
  window.addEventListener('hashchange', _refreshBadge);

  // Global event delegation
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#nav-trigger-workflow')) {
      showToast('Triggering n8n workflow...', 'info');
      const result = await api.fetchLiveReviews('playstore');
      showToast(result.message, result.success ? 'success' : 'error');
    }

    if (e.target.closest('#nav-refresh')) {
      const btn = document.getElementById('nav-refresh');
      const icon = btn?.querySelector('.material-symbols-rounded');
      if (icon) icon.style.animation = 'spin 0.7s linear infinite';
      showToast('Refreshing review data...', 'info');
      const path   = window.location.hash.slice(1) || '/';
      let platform = 'playstore';
      if (path === '/app-store') platform = 'appstore';
      if (path === '/gmb')       platform = 'gmb';
      const result = await api.fetchLiveReviews(platform);
      if (icon) icon.style.animation = '';
      showToast(result.message, result.success ? 'success' : 'error');
      router.currentRoute = null;
      router.navigate();
      _refreshBadge();
    }

    // Toggle Demo / Live mode
    if (e.target.closest('#nav-mode-toggle')) {
      const current = api.getSettings().mode;
      const next    = current === 'demo' ? 'live' : 'demo';
      api.saveSettings({ mode: next });
      updateSidebarStatus(next);
      showToast(next === 'live' ? 'Switched to Live Mode' : 'Switched to Demo Mode', 'info');
    }

    // Logout
    if (e.target.closest('#nav-logout')) {
      logout();
      renderLogin(() => _bootApp());
      return;
    }

    // Light/Dark toggle (cosmetic)
    if (e.target.closest('#nav-theme-toggle')) {
      const btn = document.getElementById('nav-theme-toggle');
      if (btn) btn.textContent = btn.textContent.includes('LIGHT') ? '🌙 DARK' : '☀ LIGHT';
      showToast('Theme toggle coming soon!', 'info');
    }
  });
}

document.addEventListener('DOMContentLoaded', initApp);
