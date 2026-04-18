<?php
/**
 * Uhamiaji Chatbot — modern multilingual chat UI.
 * Auto-detects from the user's question. Replies in the same language.
 */
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

try {
    db()->query('SELECT 1 FROM wiki_entries LIMIT 1');
} catch (Throwable $e) {
    header('Location: install.php');
    exit;
}

$user = current_user();
$logoSrc = file_exists(__DIR__ . '/assets/logo.png') ? url('assets/logo.png') : url('assets/logo-fallback.svg');
$favicon = file_exists(__DIR__ . '/assets/favicon.ico') ? url('assets/favicon.ico') : url('assets/logo-fallback.svg');
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="<?= e($favicon) ?>">
<meta name="theme-color" content="#0b2545">
<title>Uhamiaji Chatbot — Tanzania Immigration</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --primary: #0b2545;
  --primary-light: #1d3c73;
  --accent: #e6b800;
  --accent-light: #fdd835;
  --text: #1a1a1a;
  --muted: #6b7280;
  --bg: #f4f7fb;
  --card: #ffffff;
  --border: #e5e7eb;
  --border-dark: rgba(255,255,255,0.12);
  --user-grad: linear-gradient(135deg, #0b2545 0%, #1d3c73 100%);
  --bot-bg: #ffffff;
}
html, body {
  height: 100%;
  font-family: 'Inter', 'Noto Sans SC', 'Noto Sans Arabic', 'Noto Sans Devanagari', -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg);
  overflow: hidden;
}
a { color: inherit; text-decoration: none; }

.app { display: grid; grid-template-columns: 280px 1fr; height: 100vh; background: #fff; }

/* ---------------- SIDEBAR ---------------- */
.sidebar {
  background: linear-gradient(180deg, #0b2545 0%, #132b5c 55%, #1d3c73 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0,0,0,0.1);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(230,184,0,0.6) rgba(0,0,0,0.25);
}
.sidebar::-webkit-scrollbar { width: 8px; }
.sidebar::-webkit-scrollbar-track { background: rgba(0,0,0,0.25); }
.sidebar::-webkit-scrollbar-thumb { background: rgba(230,184,0,0.6); border-radius: 4px; }
.sidebar::-webkit-scrollbar-thumb:hover { background: rgba(230,184,0,0.9); }

.sb-brand {
  padding: 20px 20px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 10;
}
.sb-brand img {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #fff;
  padding: 4px;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.sb-brand .sb-name { font-weight: 700; font-size: 1.08rem; letter-spacing: -0.01em; }
.sb-brand .sb-sub  { font-size: 0.72rem; opacity: 0.7; margin-top: 2px; letter-spacing: 0.01em; }

.sb-langs {
  padding: 14px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}
.sb-langs .lbl {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
}
.sb-langs .chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.sb-langs .chips span {
  font-size: 0.68rem;
  padding: 4px 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
}
.sb-langs .chips span:hover {
  background: #e6b800;
  color: #0b2545;
  border-color: #e6b800;
  transform: translateY(-1px);
}
.sb-langs .hint {
  margin-top: 8px;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.55);
  font-style: italic;
  line-height: 1.45;
}

.sb-section {
  padding: 16px 20px 6px;
}
.sb-head {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.55);
  margin-bottom: 4px;
}
.sb-link {
  display: block;
  padding: 8px 20px;
  font-size: 0.86rem;
  color: rgba(255,255,255,0.9);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.sb-link:hover {
  background: rgba(255,255,255,0.06);
  border-left-color: var(--accent);
  color: #fff;
}

.sb-actions { padding: 14px 20px 0; }
.sb-newchat {
  width: 100%;
  background: rgba(230,184,0,0.15);
  color: #fff;
  border: 1px dashed rgba(230,184,0,0.7);
  padding: 9px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.15s;
}
.sb-newchat:hover { background: rgba(230,184,0,0.3); border-color: #e6b800; }

.sb-history { padding: 0 12px 12px; }
.sb-history .sb-hitem {
  display: block;
  padding: 10px 12px;
  margin: 4px 0;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.15s;
  position: relative;
}
.sb-history .sb-hitem:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(230,184,0,0.4);
  color: #fff;
}
.sb-history .sb-hitem.active {
  background: rgba(230,184,0,0.15);
  border-color: rgba(230,184,0,0.5);
  color: #fff;
}
.sb-history .sb-hitem .sb-hdel {
  position: absolute;
  right: 6px; top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 5px;
  display: none;
}
.sb-history .sb-hitem:hover .sb-hdel { display: inline; }
.sb-history .sb-hitem .sb-hdel:hover { color: #f87171; }
.sb-history .sb-empty {
  font-size: 0.76rem;
  color: rgba(255,255,255,0.5);
  font-style: italic;
  padding: 8px 10px;
  text-align: center;
}

.sb-footer {
  padding: 16px 20px 22px;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 16px;
  font-size: 0.78rem;
}
.sb-footer a {
  display: block;
  padding: 5px 0;
  color: rgba(255,255,255,0.75);
}
.sb-footer a:hover { color: #fff; }

/* ---------------- CHAT ---------------- */
.chatwrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  position: relative;
}
.chatwrap::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 260px;
  background: radial-gradient(ellipse at top left, rgba(29,60,115,0.08), transparent 65%),
              radial-gradient(ellipse at top right, rgba(230,184,0,0.06), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.top {
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
  position: relative;
}
.top .menu-btn {
  display: none;
  background: transparent;
  border: 0;
  font-size: 24px;
  color: var(--primary);
  cursor: pointer;
}
.top .title {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--primary);
  letter-spacing: -0.01em;
}
.top .title .dot {
  display: inline-block;
  width: 8px; height: 8px;
  background: #22c55e;
  border-radius: 50%;
  margin: 0 8px 0 2px;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); } 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
.top .sub { font-size: 0.78rem; color: var(--muted); font-weight: 400; margin-left: 4px; }
.top .badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 1;
  position: relative;
  scroll-behavior: smooth;
}
.chat-main::-webkit-scrollbar { width: 8px; }
.chat-main::-webkit-scrollbar-thumb { background: #c7d1dc; border-radius: 4px; }

.msg { display: flex; max-width: 78%; animation: slide-in 0.25s ease; }
.msg.user { align-self: flex-end; }
.msg.bot  { align-self: flex-start; }
@keyframes slide-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.msg .bubble {
  padding: 14px 18px;
  border-radius: 20px;
  line-height: 1.6;
  font-size: 0.95rem;
  box-shadow: 0 2px 10px rgba(11,37,69,0.06);
}
.msg.user .bubble {
  background: var(--user-grad);
  color: #fff;
  border-bottom-right-radius: 5px;
}
.msg.bot .bubble {
  background: var(--bot-bg);
  border: 1px solid var(--border);
  border-bottom-left-radius: 5px;
}
.msg .bubble p { margin-bottom: 10px; }
.msg .bubble p:last-child { margin-bottom: 0; }
.msg .bubble ul, .msg .bubble ol { margin: 8px 0 10px 22px; }
.msg .bubble li { margin-bottom: 6px; }
.msg .bubble strong { color: var(--primary); }
.msg .bubble em { color: var(--muted); font-style: italic; }
.msg .bubble table {
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 0.86rem;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
}
.msg .bubble th {
  background: var(--primary);
  color: #fff;
  padding: 7px 11px;
  text-align: left;
  font-weight: 600;
}
.msg .bubble td {
  padding: 7px 11px;
  border-bottom: 1px solid var(--border);
  background: #fafbfc;
}

.suggests {
  padding: 8px 32px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.suggests .pill {
  font-size: 0.82rem;
  padding: 7px 14px;
  background: #fff;
  border: 1px solid #cfd8e3;
  border-radius: 20px;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.15s;
  user-select: none;
  font-weight: 500;
}
.suggests .pill:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(11,37,69,0.2);
}

.inputbar {
  border-top: 1px solid var(--border);
  background: #fff;
  padding: 14px 24px;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 1;
  position: relative;
}
.inputbar input {
  flex: 1;
  border: 1.5px solid #d0d7de;
  border-radius: 26px;
  padding: 12px 20px;
  font-size: 0.98rem;
  outline: none;
  font-family: inherit;
  background: #f9fafb;
  transition: all 0.15s;
}
.inputbar input:focus {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(11,37,69,0.08);
}
.inputbar button {
  background: var(--user-grad);
  color: #fff;
  border: 0;
  border-radius: 26px;
  padding: 0 26px;
  font-size: 0.92rem;
  cursor: pointer;
  font-weight: 600;
  min-height: 46px;
  transition: all 0.15s;
  box-shadow: 0 3px 10px rgba(11,37,69,0.25);
  font-family: inherit;
}
.inputbar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(11,37,69,0.35);
}
.inputbar button:active { transform: translateY(0); }

.disclaimer {
  text-align: center;
  font-size: 0.72rem;
  color: var(--muted);
  padding: 6px 12px 12px;
  background: #fff;
  z-index: 1;
  position: relative;
}

.typing { display: inline-flex; align-items: center; gap: 4px; }
.typing span {
  width: 7px; height: 7px;
  background: var(--muted);
  border-radius: 50%;
  animation: bounce 1.3s infinite both;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* RTL support */
[dir="rtl"] .msg.user { align-self: flex-start; }
[dir="rtl"] .msg.bot  { align-self: flex-end; }
.bubble[dir="rtl"] { text-align: right; }
.bubble[dir="rtl"] ul, .bubble[dir="rtl"] ol { margin-left: 0; margin-right: 22px; }

/* Hide other floating widgets */
.chat-launcher, .chat-panel { display: none !important; }

/* Mobile */
@media (max-width: 820px) {
  .app { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed; top: 0; left: -300px; width: 280px; height: 100vh;
    transition: left 0.25s; z-index: 1000;
  }
  .sidebar.open { left: 0; box-shadow: 8px 0 30px rgba(0,0,0,0.3); }
  .top .menu-btn { display: inline-block; }
  .chat-main { padding: 20px 16px 12px; }
  .suggests { padding: 8px 16px 12px; }
  .inputbar { padding: 12px 16px; }
  .msg { max-width: 90%; }
}
</style>
</head>
<body>

<div class="app">
  <aside class="sidebar" id="sideBar">
    <a href="<?= e(url('index.php')) ?>" class="sb-brand">
      <img src="<?= e($logoSrc) ?>" alt="Tanzania Immigration" onerror="this.src='<?= e(url('assets/logo-fallback.svg')) ?>'">
      <div>
        <div class="sb-name">Uhamiaji Chatbot</div>
        <div class="sb-sub">Tanzania Immigration · Sheria ya Uhamiaji</div>
      </div>
    </a>

    <div class="sb-langs">
      <div class="lbl">Switch language · Click to try</div>
      <div class="chips">
        <span data-greet="Hello"          title="English">EN</span>
        <span data-greet="Habari"          title="Kiswahili">SW</span>
        <span data-greet="你好"             title="中文">中文</span>
        <span data-greet="مرحبا"           title="العربية">العربية</span>
        <span data-greet="नमस्ते"          title="हिन्दी">हिन्दी</span>
        <span data-greet="السلام علیکم"    title="اردو">اردو</span>
        <span data-greet="Bonjour"         title="Français">FR</span>
        <span data-greet="Hola"            title="Español">ES</span>
        <span data-greet="Hallo"           title="Deutsch">DE</span>
      </div>
      <div class="hint">Auto-detect from your question.</div>
    </div>

    <div class="sb-actions">
      <button class="sb-newchat" id="newChatBtn">＋ New chat</button>
    </div>

    <div class="sb-section"><div class="sb-head" id="historyHead">Chat history</div></div>
    <div id="chatHistory" class="sb-history">
      <div class="sb-empty" id="historyEmpty">No conversations yet. Ask a question to start.</div>
    </div>

    <div class="sb-footer">
      <?php if ($user): ?>
        <a href="<?= e(url('admin.php')) ?>">→ Admin panel</a>
        <a href="<?= e(url('logout.php')) ?>">→ Sign out</a>
      <?php else: ?>
        <a href="<?= e(url('login.php')) ?>">→ Sign in / Register</a>
      <?php endif; ?>
    </div>
  </aside>

  <div class="chatwrap">
    <div class="top">
      <button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>
      <div>
        <div class="title">Uhamiaji Chatbot<span class="dot"></span></div>
        <div class="sub">Multilingual Tanzania immigration assistant</div>
      </div>
      <div class="badge">9 languages</div>
    </div>

    <div class="chat-main" id="chatMain"></div>
    <div class="suggests" id="chatSuggests"></div>

    <div class="inputbar">
      <input type="text" id="chatInput" placeholder="English · Kiswahili · 中文 · العربية · हिन्दी · اردو · Français · Español · Deutsch" autocomplete="off" autofocus>
      <button type="button" id="chatSend">Send ➤</button>
    </div>
    <div class="disclaimer">Uhamiaji Chatbot provides a summary of Tanzania immigration law · Hutoa muhtasari wa sheria za uhamiaji</div>
  </div>
</div>

<script>
(function () {
  'use strict';
  var endpoint = '<?= e(url('chat.php')) ?>';
  var main       = document.getElementById('chatMain');
  var suggests   = document.getElementById('chatSuggests');
  var input      = document.getElementById('chatInput');
  var sendBtn    = document.getElementById('chatSend');
  var menuBtn    = document.getElementById('menuBtn');
  var sideBar    = document.getElementById('sideBar');
  var historyBox = document.getElementById('chatHistory');
  var historyEmpty = document.getElementById('historyEmpty');
  var newChatBtn = document.getElementById('newChatBtn');

  var STORAGE_KEY = 'uhamiaji_history_v1';
  var currentId  = null;
  var currentMsgs = []; // [{role:'user'|'bot', content:string}]

  function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; }
  function scrollDown() { main.scrollTop = main.scrollHeight; }

  function dirFor(text) {
    if (/[\u0600-\u06ff\u0750-\u077f]/.test(text)) return 'rtl';
    return 'ltr';
  }

  // ------------------ HISTORY PERSISTENCE ------------------
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, 50))); } catch (e) {}
  }
  function upsertConvo() {
    if (!currentMsgs.length || currentMsgs.every(function (m) { return m.role !== 'user'; })) return;
    var list = loadHistory();
    var title = '';
    for (var i = 0; i < currentMsgs.length; i++) {
      if (currentMsgs[i].role === 'user') { title = currentMsgs[i].content; break; }
    }
    title = (title || 'New chat').slice(0, 60);
    var idx = -1;
    if (currentId) idx = list.findIndex(function (c) { return c.id === currentId; });
    var record = { id: currentId || ('c' + Date.now()), title: title, msgs: currentMsgs, ts: Date.now() };
    if (idx >= 0) list[idx] = record; else list.unshift(record);
    currentId = record.id;
    saveHistory(list);
    renderHistory();
  }
  function renderHistory() {
    var list = loadHistory();
    historyBox.innerHTML = '';
    if (!list.length) {
      historyBox.appendChild(historyEmpty);
      return;
    }
    list.forEach(function (c) {
      var item = el('div', 'sb-hitem' + (c.id === currentId ? ' active' : ''));
      item.title = c.title;
      item.textContent = c.title;
      item.addEventListener('click', function (ev) {
        if (ev.target.classList.contains('sb-hdel')) return;
        openConvo(c.id);
      });
      var del = el('button', 'sb-hdel'); del.textContent = '×'; del.title = 'Delete';
      del.addEventListener('click', function (ev) {
        ev.stopPropagation();
        deleteConvo(c.id);
      });
      item.appendChild(del);
      historyBox.appendChild(item);
    });
  }
  function openConvo(id) {
    var list = loadHistory();
    var c = list.find(function (x) { return x.id === id; });
    if (!c) return;
    currentId = id;
    currentMsgs = c.msgs.slice();
    redrawChat();
    renderHistory();
    if (sideBar) sideBar.classList.remove('open');
  }
  function deleteConvo(id) {
    var list = loadHistory().filter(function (x) { return x.id !== id; });
    saveHistory(list);
    if (currentId === id) { currentId = null; currentMsgs = []; redrawChat(true); }
    renderHistory();
  }
  function newChat() {
    upsertConvo();
    currentId = null;
    currentMsgs = [];
    redrawChat(true);
    renderHistory();
  }
  function redrawChat(showIntro) {
    main.innerHTML = '';
    suggests.innerHTML = '';
    currentMsgs.forEach(function (m) {
      if (m.role === 'user') renderUser(m.content);
      else renderBot(m.content);
    });
    if (showIntro && currentMsgs.length === 0) fetchIntro();
  }

  function renderUser(q) {
    var m = el('div', 'msg user');
    var b = el('div', 'bubble'); b.textContent = q; b.setAttribute('dir', dirFor(q));
    m.appendChild(b); main.appendChild(m); scrollDown();
  }
  function renderBot(html) {
    var m = el('div', 'msg bot');
    var b = el('div', 'bubble', html); b.setAttribute('dir', dirFor(b.textContent || ''));
    m.appendChild(b); main.appendChild(m); scrollDown();
  }
  function typing() {
    var m = el('div', 'msg bot');
    var b = el('div', 'bubble', '<span class="typing"><span></span><span></span><span></span></span>');
    m.appendChild(b); main.appendChild(m); scrollDown();
    return m;
  }
  function setSug(list) {
    suggests.innerHTML = '';
    (list || []).forEach(function (q) {
      var p = el('span', 'pill'); p.textContent = q;
      p.addEventListener('click', function () { ask(q); });
      suggests.appendChild(p);
    });
  }

  function ask(q) {
    if (!q || !q.trim()) return;
    if (sideBar) sideBar.classList.remove('open');
    renderUser(q);
    currentMsgs.push({ role: 'user', content: q });
    input.value = '';
    var t = typing();
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        t.parentNode.removeChild(t);
        var ans = d.answer || '';
        renderBot(ans);
        currentMsgs.push({ role: 'bot', content: ans });
        setSug(d.suggestions);
        upsertConvo();
      })
      .catch(function (err) {
        t.parentNode.removeChild(t);
        var msg = '<p style="color:#dc2626;">Error: ' + err.message + '</p>';
        renderBot(msg);
        currentMsgs.push({ role: 'bot', content: msg });
        upsertConvo();
      });
  }

  function fetchIntro() {
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: '' }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { renderBot(d.answer); setSug(d.suggestions); });
  }

  sendBtn.addEventListener('click', function () { ask(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ask(input.value); } });
  if (menuBtn) menuBtn.addEventListener('click', function () { sideBar.classList.toggle('open'); });
  newChatBtn.addEventListener('click', newChat);

  // Click a language chip to switch
  document.querySelectorAll('.sb-langs .chips span').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var g = chip.getAttribute('data-greet');
      if (g) { newChat(); ask(g); }
    });
  });

  // First render: show intro, then populate history list
  fetchIntro();
  renderHistory();
})();
</script>

</body>
</html>
