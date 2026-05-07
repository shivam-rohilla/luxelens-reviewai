/**
 * Modal Component
 */
export function showModal({ title, bodyHtml, onSave, saveLabel = 'Save', showCancel = true }) {
  // Remove existing modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close-btn">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      <div class="modal-footer">
        ${showCancel ? '<button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>' : ''}
        ${onSave ? `<button class="btn btn-primary" id="modal-save-btn">${saveLabel}</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const close = () => overlay.remove();
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  if (showCancel) overlay.querySelector('#modal-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Save handler
  if (onSave) {
    overlay.querySelector('#modal-save-btn').addEventListener('click', () => {
      onSave(overlay);
      close();
    });
  }

  return overlay;
}

/**
 * Toast Notification
 */
let toastContainer = null;

export function showToast(message, type = 'info') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="material-symbols-rounded">${icons[type] || 'info'}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove after 4s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
