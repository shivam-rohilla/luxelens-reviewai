/**
 * App Store Reviews Page — Luxelens ReviewAI
 * Fetches live data from analytics webhook, falls back to local mock data.
 */
import { api } from '../api.js';
import { renderReviewCard } from '../components/reviewCard.js';
import { showModal, showToast } from '../components/modal.js';

let currentFilter = 'all';
let searchQuery = '';

// ── Route handler (async — fetches then renders) ──────────────────────────────
export async function renderAppStoreReviews(container) {
  _showLoading(container);
  await api.fetchWebhookReviews('appstore');
  _renderPage(container);
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function _showLoading(container) {
  container.innerHTML = `
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">APP STORE</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">APP STORE&nbsp;</span><span class="hero-accent">REVIEWS</span>
        </h1>
        <p class="hero-subtitle">Manage and reply to your Apple App Store reviews with AI assistance.</p>
      </div>
    </div>
    <div class="page-container">
      <div class="loading-state">
        <div class="spinner"></div>
        <span>Fetching live reviews…</span>
      </div>
    </div>`;
}

// ── Internal render (called by filters, search, card actions) ─────────────────
function _renderPage(container) {
  const reviews = api.getReviews().filter(r => r.platform === 'appstore');

  const total     = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((s, r) => s + r.starRating, 0) / total).toFixed(1) : '—';
  const pending   = reviews.filter(r => r.status === 'pending').length;
  const positive  = reviews.filter(r => r.sentiment === 'positive').length;

  container.innerHTML = `
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">APP STORE</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">APP STORE&nbsp;</span><span class="hero-accent">REVIEWS</span>
        </h1>
        <p class="hero-subtitle">Manage and reply to your Apple App Store reviews with AI assistance.</p>
      </div>
    </div>

    <div class="page-container">
      <div class="stats-row animate-fade-up">
        <div class="stat-card stagger-1">
          <span class="stat-icon">&#x2B50;</span>
          <div class="stat-value">${avgRating}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
        <div class="stat-card stagger-2">
          <span class="stat-icon">&#x1F4F1;</span>
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total Reviews</div>
        </div>
        <div class="stat-card stagger-3">
          <span class="stat-icon">&#x23F3;</span>
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card stagger-4">
          <span class="stat-icon">&#x1F60A;</span>
          <div class="stat-value">${positive}</div>
          <div class="stat-label">Positive</div>
        </div>
      </div>

      <div class="filter-bar">
        <button class="filter-pill ${currentFilter === 'all'       ? 'active' : ''}" data-filter="all">All (${total})</button>
        <button class="filter-pill ${currentFilter === 'positive'  ? 'active' : ''}" data-filter="positive">Positive (${positive})</button>
        <button class="filter-pill ${currentFilter === 'concerned' ? 'active' : ''}" data-filter="concerned">Concerned (${reviews.filter(r => r.sentiment === 'concerned').length})</button>
        <button class="filter-pill ${currentFilter === 'pending'   ? 'active' : ''}" data-filter="pending">Pending (${pending})</button>
        <button class="filter-pill ${currentFilter === 'replied'   ? 'active' : ''}" data-filter="replied">Replied (${reviews.filter(r => r.status === 'replied').length})</button>
        <div class="filter-bar-sep"></div>
        <input type="text" class="input-field" id="review-search"
          placeholder="Search reviews…" value="${searchQuery}"
          style="max-width:220px;padding:6px 12px;" />
      </div>

      <div class="review-list" id="reviews-list">
        ${_renderFiltered(reviews)}
      </div>
    </div>`;

  _attachListeners(container, reviews);
}

// ── Filtered review list ──────────────────────────────────────────────────────
function _renderFiltered(reviews) {
  let filtered = [...reviews];
  if (currentFilter === 'positive')  filtered = filtered.filter(r => r.sentiment === 'positive');
  else if (currentFilter === 'concerned') filtered = filtered.filter(r => r.sentiment === 'concerned');
  else if (currentFilter === 'pending')   filtered = filtered.filter(r => r.status === 'pending');
  else if (currentFilter === 'replied')   filtered = filtered.filter(r => r.status === 'replied');

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.authorName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (r.aiReply && r.aiReply.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));

  if (filtered.length === 0) {
    return `<div class="empty-state">
      <span class="material-symbols-rounded">search_off</span>
      <h3>No reviews found</h3>
      <p>Try adjusting your filters or search query</p>
    </div>`;
  }

  return filtered.map((r, i) => {
    const card = renderReviewCard(r, { showApproval: true });
    return card.replace('animate-fade-in', `animate-fade-in stagger-${Math.min(i + 1, 6)}`);
  }).join('');
}

// ── Event listeners ───────────────────────────────────────────────────────────
function _attachListeners(container, reviews) {
  container.querySelectorAll('.filter-pill').forEach(chip => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.filter;
      _renderPage(container);
    });
  });

  const searchInput = container.querySelector('#review-search');
  let debounce;
  searchInput?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = e.target.value;
      const listEl = container.querySelector('#reviews-list');
      if (listEl) {
        listEl.innerHTML = _renderFiltered(api.getReviews().filter(r => r.platform === 'appstore'));
        _attachCardActions(container);
      }
    }, 300);
  });

  _attachCardActions(container);
}

function _attachCardActions(container) {
  container.querySelectorAll('[data-action="edit-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const review = api.getReviewById(btn.dataset.reviewId);
      if (!review) return;
      showModal({
        title: `Reply to ${review.authorName}`,
        bodyHtml: `
          <div style="margin-bottom:var(--sp-4)">
            <div style="font-size:var(--fs-sm);color:var(--text-3);margin-bottom:var(--sp-2)">
              Original Review (${review.starRating}★):
            </div>
            <div style="font-size:var(--fs-sm);color:var(--text-2);padding:var(--sp-3);background:var(--surface-2);border-radius:var(--r-md)">
              ${review.comment}
            </div>
          </div>
          <div class="form-group">
            <label class="label">Your Reply</label>
            <textarea class="textarea-field" id="modal-reply-text" rows="5"
              placeholder="Type your reply here…">${review.aiReply || ''}</textarea>
          </div>`,
        saveLabel: 'Save Reply',
        onSave: overlay => {
          const text = overlay.querySelector('#modal-reply-text').value.trim();
          if (text) { api.updateReviewReply(review.reviewId, text); showToast('Reply saved!', 'success'); _renderPage(container); }
        }
      });
    });
  });

  container.querySelectorAll('[data-action="generate-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const review = api.getReviewById(btn.dataset.reviewId);
      if (!review) return;
      const reply = review.starRating >= 4
        ? `Thank you so much for your kind words, ${review.authorName}! We're thrilled you're enjoying Luxelens on iOS. Your support means a lot — we'll keep making your experience better!`
        : `We sincerely apologize for your experience, ${review.authorName}. Please reach out to support@luxelens.com and we'll make it right immediately.`;
      api.updateReviewReply(review.reviewId, reply);
      showToast('AI reply generated!', 'success');
      _renderPage(container);
    });
  });

  container.querySelectorAll('[data-action="approve-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      api.approveReply(btn.dataset.reviewId);
      showToast('Reply approved!', 'success');
      _renderPage(container);
    });
  });

  container.querySelectorAll('[data-action="reject-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      api.rejectReply(btn.dataset.reviewId);
      showToast('Reply rejected. Review moved to pending.', 'info');
      _renderPage(container);
    });
  });

  container.querySelectorAll('[data-action="post-reply"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const review = api.getReviewById(btn.dataset.reviewId);
      if (!review || !review.aiReply) return;
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;animation:spin 1s linear infinite">refresh</span> Posting…';
      const result = await api.postReply(review.reviewId, review.aiReply, 'appstore');
      showToast(result.message, result.success ? 'success' : 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">check_circle</span> Posted';
    });
  });
}
