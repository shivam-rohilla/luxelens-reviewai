/**
 * Test Review Page — Submit test reviews to n8n for AI processing
 * Bypasses Google Business Profile API (for when quota = 0)
 */
import { api } from '../api.js';
import { showToast } from '../components/modal.js';
import { renderStars } from '../components/reviewCard.js';

let selectedRating = 5;

export function renderTestReview(container) {
  const settings = api.getSettings();
  const hasWebhook = settings.webhookUrl && settings.webhookUrl.trim() !== '';

  container.innerHTML = `
    <div style="max-width: 720px; margin: 0 auto;">
      <!-- Info Banner -->
      <div class="glass-card animate-fade-in stagger-1" style="padding: var(--space-5) var(--space-6); margin-bottom: var(--space-6); border-left: 4px solid var(--accent-primary);">
        <div style="display: flex; align-items: flex-start; gap: var(--space-3);">
          <span class="material-symbols-rounded" style="color: var(--accent-primary); font-size: 24px; margin-top: 2px;">science</span>
          <div>
            <div style="font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-1);">Test Mode</div>
            <div style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">
              Submit a test review to your n8n workflow. The AI will generate a reply and log it to your Google Sheet — 
              no Google Business Profile API needed.
              ${!hasWebhook ? '<br/><span style="color: var(--accent-danger); font-weight: var(--font-weight-semibold);">⚠ No webhook URL configured. Go to Settings first.</span>' : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Test Review Form -->
      <div class="glass-card animate-fade-in stagger-2" style="padding: var(--space-8);">
        <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">
          <span class="material-symbols-rounded" style="font-size: 22px;">edit_note</span>
          Write a Test Review
        </h3>

        <!-- Reviewer Name -->
        <div class="input-group" style="margin-bottom: var(--space-5);">
          <label class="input-label">Reviewer Name</label>
          <input type="text" class="input-field" id="test-reviewer-name" 
                 value="Test User" placeholder="Enter reviewer name..." style="max-width: 400px;" />
        </div>

        <!-- Star Rating -->
        <div class="input-group" style="margin-bottom: var(--space-5);">
          <label class="input-label">Star Rating</label>
          <div id="test-star-picker" style="display: flex; gap: var(--space-2); align-items: center;">
            ${[1,2,3,4,5].map(i => `
              <button class="star-picker-btn ${i <= selectedRating ? 'active' : ''}" data-rating="${i}" 
                      style="background: none; border: none; font-size: 32px; cursor: pointer; color: ${i <= selectedRating ? 'var(--star-filled)' : 'var(--star-empty)'}; transition: all 0.15s ease; padding: 2px;">
                ★
              </button>
            `).join('')}
            <span style="font-size: var(--font-size-sm); color: var(--text-muted); margin-left: var(--space-2);" id="test-rating-label">${selectedRating} star${selectedRating !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <!-- Review Comment -->
        <div class="input-group" style="margin-bottom: var(--space-6);">
          <label class="input-label">Review Comment</label>
          <textarea class="textarea-field" id="test-review-comment" rows="5" 
                    placeholder="Write a test review comment here... (e.g., 'Great service, loved the experience!' or 'Very slow response time, not happy.')"
                    style="min-height: 140px;"></textarea>
        </div>

        <!-- Submit -->
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <button class="btn btn-primary btn-lg" id="test-submit-btn" ${!hasWebhook ? 'disabled style="opacity: 0.5;"' : ''}>
            <span class="material-symbols-rounded" style="font-size: 20px;">send</span>
            Submit to n8n
          </button>
          <button class="btn btn-secondary" id="test-save-local-btn">
            <span class="material-symbols-rounded" style="font-size: 18px;">save</span>
            Save Locally Only
          </button>
        </div>
      </div>

      <!-- AI Response Preview -->
      <div id="test-response-area" style="display: none; margin-top: var(--space-6);">
        <div class="glass-card animate-fade-in" style="padding: var(--space-6);">
          <h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
            <span class="material-symbols-rounded" style="font-size: 20px; color: var(--accent-secondary);">smart_toy</span>
            AI Generated Reply
          </h3>
          <div id="test-response-text" style="padding: var(--space-4); background: rgba(200, 149, 108, 0.05); border-left: 3px solid var(--accent-primary); border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);"></div>
          <div style="margin-top: var(--space-4); display: flex; gap: var(--space-2);">
            <button class="btn btn-success btn-sm" id="test-approve-btn">
              <span class="material-symbols-rounded" style="font-size: 16px;">check_circle</span>
              Approve & Save
            </button>
            <button class="btn btn-secondary btn-sm" id="test-retry-btn">
              <span class="material-symbols-rounded" style="font-size: 16px;">refresh</span>
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Test Submissions -->
      <div class="glass-card animate-fade-in stagger-3" style="padding: var(--space-6); margin-top: var(--space-6);">
        <h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
          <span class="material-symbols-rounded" style="font-size: 20px;">history</span>
          Recent Test Submissions
        </h3>
        <div id="test-history-list">
          ${renderTestHistory()}
        </div>
      </div>
    </div>
  `;

  attachTestListeners(container);
}

function renderTestHistory() {
  const reviews = api.getReviews().filter(r => r.packageName === 'test-review');
  
  if (reviews.length === 0) {
    return `
      <div style="text-align: center; padding: var(--space-6); color: var(--text-muted); font-size: var(--font-size-sm);">
        <span class="material-symbols-rounded" style="font-size: 36px; display: block; margin-bottom: var(--space-2);">inbox</span>
        No test reviews submitted yet. Write one above!
      </div>
    `;
  }

  return reviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)).slice(0, 5).map(r => `
    <div style="padding: var(--space-4); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: var(--space-3);">
      <div style="flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; background: ${r.sentiment === 'positive' ? 'var(--gradient-secondary)' : 'var(--gradient-warm)'}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: var(--font-size-xs);">
        ${r.authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
          <span style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm); color: var(--text-primary);">${r.authorName}</span>
          <span style="color: var(--star-filled); font-size: var(--font-size-xs);">${'★'.repeat(r.starRating)}${'☆'.repeat(5 - r.starRating)}</span>
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-2);">${r.comment}</div>
        ${r.aiReply ? `
          <div style="font-size: var(--font-size-xs); color: var(--accent-primary-dark); background: rgba(200,149,108,0.05); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); border-left: 2px solid var(--accent-primary);">
            <strong>AI:</strong> ${r.aiReply}
          </div>
        ` : `
          <span class="badge badge-neutral">Awaiting AI Reply</span>
        `}
      </div>
    </div>
  `).join('');
}

function attachTestListeners(container) {
  // Star picker
  container.querySelectorAll('.star-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.rating);
      container.querySelectorAll('.star-picker-btn').forEach((b, i) => {
        const active = (i + 1) <= selectedRating;
        b.classList.toggle('active', active);
        b.style.color = active ? 'var(--star-filled)' : 'var(--star-empty)';
      });
      const label = container.querySelector('#test-rating-label');
      if (label) label.textContent = `${selectedRating} star${selectedRating !== 1 ? 's' : ''}`;
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(btn.dataset.rating);
      container.querySelectorAll('.star-picker-btn').forEach((b, i) => {
        b.style.color = (i + 1) <= hoverRating ? 'var(--star-filled)' : 'var(--star-empty)';
        b.style.transform = (i + 1) <= hoverRating ? 'scale(1.15)' : 'scale(1)';
      });
    });
    btn.addEventListener('mouseleave', () => {
      container.querySelectorAll('.star-picker-btn').forEach((b, i) => {
        b.style.color = (i + 1) <= selectedRating ? 'var(--star-filled)' : 'var(--star-empty)';
        b.style.transform = 'scale(1)';
      });
    });
  });

  // Submit to n8n
  container.querySelector('#test-submit-btn')?.addEventListener('click', () => {
    submitTestReview(container, true);
  });

  // Save locally only
  container.querySelector('#test-save-local-btn')?.addEventListener('click', () => {
    submitTestReview(container, false);
  });

  // Approve
  container.querySelector('#test-approve-btn')?.addEventListener('click', () => {
    showToast('Reply approved and saved!', 'success');
    container.querySelector('#test-response-area').style.display = 'none';
  });

  // Retry
  container.querySelector('#test-retry-btn')?.addEventListener('click', () => {
    submitTestReview(container, true);
  });
}

async function submitTestReview(container, sendToN8n) {
  const name = container.querySelector('#test-reviewer-name')?.value.trim() || 'Test User';
  const comment = container.querySelector('#test-review-comment')?.value.trim();

  if (!comment) {
    showToast('Please write a review comment first.', 'warning');
    return;
  }

  const reviewData = {
    reviewId: `test-${Date.now()}`,
    authorName: name,
    starRating: selectedRating,
    comment: comment,
    reviewDate: new Date().toISOString(),
    appVersion: '',
    deviceModel: 'Test Submission',
    packageName: 'test-review',
    status: 'pending',
    sentiment: selectedRating >= 4 ? 'positive' : 'concerned',
    confidence: selectedRating >= 4 ? 0.85 : 0.55,
    aiReply: null
  };

  // Save locally
  const reviews = api.getReviews();
  reviews.push(reviewData);
  localStorage.setItem('luxelens_reviews', JSON.stringify(reviews));

  if (!sendToN8n) {
    showToast('Review saved locally! View it in the Reviews page.', 'success');
    container.querySelector('#test-review-comment').value = '';
    const historyList = container.querySelector('#test-history-list');
    if (historyList) historyList.innerHTML = renderTestHistory();
    return;
  }

  // Send to n8n
  const settings = api.getSettings();
  if (!settings.webhookUrl) {
    showToast('No webhook URL configured. Go to Settings.', 'error');
    return;
  }

  const btn = container.querySelector('#test-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 20px; animation: spin 1s linear infinite;">refresh</span> Processing...';

  try {
    const response = await fetch(settings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'testReview',
        starRating: selectedRating,
        comment: comment,
        reviewer: { displayName: name },
        reviewId: reviewData.reviewId,
        accountId: 'test-account',
        locationId: 'test-location',
        timestamp: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(30000)
    });

    const data = await response.json();
    
    // Extract AI reply from response
    const aiReply = data.output || data.reply || data.aiReply || data.text || 
                    (Array.isArray(data) && data[0]?.output) || 
                    (Array.isArray(data) && data[0]?.reply) ||
                    JSON.stringify(data);

    // Update local review with AI reply
    reviewData.aiReply = aiReply;
    reviewData.status = 'replied';
    const updatedReviews = api.getReviews();
    const idx = updatedReviews.findIndex(r => r.reviewId === reviewData.reviewId);
    if (idx !== -1) {
      updatedReviews[idx] = reviewData;
      localStorage.setItem('luxelens_reviews', JSON.stringify(updatedReviews));
    }

    // Show AI response
    const responseArea = container.querySelector('#test-response-area');
    const responseText = container.querySelector('#test-response-text');
    if (responseArea && responseText) {
      responseText.textContent = aiReply;
      responseArea.style.display = 'block';
      responseArea.scrollIntoView({ behavior: 'smooth' });
    }

    showToast('AI reply generated successfully!', 'success');
  } catch (err) {
    showToast(`n8n error: ${err.message}`, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 20px;">send</span> Submit to n8n';

  // Refresh history
  const historyList = container.querySelector('#test-history-list');
  if (historyList) historyList.innerHTML = renderTestHistory();
  container.querySelector('#test-review-comment').value = '';
}
