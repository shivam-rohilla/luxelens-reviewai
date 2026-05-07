/**
 * Simple hash-based SPA Router
 */
export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.navigate());
    window.addEventListener('load', () => this.navigate());
  }

  navigate(path) {
    if (path) {
      window.location.hash = path;
      return;
    }

    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes.find(r => r.path === hash) || this.routes[0];

    if (this.currentRoute !== route.path) {
      this.currentRoute = route.path;
      const pageBody = document.querySelector('.page-body');
      if (pageBody) {
        pageBody.innerHTML = '';
        route.render(pageBody);
      }

      // Update active nav
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.path === route.path);
      });

      // Update page header
      const titleEl = document.querySelector('.page-title');
      const subtitleEl = document.querySelector('.page-subtitle');
      if (titleEl) titleEl.textContent = route.title;
      if (subtitleEl) {
        subtitleEl.textContent = route.subtitle || '';
        subtitleEl.style.display = route.subtitle ? 'block' : 'none';
      }
    }
  }

  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }
}
