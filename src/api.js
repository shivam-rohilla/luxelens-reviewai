/**
 * API Layer — n8n Webhook Integration + Local Data Management
 * Luxelens Automatic Review Reply System
 */
import { mockReviews } from './data/mockReviews.js';

const STORAGE_KEYS = {
  WEBHOOK_PLAYSTORE_FETCH: 'luxelens_webhook_playstore_fetch',
  WEBHOOK_PLAYSTORE_SEND: 'luxelens_webhook_playstore_send',
  WEBHOOK_APPSTORE_FETCH: 'luxelens_webhook_appstore_fetch',
  WEBHOOK_GMB_FETCH: 'luxelens_webhook_gmb_fetch',
  WEBHOOK_GMB_SEND: 'luxelens_webhook_gmb_send',
  WEBHOOK_SEO_AUDIT: 'luxelens_webhook_seo_audit',
  PACKAGE_NAME: 'luxelens_package_name',
  AUTO_REPLY: 'luxelens_auto_reply',
  REVIEWS: 'luxelens_reviews',
  MODE: 'luxelens_mode',
  GROQ_API_KEY: 'luxelens_groq_api_key',
  N8N_API_KEY: 'luxelens_n8n_api_key',
  TELEGRAM_BOT_TOKEN: 'luxelens_telegram_bot_token',
  TELEGRAM_CHAT_ID: 'luxelens_telegram_chat_id',
  NOTIFY_NEW_REVIEW: 'luxelens_notify_new_review',
  NOTIFY_AUTO_REPLY: 'luxelens_notify_auto_reply',
  AUTO_SEND_POSITIVE: 'luxelens_auto_send_positive',
  AUTO_SEND_CONCERNED: 'luxelens_auto_send_concerned'
};

class Api {
  constructor() {
    this._webhookCache = null;
    this._webhookCacheTime = 0;
    this._initializeData();
  }

  _initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(mockReviews));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODE)) {
      localStorage.setItem(STORAGE_KEYS.MODE, 'demo');
    }
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGE_NAME)) {
      localStorage.setItem(STORAGE_KEYS.PACKAGE_NAME, 'com.luxelens.app');
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTO_REPLY)) {
      localStorage.setItem(STORAGE_KEYS.AUTO_REPLY, 'true');
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTO_SEND_POSITIVE)) {
      localStorage.setItem(STORAGE_KEYS.AUTO_SEND_POSITIVE, 'true');
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTO_SEND_CONCERNED)) {
      localStorage.setItem(STORAGE_KEYS.AUTO_SEND_CONCERNED, 'false');
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFY_NEW_REVIEW)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFY_NEW_REVIEW, 'true');
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFY_AUTO_REPLY)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFY_AUTO_REPLY, 'true');
    }
  }

  // ---- Settings ----
  getSettings() {
    return {
      webhookPlayStoreFetch: localStorage.getItem(STORAGE_KEYS.WEBHOOK_PLAYSTORE_FETCH) || '',
      webhookPlayStoreSend: localStorage.getItem(STORAGE_KEYS.WEBHOOK_PLAYSTORE_SEND) || '',
      webhookAppStoreFetch: localStorage.getItem(STORAGE_KEYS.WEBHOOK_APPSTORE_FETCH) || '',
      webhookGmbFetch: localStorage.getItem(STORAGE_KEYS.WEBHOOK_GMB_FETCH) || '',
      webhookGmbSend: localStorage.getItem(STORAGE_KEYS.WEBHOOK_GMB_SEND) || '',
      webhookSeoAudit: localStorage.getItem(STORAGE_KEYS.WEBHOOK_SEO_AUDIT) || '',
      packageName: localStorage.getItem(STORAGE_KEYS.PACKAGE_NAME) || 'com.luxelens.app',
      autoReply: localStorage.getItem(STORAGE_KEYS.AUTO_REPLY) === 'true',
      mode: localStorage.getItem(STORAGE_KEYS.MODE) || 'demo',
      groqApiKey: localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY) || '',
      n8nApiKey: localStorage.getItem(STORAGE_KEYS.N8N_API_KEY) || '',
      telegramBotToken: localStorage.getItem(STORAGE_KEYS.TELEGRAM_BOT_TOKEN) || '',
      telegramChatId: localStorage.getItem(STORAGE_KEYS.TELEGRAM_CHAT_ID) || '',
      notifyOnNewReview: localStorage.getItem(STORAGE_KEYS.NOTIFY_NEW_REVIEW) === 'true',
      notifyOnAutoReply: localStorage.getItem(STORAGE_KEYS.NOTIFY_AUTO_REPLY) === 'true',
      autoSendPositive: localStorage.getItem(STORAGE_KEYS.AUTO_SEND_POSITIVE) === 'true',
      autoSendConcerned: localStorage.getItem(STORAGE_KEYS.AUTO_SEND_CONCERNED) === 'true'
    };
  }

  saveSettings(settings) {
    const keyMap = {
      webhookPlayStoreFetch: STORAGE_KEYS.WEBHOOK_PLAYSTORE_FETCH,
      webhookPlayStoreSend: STORAGE_KEYS.WEBHOOK_PLAYSTORE_SEND,
      webhookAppStoreFetch: STORAGE_KEYS.WEBHOOK_APPSTORE_FETCH,
      webhookGmbFetch: STORAGE_KEYS.WEBHOOK_GMB_FETCH,
      webhookGmbSend: STORAGE_KEYS.WEBHOOK_GMB_SEND,
      webhookSeoAudit: STORAGE_KEYS.WEBHOOK_SEO_AUDIT,
      packageName: STORAGE_KEYS.PACKAGE_NAME,
      autoReply: STORAGE_KEYS.AUTO_REPLY,
      mode: STORAGE_KEYS.MODE,
      groqApiKey: STORAGE_KEYS.GROQ_API_KEY,
      n8nApiKey: STORAGE_KEYS.N8N_API_KEY,
      telegramBotToken: STORAGE_KEYS.TELEGRAM_BOT_TOKEN,
      telegramChatId: STORAGE_KEYS.TELEGRAM_CHAT_ID,
      notifyOnNewReview: STORAGE_KEYS.NOTIFY_NEW_REVIEW,
      notifyOnAutoReply: STORAGE_KEYS.NOTIFY_AUTO_REPLY,
      autoSendPositive: STORAGE_KEYS.AUTO_SEND_POSITIVE,
      autoSendConcerned: STORAGE_KEYS.AUTO_SEND_CONCERNED
    };

    for (const [key, storageKey] of Object.entries(keyMap)) {
      if (settings[key] !== undefined) {
        localStorage.setItem(storageKey, String(settings[key]));
      }
    }
  }

  // ---- Reviews ----
  getReviews() {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : mockReviews;
  }

  getReviewById(reviewId) {
    return this.getReviews().find(r => r.reviewId === reviewId) || null;
  }

  getPendingReviews() {
    return this.getReviews().filter(r => r.status === 'pending' || (r.aiReply && r.status !== 'approved'));
  }

  updateReviewReply(reviewId, replyText) {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.reviewId === reviewId);
    if (idx !== -1) {
      reviews[idx].aiReply = replyText;
      reviews[idx].status = 'replied';
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      return reviews[idx];
    }
    return null;
  }

  approveReply(reviewId) {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.reviewId === reviewId);
    if (idx !== -1) {
      reviews[idx].status = 'approved';
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      return reviews[idx];
    }
    return null;
  }

  rejectReply(reviewId) {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.reviewId === reviewId);
    if (idx !== -1) {
      reviews[idx].status = 'pending';
      reviews[idx].aiReply = null;
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      return reviews[idx];
    }
    return null;
  }

  // ---- n8n Webhook Integration (Platform Specific) ----

  _getWebhookUrlForAction(platform, action) {
    const settings = this.getSettings();
    if (action === 'fetch') {
      if (platform === 'playstore') return settings.webhookPlayStoreFetch;
      if (platform === 'appstore') return settings.webhookAppStoreFetch;
      if (platform === 'gmb') return settings.webhookGmbFetch;
    } else if (action === 'send') {
      if (platform === 'playstore') return settings.webhookPlayStoreSend;
      if (platform === 'gmb') return settings.webhookGmbSend;
    }
    return null;
  }

  async fetchLiveReviews(platform = 'playstore') {
    const settings = this.getSettings();

    if (settings.mode === 'demo') {
      return { success: true, reviews: this.getReviews().filter(r => r.platform === platform), message: `Demo mode: Using mock data for ${platform}` };
    }

    const webhookUrl = this._getWebhookUrlForAction(platform, 'fetch');
    if (!webhookUrl) {
      return { success: false, reviews: [], message: `No fetch webhook URL configured for ${platform}` };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getReviews', platform, packageName: settings.packageName })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.reviews) {
        // Merge with existing avoiding duplicates
        const existing = this.getReviews();
        const newReviews = data.reviews.map(r => ({ ...r, platform }));
        
        const merged = [...existing];
        newReviews.forEach(nr => {
           const idx = merged.findIndex(er => er.reviewId === nr.reviewId);
           if (idx >= 0) merged[idx] = nr;
           else merged.push(nr);
        });
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(merged));
        return { success: true, reviews: newReviews, message: `Reviews fetched from n8n for ${platform}` };
      }

      return { success: true, reviews: [], message: 'Reviews fetched from n8n, but empty' };
    } catch (err) {
      return { success: false, reviews: this.getReviews().filter(r => r.platform === platform), message: `Using cached data: ${err.message}` };
    }
  }

  async postReply(reviewId, replyText, platform = 'playstore') {
    const settings = this.getSettings();

    this.updateReviewReply(reviewId, replyText);

    if (settings.mode === 'demo') {
      return { success: true, message: `Demo mode: Reply saved locally for ${platform}` };
    }

    const webhookUrl = this._getWebhookUrlForAction(platform, 'send');
    if (!webhookUrl) {
      return { success: true, message: `Reply saved locally (no send webhook configured for ${platform})` };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'postReply',
          reviewId,
          replyText,
          platform,
          packageName: settings.packageName
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true, message: `Reply posted via n8n for ${platform}!` };
    } catch (err) {
      return { success: true, message: `Reply saved locally (webhook error: ${err.message})` };
    }
  }

  // ---- Analytics Webhook (dhobilite n8n) ----

  async _fetchAnalyticsWebhook() {
    const CACHE_TTL = 5 * 60 * 1000;
    const now = Date.now();
    if (this._webhookCache && (now - this._webhookCacheTime) < CACHE_TTL) {
      return this._webhookCache;
    }
    const res = await fetch('https://dhobilite.app.n8n.cloud/webhook/dhobilite-analytics');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    this._webhookCache = Array.isArray(data) ? data[0] : data;
    this._webhookCacheTime = Date.now();
    return this._webhookCache;
  }

  async fetchWebhookReviews(platform) {
    try {
      const raw = await this._fetchAnalyticsWebhook();
      let incoming = [];

      if (platform === 'playstore') {
        incoming = (raw.playReviews || []).map(r => {
          const rating = parseInt(r.star_rating || r.rating) || 0;
          return {
            reviewId: `ps-${(r.name || r.reviewer || 'anon').replace(/\s+/g, '-')}-${r.time || r.date || Date.now()}`,
            authorName: r.name || r.reviewer || 'Anonymous',
            starRating: rating,
            comment: r.comment || r.review || '',
            reviewDate: r.time || r.date || new Date().toISOString(),
            appVersion: r.app_version || '',
            deviceModel: null,
            packageName: 'com.luxelens.app',
            platform: 'playstore',
            status: (r.reply && r.reply.trim()) ? 'replied' : 'pending',
            sentiment: rating >= 4 ? 'positive' : 'concerned',
            confidence: null,
            aiReply: r.reply || null
          };
        });
      } else if (platform === 'appstore') {
        incoming = (raw.iosReviews || []).map(r => {
          const rating = parseInt(r.rating) || 0;
          const comment = [r.title, r.review].filter(Boolean).join(': ');
          return {
            reviewId: `ios-${(r.user || r.reviewer || 'anon').replace(/\s+/g, '-')}-${r.date || Date.now()}`,
            authorName: r.user || r.reviewer || 'Anonymous',
            starRating: rating,
            comment: comment || '',
            reviewDate: r.date || new Date().toISOString(),
            appVersion: '',
            deviceModel: null,
            packageName: 'com.luxelens.ios',
            platform: 'appstore',
            status: (r.ai_reply || r.reply) ? 'replied' : 'pending',
            sentiment: rating >= 4 ? 'positive' : 'concerned',
            confidence: null,
            aiReply: r.ai_reply || r.reply || null
          };
        });
      } else if (platform === 'gmb') {
        incoming = (raw.gbpReviews || []).map(r => {
          const rating = parseInt(r['Star Rating'] || r.rating) || 0;
          const reviewer = r['Reviewer Name'] || r.reviewer || 'Anonymous';
          const date = r.Date || r.date || '';
          return {
            reviewId: `gmb-${reviewer.replace(/\s+/g, '-')}-${date}`,
            authorName: reviewer,
            starRating: rating,
            comment: r['Review Comments'] || r.review || '',
            reviewDate: date || new Date().toISOString(),
            appVersion: null,
            deviceModel: null,
            packageName: null,
            platform: 'gmb',
            status: (r['AI Reply'] || r.reply) ? 'replied' : 'pending',
            sentiment: rating >= 4 ? 'positive' : 'concerned',
            confidence: null,
            aiReply: r['AI Reply'] || r.reply || null
          };
        });
      }

      // Preserve local approval/rejection overrides, replace everything else for this platform
      const existing = this.getReviews();
      const localOverrides = {};
      existing.filter(r => r.platform === platform).forEach(r => {
        if (r.status === 'approved' || r.status === 'rejected') localOverrides[r.reviewId] = r;
      });

      const merged = [
        ...existing.filter(r => r.platform !== platform),
        ...incoming.map(nr => localOverrides[nr.reviewId]
          ? { ...nr, status: localOverrides[nr.reviewId].status, aiReply: localOverrides[nr.reviewId].aiReply }
          : nr
        )
      ];

      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(merged));
      return { success: true, count: incoming.length };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // ---- SEO Audit ----
  async runSeoAudit(targetUrl) {
    const settings = this.getSettings();

    if (settings.mode === 'demo') {
      return new Promise(resolve => {
        setTimeout(() => resolve({
          success: true,
          data: {
            score: 82,
            issues: [
              { title: "Optimize images for modern formats", severity: "warning" },
              { title: "Minify CSS and JS", severity: "info" },
              { title: "Improve Core Web Vitals (LCP is 3.2s)", severity: "critical" },
              { title: "Missing meta descriptions on 3 pages", severity: "warning" }
            ],
            recommendations: [
              "Convert all images to WebP",
              "Implement lazy loading for below-the-fold content",
              "Add descriptive meta tags"
            ],
            raw_data: {
              performance: "Lighthouse performance score was 82.",
              technical: "Technical checks passed with minor issues.",
              content: "Content is generally good, density appropriate."
            }
          },
          message: 'Demo mode: Simulated SEO Audit completed'
        }), 1500); // simulate some delay
      });
    }

    const webhookUrl = settings.webhookSeoAudit;
    if (!webhookUrl) {
      return { success: false, message: 'No SEO Audit webhook URL configured.' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data, message: 'SEO Audit completed successfully!' };
    } catch (err) {
      return { success: false, message: `Failed to run SEO audit: ${err.message}` };
    }
  }

  resetData() {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(mockReviews));
    localStorage.setItem(STORAGE_KEYS.MODE, 'demo');
  }
}

export const api = new Api();
