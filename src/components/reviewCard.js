/**
 * Review Card Component — Luxelens
 */
export function renderStars(rating) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
  }
  html += '</div>';
  return html;
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function renderReviewCard(review, options = {}) {
  const { showActions = true, compact = false, showApproval = false } = options;
  const sentimentClass = review.sentiment === 'positive' ? 'positive' : 'concerned';
  const statusBadge = review.status === 'replied' 
    ? '<span class="badge badge-replied">Replied</span>'
    : review.status === 'approved'
    ? '<span class="badge badge-positive">Approved</span>'
    : '<span class="badge badge-neutral">Pending</span>';

  const replySection = review.aiReply ? `
    <div class="review-card-reply">
      <div class="review-card-reply-label">
        <span class="material-symbols-rounded" style="font-size: 14px;">smart_toy</span>
        AI Generated Reply
      </div>
      <div class="review-card-reply-text">${review.aiReply}</div>
    </div>
  ` : '';

  // Build action buttons
  let actionsHtml = '';
  if (showActions) {
    const approvalButtons = (showApproval && review.aiReply && review.status === 'replied') ? `
      <button class="btn btn-success btn-sm" data-action="approve-reply" data-review-id="${review.reviewId}">
        <span class="material-symbols-rounded" style="font-size: 16px;">check_circle</span>
        Approve
      </button>
      <button class="btn btn-danger btn-sm" data-action="reject-reply" data-review-id="${review.reviewId}">
        <span class="material-symbols-rounded" style="font-size: 16px;">close</span>
        Reject
      </button>
    ` : '';

    actionsHtml = `
      <div class="review-card-actions">
        ${approvalButtons}
        ${review.status === 'pending' ? `
          <button class="btn btn-primary btn-sm" data-action="generate-reply" data-review-id="${review.reviewId}">
            <span class="material-symbols-rounded" style="font-size: 16px;">auto_awesome</span>
            Generate Reply
          </button>
        ` : ''}
        <button class="btn btn-secondary btn-sm" data-action="edit-reply" data-review-id="${review.reviewId}">
          <span class="material-symbols-rounded" style="font-size: 16px;">edit</span>
          ${review.aiReply ? 'Edit' : 'Write'} Reply
        </button>
        ${review.status === 'replied' || review.status === 'approved' ? `
          <button class="btn btn-success btn-sm" data-action="post-reply" data-review-id="${review.reviewId}">
            <span class="material-symbols-rounded" style="font-size: 16px;">send</span>
            Post to Play Store
          </button>
        ` : ''}
      </div>
    `;
  }

  return `
    <div class="review-card glass-card animate-fade-in" data-review-id="${review.reviewId}" id="review-${review.reviewId}">
      <div class="review-card-header">
        <div class="review-card-author">
          <div class="review-card-avatar ${sentimentClass}">${getInitials(review.authorName)}</div>
          <div class="review-card-author-info">
            <span class="review-card-name">${review.authorName}</span>
            <div class="review-card-meta">
              ${renderStars(review.starRating)}
              <span>·</span>
              <span>${formatDate(review.reviewDate)}</span>
              ${review.deviceModel ? `<span>·</span><span>${review.deviceModel}</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--sp-2);">
          <span class="badge ${review.sentiment === 'positive' ? 'badge-positive' : 'badge-concerned'}">${review.sentiment === 'positive' ? 'Positive' : 'Concerned'}</span>
          ${statusBadge}
        </div>
      </div>
      <div class="review-card-comment">${review.comment}</div>
      ${replySection}
      ${actionsHtml}
    </div>
  `;
}
