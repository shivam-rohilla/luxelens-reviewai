import { api } from '../api.js';
import { showToast } from '../components/modal.js';

export function renderSeoAudit(container) {
  container.innerHTML = `
    <!-- Hero -->
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">SEO</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">SEO&nbsp;</span><span class="hero-blue">AUDIT</span>
        </h1>
        <p class="hero-subtitle">Run a comprehensive technical, content, and performance audit powered by AI agents.</p>
      </div>
    </div>

    <div class="page-container">
      <div class="seo-audit-card animate-fade-up stagger-1">
        <div class="seo-audit-card-header">
          <span class="material-symbols-rounded" style="font-size:22px;color:var(--blue);">speed</span>
          <h3 style="font-size:var(--fs-lg);font-weight:700;color:var(--text-1);">SEO &amp; Performance Audit</h3>
        </div>
        <p style="color:var(--text-3);margin-bottom:var(--sp-5);font-size:var(--fs-sm);">
          Enter a target URL to run a comprehensive technical, content, and performance audit via n8n.
        </p>
        <div style="display:flex;gap:var(--sp-3);">
          <input type="url" id="seo-url-input" class="input-field" placeholder="https://example.com" style="flex:1;" />
          <button id="seo-run-btn" class="btn btn-primary">
            <span class="material-symbols-rounded">search</span>
            Run Audit
          </button>
        </div>
        <div id="seo-results-container" style="display:none;margin-top:var(--sp-6);"></div>
      </div>
    </div>
  `;

  const runBtn = container.querySelector('#seo-run-btn');
  const urlInput = container.querySelector('#seo-url-input');
  const resultsContainer = container.querySelector('#seo-results-container');

  runBtn.addEventListener('click', async () => {
    const targetUrl = urlInput.value.trim();
    if (!targetUrl) {
      showToast('Please enter a valid URL', 'warning');
      return;
    }

    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span> Analyzing...';
    resultsContainer.style.display = 'none';

    const result = await api.runSeoAudit(targetUrl);

    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="material-symbols-rounded">search</span> Run Audit';

    if (result.success && result.data) {
      renderResults(resultsContainer, result.data);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  });
}

function renderResults(container, data) {
  const { score, issues, recommendations } = data;
  let scoreColor = '#6366f1';
  if (score >= 90) scoreColor = '#059669';
  else if (score >= 50) scoreColor = '#d97706';
  else scoreColor = '#dc2626';

  const getSeverityIcon = (sev) => {
    if (sev === 'critical') return '<span class="material-symbols-rounded" style="color:#dc2626;">cancel</span>';
    if (sev === 'warning')  return '<span class="material-symbols-rounded" style="color:#d97706;">warning</span>';
    return '<span class="material-symbols-rounded" style="color:#3b82f6;">info</span>';
  };

  container.innerHTML = `
    <div style="border-top:1px solid var(--border-light);padding-top:var(--sp-6);">
      <div style="display:flex;gap:var(--sp-6);align-items:center;margin-bottom:var(--sp-6);">
        <div style="flex:0 0 100px;height:100px;border-radius:50%;border:6px solid ${scoreColor};
                    display:flex;align-items:center;justify-content:center;">
          <span style="font-size:30px;font-weight:800;color:${scoreColor};">${score}</span>
        </div>
        <div>
          <h4 style="font-size:var(--fs-lg);margin-bottom:var(--sp-2);color:var(--text-1);">Overall Score</h4>
          <p style="color:var(--text-3);max-width:380px;font-size:var(--fs-sm);">
            Combined metric of SEO, Performance, and Technical best practices detected by our AI agents.
          </p>
        </div>
      </div>

      <div style="margin-bottom:var(--sp-6);">
        <h4 style="font-size:var(--fs-md);font-weight:700;color:var(--text-1);margin-bottom:var(--sp-3);
                   padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-light);">Identified Issues</h4>
        <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
          ${issues && issues.length ? issues.map(iss => `
            <div style="display:flex;gap:var(--sp-2);align-items:flex-start;
                        background:var(--bg-base);padding:var(--sp-3);border-radius:var(--r-md);
                        border:1px solid var(--border-light);">
              ${getSeverityIcon(iss.severity)}
              <span style="color:var(--text-2);line-height:1.5;font-size:var(--fs-sm);">${iss.title}</span>
            </div>
          `).join('') : '<p style="color:var(--text-3);">No major issues found.</p>'}
        </div>
      </div>

      <div>
        <h4 style="font-size:var(--fs-md);font-weight:700;color:var(--text-1);margin-bottom:var(--sp-3);
                   padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-light);">Actionable Recommendations</h4>
        <ul style="padding-left:var(--sp-5);color:var(--text-2);line-height:1.7;font-size:var(--fs-sm);">
          ${recommendations && recommendations.length
            ? recommendations.map(rec => `<li style="margin-bottom:var(--sp-2);">${rec}</li>`).join('')
            : '<li>Keep up the good work!</li>'
          }
        </ul>
      </div>
    </div>
  `;
  container.style.display = 'block';
}
