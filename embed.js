/**
 * Uhamiaji Chatbot — embed widget
 * Paste into any site (Blogger, WordPress, plain HTML). Creates a floating
 * chat bubble that opens a small chat panel talking to your chat.php host.
 *
 * Usage:
 *   <script src="https://YOUR-HOST/embed.js" data-endpoint="https://YOUR-HOST/chat.php"></script>
 *
 * The data-endpoint attribute can be omitted if the script is served from
 * the same host as chat.php (the default picks it up automatically).
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var endpoint = script.getAttribute('data-endpoint');
  if (!endpoint) {
    // Derive from the script's own URL
    try {
      var u = new URL(script.src);
      endpoint = u.origin + u.pathname.replace(/embed\.js.*$/, 'chat.php');
    } catch (e) {
      endpoint = '/chat.php';
    }
  }

  // ---------- styles ----------
  var css = [
    '.uhamiaji-btn{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;',
    'background:linear-gradient(135deg,#0b2545,#1d3c73);border:3px solid #e6b800;color:#fff;',
    'cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.25);display:flex;align-items:center;',
    'justify-content:center;font-family:Arial,sans-serif;font-size:26px;z-index:2147483647;',
    'transition:transform 0.15s;animation:uhamiaji-pulse 2s infinite;}',
    '.uhamiaji-btn:hover{transform:scale(1.08);}',
    '@keyframes uhamiaji-pulse{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,0.25),0 0 0 0 rgba(230,184,0,0.5);}',
    '50%{box-shadow:0 6px 20px rgba(0,0,0,0.25),0 0 0 12px rgba(230,184,0,0);}}',
    '.uhamiaji-badge{position:absolute;top:-4px;right:-4px;background:#e6b800;color:#0b2545;',
    'font-size:10px;font-weight:700;padding:2px 5px;border-radius:10px;}',
    '.uhamiaji-panel{position:fixed;right:20px;bottom:90px;width:360px;max-width:calc(100vw - 40px);',
    'height:540px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;',
    'box-shadow:0 16px 50px rgba(0,0,0,0.25);display:none;flex-direction:column;overflow:hidden;',
    'z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.uhamiaji-panel.open{display:flex;animation:uhamiaji-slide 0.2s ease;}',
    '@keyframes uhamiaji-slide{from{transform:translateY(12px);opacity:0;}to{transform:translateY(0);opacity:1;}}',
    '.uhamiaji-head{background:linear-gradient(135deg,#0b2545,#1d3c73);color:#fff;padding:14px 16px;',
    'display:flex;align-items:center;gap:10px;border-bottom:3px solid #e6b800;}',
    '.uhamiaji-head .ttl{font-weight:700;font-size:14px;flex:1;}',
    '.uhamiaji-head .ttl small{display:block;font-size:10px;opacity:0.75;font-weight:400;margin-top:2px;}',
    '.uhamiaji-head .x{background:transparent;border:0;color:#fff;cursor:pointer;font-size:22px;line-height:1;padding:0 4px;}',
    '.uhamiaji-body{flex:1;overflow-y:auto;padding:12px;background:#f4f7fb;display:flex;flex-direction:column;gap:8px;}',
    '.uhamiaji-msg{max-width:85%;padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.5;}',
    '.uhamiaji-msg.u{align-self:flex-end;background:linear-gradient(135deg,#0b2545,#1d3c73);color:#fff;border-bottom-right-radius:3px;}',
    '.uhamiaji-msg.b{align-self:flex-start;background:#fff;border:1px solid #e1e5eb;border-bottom-left-radius:3px;color:#1a1a1a;}',
    '.uhamiaji-msg p{margin:0 0 6px;}.uhamiaji-msg p:last-child{margin-bottom:0;}',
    '.uhamiaji-msg ul,.uhamiaji-msg ol{margin:4px 0 4px 18px;}',
    '.uhamiaji-msg strong{color:#0b2545;}',
    '.uhamiaji-msg table{width:100%;border-collapse:collapse;margin:6px 0;font-size:12px;}',
    '.uhamiaji-msg th{background:#0b2545;color:#fff;padding:4px 6px;text-align:left;}',
    '.uhamiaji-msg td{padding:4px 6px;border-bottom:1px solid #e1e5eb;}',
    '.uhamiaji-sug{padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px;background:#f4f7fb;border-top:1px solid #e1e5eb;}',
    '.uhamiaji-sug span{font-size:11px;padding:4px 10px;background:#fff;border:1px solid #cfd8e3;',
    'border-radius:12px;cursor:pointer;color:#0b2545;}',
    '.uhamiaji-sug span:hover{background:#0b2545;color:#fff;border-color:#0b2545;}',
    '.uhamiaji-input{display:flex;border-top:1px solid #e1e5eb;background:#fff;}',
    '.uhamiaji-input input{flex:1;border:0;padding:12px 14px;font-size:13px;outline:none;font-family:inherit;}',
    '.uhamiaji-input button{background:#0b2545;color:#fff;border:0;padding:0 18px;cursor:pointer;font-weight:600;font-family:inherit;font-size:12px;}',
    '.uhamiaji-foot{text-align:center;font-size:10px;color:#888;padding:4px 6px 6px;background:#fff;}',
    '.uhamiaji-dots span{display:inline-block;width:5px;height:5px;margin:0 1px;background:#6b7280;border-radius:50%;',
    'animation:uhamiaji-bounce 1.3s infinite both;}',
    '.uhamiaji-dots span:nth-child(2){animation-delay:0.2s;}',
    '.uhamiaji-dots span:nth-child(3){animation-delay:0.4s;}',
    '@keyframes uhamiaji-bounce{0%,80%,100%{opacity:0.25;}40%{opacity:1;}}',
    '@media (max-width:480px){.uhamiaji-panel{right:10px;bottom:80px;width:calc(100vw - 20px);height:calc(100vh - 100px);}}'
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- DOM ----------
  var btn = document.createElement('button');
  btn.className = 'uhamiaji-btn';
  btn.setAttribute('aria-label', 'Open Uhamiaji Chatbot');
  btn.innerHTML = '💬<span class="uhamiaji-badge">NEW</span>';

  var panel = document.createElement('div');
  panel.className = 'uhamiaji-panel';
  panel.innerHTML = [
    '<div class="uhamiaji-head">',
    '  <div class="ttl">Uhamiaji Chatbot<small>Tanzania Immigration · 9 languages</small></div>',
    '  <button class="x" aria-label="Close">&times;</button>',
    '</div>',
    '<div class="uhamiaji-body"></div>',
    '<div class="uhamiaji-sug"></div>',
    '<div class="uhamiaji-input"><input type="text" placeholder="Ask in any language…" autocomplete="off"><button>➤</button></div>',
    '<div class="uhamiaji-foot">Offline reference · not formal legal advice</div>'
  ].join('');

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var body     = panel.querySelector('.uhamiaji-body');
  var sugBar   = panel.querySelector('.uhamiaji-sug');
  var inputEl  = panel.querySelector('input');
  var sendEl   = panel.querySelector('.uhamiaji-input button');
  var closeEl  = panel.querySelector('.x');
  var opened   = false;

  function dirOf(t) { return /[\u0600-\u06ff\u0750-\u077f]/.test(t) ? 'rtl' : 'ltr'; }

  function u(role, html, txt) {
    var m = document.createElement('div');
    m.className = 'uhamiaji-msg ' + role;
    if (html !== undefined) m.innerHTML = html; else m.textContent = txt;
    m.setAttribute('dir', dirOf(m.textContent || ''));
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }
  function typing() {
    return u('b', '<span class="uhamiaji-dots"><span></span><span></span><span></span></span>');
  }
  function setSug(list) {
    sugBar.innerHTML = '';
    (list || []).slice(0, 5).forEach(function (q) {
      var s = document.createElement('span'); s.textContent = q;
      s.addEventListener('click', function () { ask(q); });
      sugBar.appendChild(s);
    });
  }
  function ask(q) {
    if (!q || !q.trim()) return;
    u('u', undefined, q);
    inputEl.value = '';
    var t = typing();
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { t.remove(); u('b', d.answer || ''); setSug(d.suggestions); })
      .catch(function (e) { t.remove(); u('b', '<span style="color:#b00">Error: ' + e.message + '</span>'); });
  }
  function open() {
    panel.classList.add('open');
    btn.style.display = 'none';
    opened = true;
    if (body.children.length === 0) {
      // First load — fetch intro
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: '' }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { u('b', d.answer || ''); setSug(d.suggestions); });
    }
    setTimeout(function () { inputEl.focus(); }, 200);
  }
  function close() {
    panel.classList.remove('open');
    btn.style.display = 'flex';
    opened = false;
  }

  btn.addEventListener('click', open);
  closeEl.addEventListener('click', close);
  sendEl.addEventListener('click', function () { ask(inputEl.value); });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); ask(inputEl.value); }
  });
})();
