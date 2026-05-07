/**
 * Chatbot Page — Luxelens ReviewAI
 * Groq-powered assistant with context about current review data.
 */
import { api } from '../api.js';
import { showToast } from '../components/modal.js';

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_KEY   = import.meta.env.VITE_GROQ_KEY || '';

let messages = [];   // full conversation history sent to Groq

// ── Build system prompt from live review data ─────────────────────────────────
function _buildSystemPrompt() {
  const reviews = api.getReviews();

  const summary = ['playstore', 'appstore', 'gmb'].map(platform => {
    const pr = reviews.filter(r => r.platform === platform);
    if (!pr.length) return null;
    const avg = (pr.reduce((s, r) => s + r.starRating, 0) / pr.length).toFixed(1);
    const pending  = pr.filter(r => r.status === 'pending').length;
    const positive = pr.filter(r => r.sentiment === 'positive').length;
    const concerned = pr.filter(r => r.sentiment === 'concerned').length;
    return `${platform}: ${pr.length} reviews, avg ${avg}★, ${positive} positive, ${concerned} concerned, ${pending} pending`;
  }).filter(Boolean).join('\n');

  const recent = reviews
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
    .slice(0, 5)
    .map(r => `- [${r.platform}] ${r.authorName} (${r.starRating}★): "${r.comment.slice(0, 120)}..."`)
    .join('\n');

  return `You are the AI assistant for Luxelens ReviewAI, a review management dashboard.
You help the team understand their app reviews, suggest reply strategies, and answer questions about review data.

Current review data summary:
${summary}

5 most recent reviews:
${recent}

Be concise and helpful. When asked to write a reply, keep it warm and professional. Today's date is ${new Date().toLocaleDateString('en-IN')}.`;
}

// ── Page render ───────────────────────────────────────────────────────────────
export function renderChatbot(container) {
  container.innerHTML = `
    <div class="page-hero animate-fade-in">
      <div class="hero-watermark">AI CHAT</div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-dark">AI&nbsp;</span><span class="hero-accent">ASSISTANT</span>
        </h1>
        <p class="hero-subtitle">Ask anything about your reviews — powered by Groq.</p>
      </div>
    </div>

    <div class="page-container">
      <div class="chat-shell glass-card animate-fade-in">
        <div class="chat-messages" id="chat-messages">
          <div class="chat-bubble assistant">
            <div class="chat-avatar"><span class="material-symbols-rounded">smart_toy</span></div>
            <div class="chat-text">Hi! I'm your Luxelens AI assistant. I can see your review data and help you analyse trends, draft replies, or answer any questions. What would you like to know?</div>
          </div>
        </div>

        <div class="chat-input-row">
          <textarea class="chat-textarea" id="chat-input"
            placeholder="Ask about your reviews…" rows="1"></textarea>
          <button class="btn btn-primary chat-send-btn" id="chat-send">
            <span class="material-symbols-rounded">send</span>
          </button>
        </div>
      </div>
    </div>`;

  _attachListeners(container);
}

// ── Event listeners ───────────────────────────────────────────────────────────
function _attachListeners(container) {
  const apiKey = GROQ_KEY;
  const input   = container.querySelector('#chat-input');
  const sendBtn = container.querySelector('#chat-send');
  const feed    = container.querySelector('#chat-messages');

  // Auto-grow textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Send on Enter (Shift+Enter = newline)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _send(); }
  });
  sendBtn.addEventListener('click', _send);

  async function _send() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    _appendBubble(feed, 'user', text);

    if (messages.length === 0) {
      messages.push({ role: 'system', content: _buildSystemPrompt() });
    }
    messages.push({ role: 'user', content: text });

    const typingEl = _appendTyping(feed);

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content || '(empty response)';
      messages.push({ role: 'assistant', content: reply });

      typingEl.remove();
      _appendBubble(feed, 'assistant', reply);
    } catch (err) {
      typingEl.remove();
      _appendBubble(feed, 'error', `Error: ${err.message}`);
      showToast(err.message, 'error');
    }

    sendBtn.disabled = false;
    input.focus();
  }
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function _appendBubble(feed, role, text) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;

  const isAssistant = role === 'assistant';
  const isError     = role === 'error';

  div.innerHTML = `
    ${isAssistant ? '<div class="chat-avatar"><span class="material-symbols-rounded">smart_toy</span></div>' : ''}
    <div class="chat-text">${_md(text)}</div>
    ${role === 'user' ? '<div class="chat-avatar user-avatar"><span class="material-symbols-rounded">person</span></div>' : ''}
  `;

  if (isError) div.querySelector('.chat-text').style.color = '#dc2626';
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
  return div;
}

function _appendTyping(feed) {
  const div = document.createElement('div');
  div.className = 'chat-bubble assistant';
  div.innerHTML = `
    <div class="chat-avatar"><span class="material-symbols-rounded">smart_toy</span></div>
    <div class="chat-text chat-typing">
      <span></span><span></span><span></span>
    </div>`;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
  return div;
}

// Minimal markdown: bold, italic, inline code, line breaks
function _md(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
