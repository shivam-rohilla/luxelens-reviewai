/**
 * Dashboard Page — Luxelens ReviewAI
 * Hero section + stats row + charts + recent reviews
 */
import { api } from '../api.js';
import { getStats } from '../data/mockReviews.js';
import { renderReviewCard, formatDate } from '../components/reviewCard.js';

let charts = [];

export function renderDashboard(container) {
  const reviews     = api.getReviews();
  const stats       = getStats(reviews);
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
    .slice(0, 5);

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const replyRate    = stats.total > 0 ? Math.round((stats.replied / stats.total) * 100) : 0;

  container.innerHTML = `
    <!-- ── Hero Section ── -->
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">LUXELENS</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">LUXELENS&nbsp;</span><span class="hero-accent">REVIEWS</span>
        </h1>
        <p class="hero-subtitle">
          Experience complete control over your brand reputation. Personalised insights,
          smart alerts, and review analytics &mdash; all in one place.
        </p>
      </div>
    </div>

    <!-- ── Stats Row ── -->
    <div class="page-container">
      <div class="stats-row animate-fade-up">
        <div class="stat-card stagger-1">
          <span class="stat-icon">&#x2B50;</span>
          <div class="stat-value">${stats.avgRating}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
        <div class="stat-card stagger-2">
          <span class="stat-icon">&#x1F4CA;</span>
          <div class="stat-value">${stats.total.toLocaleString()}</div>
          <div class="stat-label">Total Reviews</div>
        </div>
        <div class="stat-card stagger-3">
          <span class="stat-icon">&#x23F3;</span>
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-label">Pending Replies</div>
        </div>
        <div class="stat-card stagger-4">
          <span class="stat-icon">&#x1F3C6;</span>
          <div class="stat-value">${replyRate}%</div>
          <div class="stat-label">Reply Rate</div>
        </div>
      </div>

      <!-- ── Charts Row ── -->
      <div class="dashboard-charts-row animate-fade-up" style="animation-delay:.15s">
        <div class="card">
          <div class="card-header">
            <span class="card-title">📈 Weekly Reviews</span>
          </div>
          <div class="card-body" style="height:220px;">
            <canvas id="chart-weekly-reviews"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">🎯 Sentiment Split</span>
          </div>
          <div class="card-body" style="height:220px;">
            <canvas id="chart-sentiment-donut"></canvas>
          </div>
        </div>
      </div>

      <!-- ── Recent Reviews + Activity ── -->
      <div class="dashboard-grid animate-fade-up" style="animation-delay:.2s">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Reviews</span>
            <a href="#/approval" class="btn btn-secondary btn-sm">View Queue →</a>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${recentReviews.map(r => renderReviewCard(r, { showActions: false, compact: true })).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Activity Feed</span>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${renderActivityItems(reviews)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Animate stat cards
  container.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.06}s`;
  });

  requestAnimationFrame(() => initCharts(reviews, stats));
}

async function initCharts(reviews, stats) {
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);
  charts.forEach(c => c.destroy());
  charts = [];

  Chart.defaults.color = '#6b7280';
  Chart.defaults.font.family = 'Inter';

  const ctxWeekly = document.getElementById('chart-weekly-reviews');
  if (ctxWeekly) {
    const dateMap = {};
    reviews.forEach(r => {
      const day = new Date(r.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dateMap[day] = (dateMap[day] || 0) + 1;
    });
    const sortedDates = Object.keys(dateMap).reverse().slice(-7);
    charts.push(new Chart(ctxWeekly, {
      type: 'bar',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Reviews',
          data: sortedDates.map(d => dateMap[d]),
          backgroundColor: 'rgba(37,99,235,0.18)',
          borderColor: 'rgba(37,99,235,0.8)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 28,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { grid: { display: false } }
        }
      }
    }));
  }

  const ctxSentiment = document.getElementById('chart-sentiment-donut');
  if (ctxSentiment) {
    charts.push(new Chart(ctxSentiment, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Concerned'],
        datasets: [{
          data: [stats.positive, stats.concerned],
          backgroundColor: ['rgba(16,185,129,0.75)', 'rgba(239,68,68,0.65)'],
          borderColor:     ['rgba(16,185,129,1)',    'rgba(239,68,68,1)'],
          borderWidth: 2, cutout: '68%', spacing: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } }
      }
    }));
  }
}

function renderActivityItems(reviews) {
  return [...reviews]
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
    .slice(0, 8)
    .map(r => {
      const positive = r.sentiment === 'positive';
      return `
        <div class="activity-item">
          <div class="activity-icon ${positive ? 'positive' : 'concerned'}">
            ${positive ? '&#x1F44D;' : '&#x1F44E;'}
          </div>
          <div class="activity-text">
            <div class="activity-text-main">
              ${r.status === 'replied' ? 'AI replied to' : 'New review from'}
              <strong>${r.authorName}</strong> &mdash; ${r.starRating}&#x2605;
            </div>
            <div class="activity-time">${formatDate(r.reviewDate)}</div>
          </div>
        </div>
      `;
    }).join('');
}
