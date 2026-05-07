/**
 * Approval Queue Page — Side-by-side review vs AI reply with confidence score
 * Luxelens Automatic Review Reply System
 */
import { api } from '../api.js';
import { renderStars, getInitials, formatDate } from '../components/reviewCard.js';
import { showToast } from '../components/modal.js';

let currentIndex = 0;

export function renderApprovalQueue(container) {
  const reviews = api.getReviews();
  const queue = reviews.filter(r => r.status === 'replied' || r.status === 'pending')
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));

  // ── Hero always visible ──
  const heroHtml = `
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">QUEUE</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">APPROVAL&nbsp;</span><span class="hero-accent">QUEUE</span>
        </h1>
        <p class="hero-subtitle">Review, edit, and approve AI-generated replies before they go live.</p>
      </div>
    </div>
  `;

  if (queue.length === 0) {
    container.innerHTML = heroHtml + `
      <div class="page-container">
        <div class="empty-state" style="margin-top:0;">
          <span class="material-symbols-rounded">task_alt</span>
          <h3>All caught up!</h3>
          <p>No reviews pending approval. Check back later or trigger the n8n workflow to fetch new reviews.</p>
        </div>
      </div>
    `;
    return;
  }

  if (currentIndex >= queue.length) currentIndex = queue.length - 1;
  if (currentIndex < 0) currentIndex = 0;

  const review = queue[currentIndex];
  const sentimentClass = review.sentiment === 'positive' ? 'positive' : 'concerned';
  const confidence = review.confidence || 0;
  const confPercent = Math.round(confidence * 100);
  const confLevel = confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';

  container.innerHTML = heroHtml + `
    <div class="page-container">

      <!-- Progress Bar -->
      <div class="queue-progress animate-fade-up stagger-1">
        <div class="queue-progress-bar">
          <div class="queue-progress-fill" style="width:${Math.round(((currentIndex + 1) / queue.length) * 100)}%"></div>
        </div>
        <span class="queue-progress-label">
          Reviewing <strong>${currentIndex + 1}</strong> of <strong>${queue.length}</strong> pending
        </span>
        <div class="queue-nav-arrows">
          <button class="queue-nav-btn" id="approval-prev" ${currentIndex === 0 ? 'disabled' : ''}>
            <span class="material-symbols-rounded">chevron_left</span>
          </button>
          <button class="queue-nav-btn" id="approval-next" ${currentIndex >= queue.length - 1 ? 'disabled' : ''}>
            <span class="material-symbols-rounded">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Split View -->
      <div class="queue-split animate-fade-up stagger-2">

        <!-- Left: Original Review -->
        <div class="queue-panel">
          <div class="queue-panel-header">
            <span class="material-symbols-rounded queue-panel-icon">rate_review</span>
            <span class="queue-panel-title">Original Review</span>
            <span class="badge ${review.sentiment === 'positive' ? 'badge-positive' : 'badge-concerned'}" style="margin-left:auto;">
              ${review.sentiment === 'positive' ? 'Positive' : 'Concerned'}
            </span>
          </div>

          <div class="queue-reviewer-row">
            <div class="queue-avatar ${sentimentClass}">${getInitials(review.authorName)}</div>
            <div>
              <div class="queue-reviewer-name">${review.authorName}</div>
              <div class="queue-reviewer-meta">
                ${renderStars(review.starRating)}
                <span class="queue-meta-sep">·</span>
                <span>${formatDate(review.reviewDate)}</span>
              </div>
            </div>
          </div>

          <p class="queue-review-text">${review.comment}</p>

          <div class="queue-tags">
            <span class="badge badge-info">
              <span class="material-symbols-rounded" style="font-size:13px;vertical-align:middle;margin-right:3px;">
                ${(!review.platform || review.platform === 'playstore') ? 'android' : review.platform === 'appstore' ? 'phone_iphone' : 'storefront'}
              </span>
              ${(!review.platform || review.platform === 'playstore') ? 'Play Store' : review.platform === 'appstore' ? 'App Store' : 'GMB'}
            </span>
            ${review.deviceModel ? `<span class="badge badge-info">${review.deviceModel}</span>` : ''}
            ${review.appVersion ? `<span class="badge badge-info">v${review.appVersion}</span>` : ''}
            <span class="badge ${review.status === 'pending' ? 'badge-neutral' : 'badge-replied'}">${review.status === 'pending' ? 'Pending' : 'Has Reply'}</span>
          </div>
        </div>

        <!-- Right: AI Reply -->
        <div class="queue-panel">
          <div class="queue-panel-header">
            <span class="material-symbols-rounded queue-panel-icon ai">smart_toy</span>
            <span class="queue-panel-title">AI Generated Reply</span>
          </div>

          ${review.aiReply
            ? `<textarea class="queue-reply-textarea" id="approval-reply-text">${review.aiReply}</textarea>`
            : `<div class="queue-empty-reply">
                <span class="material-symbols-rounded">auto_awesome</span>
                <p>No AI reply yet.<br/>Click <strong>Generate Reply</strong> below.</p>
               </div>`
          }

          <!-- Confidence -->
          <div class="queue-confidence">
            <div class="queue-confidence-label">AI Confidence Score</div>
            <div class="queue-confidence-row">
              <div class="queue-confidence-bar">
                <div class="queue-confidence-fill ${confLevel}" style="width:${confPercent}%"></div>
              </div>
              <span class="queue-confidence-pct ${confLevel}">${confPercent}%</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="queue-actions">
            <div class="queue-actions-left">
              ${review.aiReply
                ? `<button class="btn btn-ghost-danger btn-sm" id="approval-reject">
                     <span class="material-symbols-rounded" style="font-size:16px;">close</span> Reject
                   </button>`
                : `<button class="btn btn-primary btn-sm" id="approval-generate">
                     <span class="material-symbols-rounded" style="font-size:16px;">auto_awesome</span> Generate Reply
                   </button>`
              }
            </div>
            <div class="queue-actions-right">
              <button class="btn btn-ghost btn-sm" id="approval-skip">
                <span class="material-symbols-rounded" style="font-size:16px;">skip_next</span> Skip
              </button>
              ${review.aiReply
                ? `<button class="btn btn-secondary btn-sm" id="approval-edit-approve">
                     <span class="material-symbols-rounded" style="font-size:16px;">edit</span> Edit
                   </button>
                   <button class="btn btn-success btn-sm" id="approval-approve">
                     <span class="material-symbols-rounded" style="font-size:16px;">check_circle</span> Approve
                   </button>`
                : ''
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  attachApprovalListeners(container, queue);
}


function attachApprovalListeners(container, queue) {
  const review = queue[currentIndex];

  // Navigation
  container.querySelector('#approval-prev')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderApprovalQueue(container);
    }
  });

  container.querySelector('#approval-next')?.addEventListener('click', () => {
    if (currentIndex < queue.length - 1) {
      currentIndex++;
      renderApprovalQueue(container);
    }
  });

  // Skip
  container.querySelector('#approval-skip')?.addEventListener('click', () => {
    if (currentIndex < queue.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    renderApprovalQueue(container);
  });

  // Approve
  container.querySelector('#approval-approve')?.addEventListener('click', () => {
    const textarea = container.querySelector('#approval-reply-text');
    const updatedReply = textarea ? textarea.value.trim() : review.aiReply;
    if (updatedReply) {
      api.updateReviewReply(review.reviewId, updatedReply);
      api.approveReply(review.reviewId);
      showToast(`Reply to ${review.authorName} approved!`, 'success');
      renderApprovalQueue(container);
    }
  });

  // Edit & Approve
  container.querySelector('#approval-edit-approve')?.addEventListener('click', () => {
    const textarea = container.querySelector('#approval-reply-text');
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth' });
      showToast('Edit the reply, then click Approve.', 'info');
    }
  });

  // Reject
  container.querySelector('#approval-reject')?.addEventListener('click', () => {
    api.rejectReply(review.reviewId);
    showToast(`Reply to ${review.authorName} rejected.`, 'info');
    renderApprovalQueue(container);
  });

  // Generate reply
  container.querySelector('#approval-generate')?.addEventListener('click', () => {
    const fallbackReply = review.starRating >= 4
      ? `Thank you so much for your kind words, ${review.authorName}! We're thrilled you're enjoying Luxelens. Your support means the world to us — we'll keep working hard to make your experience even better!`
      : `We sincerely apologize for your experience, ${review.authorName}. This is not the standard we hold at Luxelens. Please reach out at support@luxelens.com and we'll make it right for you immediately.`;

    api.updateReviewReply(review.reviewId, fallbackReply);
    showToast('AI reply generated!', 'success');
    renderApprovalQueue(container);
  });
}
