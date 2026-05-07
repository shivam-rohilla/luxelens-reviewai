/**
 * Settings Page — Luxelens
 * API keys, auto-send toggles, notifications, data management
 */
import { api } from '../api.js';
import { showToast } from '../components/modal.js';
import { updateSidebarStatus } from '../components/sidebar.js';

export function renderSettings(container) {
  const settings = api.getSettings();

  container.innerHTML = `
    <!-- Connection Settings -->
    <div class="settings-section glass-card animate-fade-in stagger-1">
      <h3 class="settings-section-title">
        <span class="material-symbols-rounded" style="font-size: 20px; vertical-align: middle; margin-right: var(--space-2);">link</span>
        n8n Connection
      </h3>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">App Theme / Mode</div>
          <div class="settings-row-desc">Switch between Demo and Live connectivity modes</div>
        </div>
        <div class="settings-row-action">
          <label class="nm-switch" id="mode-switch-container">
            <input type="checkbox" id="settings-mode-switch" ${settings.mode === 'live' ? 'checked' : ''}>
            <div class="nm-knob"></div>
            <div class="nm-labels">
              <div class="label-left">DEMO</div>
              <div class="label-right">LIVE</div>
            </div>
          </label>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Play Store Fetch Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-playstore-fetch" value="${settings.webhookPlayStoreFetch || ''}" placeholder="/webhook-test/playstore-fetch" style="width: 100%;" />
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Play Store Send Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-playstore-send" value="${settings.webhookPlayStoreSend || ''}" placeholder="/webhook-test/playstore-send" style="width: 100%;" />
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">App Store Fetch Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-appstore-fetch" value="${settings.webhookAppStoreFetch || ''}" placeholder="/webhook-test/appstore-fetch" style="width: 100%;" />
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">GMB Fetch Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-gmb-fetch" value="${settings.webhookGmbFetch || ''}" placeholder="/webhook-test/gmb-fetch" style="width: 100%;" />
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">GMB Send Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-gmb-send" value="${settings.webhookGmbSend || ''}" placeholder="/webhook-test/gmb-send" style="width: 100%;" />
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">SEO Audit Webhook</div>
        </div>
        <div class="settings-row-action">
          <input type="url" class="input-field" id="settings-webhook-seo-audit" value="${settings.webhookSeoAudit || ''}" placeholder="/webhook-test/seo-audit" style="width: 100%;" />
        </div>
      </div>



    <!-- API Keys -->
    <div class="settings-section glass-card animate-fade-in stagger-2">
      <h3 class="settings-section-title">
        <span class="material-symbols-rounded" style="font-size: 20px; vertical-align: middle; margin-right: var(--space-2);">key</span>
        API Keys
      </h3>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Groq API Key</div>
          <div class="settings-row-desc">Groq API key for AI-powered reply generation (free at console.groq.com)</div>
        </div>
        <div class="settings-row-action">
          <input type="password" class="input-field" id="settings-groq-api-key" 
                 value="${settings.groqApiKey}" 
                 placeholder="gsk_..." 
                 style="width: 100%;" />
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">n8n API Key</div>
          <div class="settings-row-desc">API key for n8n workflow authentication (if required)</div>
        </div>
        <div class="settings-row-action">
          <input type="password" class="input-field" id="settings-n8n-api-key" 
                 value="${settings.n8nApiKey}" 
                 placeholder="n8n_api_..." 
                 style="width: 100%;" />
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Telegram Bot Token</div>
          <div class="settings-row-desc">Bot token for Telegram notifications</div>
        </div>
        <div class="settings-row-action">
          <input type="password" class="input-field" id="settings-telegram-bot-token" 
                 value="${settings.telegramBotToken}" 
                 placeholder="123456:ABC-DEF..." 
                 style="width: 100%;" />
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Telegram Chat ID</div>
          <div class="settings-row-desc">Chat or group ID to receive Telegram notifications</div>
        </div>
        <div class="settings-row-action">
          <input type="text" class="input-field" id="settings-telegram-chat-id" 
                 value="${settings.telegramChatId}" 
                 placeholder="-1001234567890" 
                 style="width: 100%;" />
        </div>
      </div>
    </div>

    <!-- Auto-Send & Notifications -->
    <div class="settings-section glass-card animate-fade-in stagger-3">
      <h3 class="settings-section-title">
        <span class="material-symbols-rounded" style="font-size: 20px; vertical-align: middle; margin-right: var(--space-2);">tune</span>
        Auto-Send & Notifications
      </h3>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Auto-Send Positive Reviews</div>
          <div class="settings-row-desc">Automatically post AI replies for 4-5★ reviews without manual approval</div>
        </div>
        <div class="settings-row-action">
          <div class="toggle-wrapper">
            <input type="checkbox" class="toggle" id="settings-auto-send-positive" ${settings.autoSendPositive ? 'checked' : ''} />
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);" id="auto-send-positive-label">
              ${settings.autoSendPositive ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Auto-Send Concerned Reviews</div>
          <div class="settings-row-desc">Automatically post AI replies for 1-3★ reviews (not recommended — review manually first)</div>
        </div>
        <div class="settings-row-action">
          <div class="toggle-wrapper">
            <input type="checkbox" class="toggle" id="settings-auto-send-concerned" ${settings.autoSendConcerned ? 'checked' : ''} />
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);" id="auto-send-concerned-label">
              ${settings.autoSendConcerned ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">New Review Notifications</div>
          <div class="settings-row-desc">Send Telegram notification when a new review is received</div>
        </div>
        <div class="settings-row-action">
          <div class="toggle-wrapper">
            <input type="checkbox" class="toggle" id="settings-notify-new-review" ${settings.notifyOnNewReview ? 'checked' : ''} />
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);" id="notify-new-review-label">
              ${settings.notifyOnNewReview ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Auto-Reply Notifications</div>
          <div class="settings-row-desc">Send Telegram notification when an AI reply is automatically posted</div>
        </div>
        <div class="settings-row-action">
          <div class="toggle-wrapper">
            <input type="checkbox" class="toggle" id="settings-notify-auto-reply" ${settings.notifyOnAutoReply ? 'checked' : ''} />
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);" id="notify-auto-reply-label">
              ${settings.notifyOnAutoReply ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- App Configuration -->
    <div class="settings-section glass-card animate-fade-in stagger-4">
      <h3 class="settings-section-title">
        <span class="material-symbols-rounded" style="font-size: 20px; vertical-align: middle; margin-right: var(--space-2);">phone_android</span>
        App Configuration
      </h3>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Package Name</div>
          <div class="settings-row-desc">Your Android app's package name as listed on Google Play Store</div>
        </div>
        <div class="settings-row-action">
          <input type="text" class="input-field" id="settings-package" 
                 value="${settings.packageName}" 
                 placeholder="com.yourapp.name" style="width: 100%;" />
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="settings-section glass-card animate-fade-in stagger-5">
      <h3 class="settings-section-title">
        <span class="material-symbols-rounded" style="font-size: 20px; vertical-align: middle; margin-right: var(--space-2);">database</span>
        Data Management
      </h3>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Reset to Demo Data</div>
          <div class="settings-row-desc">Clear all local data and reload the demo dataset. This cannot be undone.</div>
        </div>
        <div class="settings-row-action">
          <button class="btn btn-danger" id="settings-reset-data">
            <span class="material-symbols-rounded" style="font-size: 18px;">restart_alt</span>
            Reset Data
          </button>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Export Reviews</div>
          <div class="settings-row-desc">Download all reviews and replies as a JSON file</div>
        </div>
        <div class="settings-row-action">
          <button class="btn btn-secondary" id="settings-export">
            <span class="material-symbols-rounded" style="font-size: 18px;">download</span>
            Export JSON
          </button>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
      <button class="btn btn-primary btn-lg" id="settings-save">
        <span class="material-symbols-rounded" style="font-size: 20px;">save</span>
        Save Settings
      </button>
    </div>
  `;

  attachSettingsListeners(container);
}

function attachSettingsListeners(container) {
  // Save settings
  container.querySelector('#settings-save')?.addEventListener('click', () => {
    const settings = {
      webhookPlayStoreFetch: container.querySelector('#settings-webhook-playstore-fetch').value.trim(),
      webhookPlayStoreSend: container.querySelector('#settings-webhook-playstore-send').value.trim(),
      webhookAppStoreFetch: container.querySelector('#settings-webhook-appstore-fetch').value.trim(),
      webhookGmbFetch: container.querySelector('#settings-webhook-gmb-fetch').value.trim(),
      webhookGmbSend: container.querySelector('#settings-webhook-gmb-send').value.trim(),
      webhookSeoAudit: container.querySelector('#settings-webhook-seo-audit').value.trim(),
      packageName: container.querySelector('#settings-package').value.trim(),
      mode: container.querySelector('#settings-mode-switch').checked ? 'live' : 'demo',
      groqApiKey: container.querySelector('#settings-groq-api-key').value.trim(),
      n8nApiKey: container.querySelector('#settings-n8n-api-key').value.trim(),
      telegramBotToken: container.querySelector('#settings-telegram-bot-token').value.trim(),
      telegramChatId: container.querySelector('#settings-telegram-chat-id').value.trim(),
      autoSendPositive: container.querySelector('#settings-auto-send-positive').checked,
      autoSendConcerned: container.querySelector('#settings-auto-send-concerned').checked,
      notifyOnNewReview: container.querySelector('#settings-notify-new-review').checked,
      notifyOnAutoReply: container.querySelector('#settings-notify-auto-reply').checked
    };

    api.saveSettings(settings);
    updateSidebarStatus(settings.mode);
    const modeLabel = document.getElementById('header-mode-label');
    if (modeLabel) {
      modeLabel.textContent = settings.mode === 'live' ? 'Live Mode' : 'Demo Mode';
    }
    showToast('Settings saved successfully!', 'success');
  });

  // Toggle labels
  const toggles = [
    { id: 'settings-auto-send-positive', label: 'auto-send-positive-label' },
    { id: 'settings-auto-send-concerned', label: 'auto-send-concerned-label' },
    { id: 'settings-notify-new-review', label: 'notify-new-review-label' },
    { id: 'settings-notify-auto-reply', label: 'notify-auto-reply-label' }
  ];

  toggles.forEach(({ id, label }) => {
    container.querySelector(`#${id}`)?.addEventListener('change', (e) => {
      const labelEl = container.querySelector(`#${label}`);
      if (labelEl) labelEl.textContent = e.target.checked ? 'Enabled' : 'Disabled';
    });
  });



  // Reset data
  container.querySelector('#settings-reset-data')?.addEventListener('click', () => {
    if (confirm('Reset all data to demo defaults? This cannot be undone.')) {
      api.resetData();
      updateSidebarStatus('demo');
      showToast('Data reset to demo defaults', 'info');
      renderSettings(container);
    }
  });

  // Export
  container.querySelector('#settings-export')?.addEventListener('click', () => {
    const reviews = api.getReviews();
    const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luxelens-reviews-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Reviews exported!', 'success');
  });
}
