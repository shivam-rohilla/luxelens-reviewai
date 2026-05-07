/**
 * Stats Card Component
 */
export function renderStatsCard(config) {
  const { value, label, icon, color, trend } = config;

  const trendHtml = trend ? `
    <div class="stat-card-trend ${trend.direction}">
      <span class="material-symbols-rounded" style="font-size: 14px;">
        ${trend.direction === 'up' ? 'trending_up' : 'trending_down'}
      </span>
      ${trend.value}
    </div>
  ` : '';

  return `
    <div class="stat-card glass-card ${color} animate-fade-in">
      <div class="stat-card-header">
        <div class="stat-card-icon">
          <span class="material-symbols-rounded">${icon}</span>
        </div>
        ${trendHtml}
      </div>
      <div class="stat-card-value">${value}</div>
      <div class="stat-card-label">${label}</div>
    </div>
  `;
}
