(function () {
  'use strict';
  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var base;
  try {
    var u = new URL(script.src);
    base = u.href.replace(/embed\.js.*$/, '');
  } catch (e) { base = ''; }
  function loadScript(src, done) {
    var s = document.createElement('script');
    s.src = src; s.async = true; s.onload = done;
    document.head.appendChild(s);
  }
  var css = ['.uhamiaji-btn{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#0b2545,#1d3c73);border:3px solid #e6b800;color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:26px;z-index:2147483647;animation:uhamiaji-pulse 2s infinite;}','.uhamiaji-btn:hover{transform:scale(1.08);}','@keyframes uhamiaji-pulse{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,0.25),0 0 0 0 rgba(230,184,0,0.5);}50%{box-shadow:0 6px 20px rgba(0,0,0,0.25),0 0 0 12px rgba(230,184,0,0);}}','.uhamiaji-badge{position:absolute;top:-4px;right:-4px;background:#e6b800;color:#0b2545;font-size:10px;font-weight:700;padding:2px 5px;border-radius:10px;}','.uhamiaji-panel{position:fixed;right:20px;bottom:90px;width:360px;max-width:calc(100vw - 40px);height:540px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 16px 50px rgba(0,0,0,0.25);display:none;flex-direction:column;overflow:hidden;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;}','.uhamiaji-panel.open{display:flex;}','.uhamiaji-head{background:linear-gradient(135deg,#0b2545,#1d3c73);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:3px solid #e6b800;}','.uhamiaji-head .ttl{font-weight:700;font-size:14px;flex:1;}','.uhamiaji-head .ttl small{display:block;font-size:10px;opacity:0.75;font-weight:400;margin-top:2px;}','.uhamiaji-head .x{background:transparent;border:0;color:#fff;cursor:pointer;font-size:22px;padding:0 4px;}','.uhamiaji-body{flex:1;overflow-y:auto;padding:12px;background:#f4f7fb;display:flex;flex-direction:column;gap:8px;}','.uhamiaji-msg{max-width:85%;padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.5;}','.uhamiaji-msg.u{align-self:flex-end;background:linear-gradient(135deg,#0b2545,#1d3c73);color:#fff;}','.uhamiaji-msg.b{align-self:flex-start;background:#fff;border:1px solid #e1e5eb;color:#1a1a1a;}','.uhamiaji-msg p{margin:0 0 6px;}','.uhamiaji-msg p:last-child{margin-bottom:0;}','.uhamiaji-msg ul{margin:4px 0 4px 18px;}','.uhamiaji-msg strong{color:#0b2545;}','.uhamiaji-msg table{width:100%;border-collapse:collapse;margin:6px 0;font-size:12px;}','.uhamiaji-msg th{background:#0b2545;color:#fff;padding:4px 6px;text-align:left;}','.uhamiaji-msg td{padding:4px 6px;border-bottom:1px solid #e1e5eb;}','.uhamiaji-sug{padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px;background:#f4f7fb;border-top:1px solid #e1e5eb;}','.uhamiaji-sug span{font-size:11px;padding:4px 10px;background:#fff;border:1px solid #cfd8e3;border-radius:12px;cursor:pointer;color:#0b2545;}','.uhamiaji-sug span:hover{background:#0b2545;color:#fff;}','.uhamiaji-input{display:flex;border-top:1px solid #e1e5eb;background:#fff;}','.uhamiaji-input input{flex:1;border:0;padding:12px 14px;font-size:13px;outline:none;font-family:inherit;}','.uhamiaji-input button{background:#0b2545;color:#fff;border:0;padding:0 18px;cursor:pointer;font-weight:600;font-family:inherit;}','.uhamiaji-foot{text-align:center;font-size:10px;color:#888;padding:4px 6px 6px;background:#fff;}'].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  function bootUI() {
    var btn = document.createElement('button');
    btn.className = 'uhamiaji-btn';
    btn.innerHTML = '💬<span class="uhamiaji-badge">NEW</span>';
    var panel = document.createElement('div');
    panel.className = 'uhamiaji-panel';
    panel.innerHTML = '<div class="uhamiaji-head"><div class="ttl">Uhamiaji Chatbot<small>Tanzania Immigration · 9 languages</small></div><button class="x">&times;</button></div><div class="uhamiaji-body"></div><div class="uhamiaji-sug"></div><div class="uhamiaji-input"><input type="text" placeholder="Ask in any language…"><button type="button">➤</button></div><div class="uhamiaji-foot">Offline reference · not formal legal advice</div>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    var body = panel.querySelector('.uhamiaji-body');
    var sug = panel.querySelector('.uhamiaji-sug');
    var inp = panel.querySelector('input');
    var snd = panel.querySelector('.uhamiaji-input button');
    var cls = panel.querySelector('.x');
    function dir(t){ return /[\u0600-\u06ff\u0750-\u077f]/.test(t) ? 'rtl' : 'ltr'; }
    function add(role, html, txt){
      var m = document.createElement('div'); m.className = 'uhamiaji-msg ' + role;
      if (html !== undefined) m.innerHTML = html; else m.textContent = txt;
      m.setAttribute('dir', dir(m.textContent || ''));
      body.appendChild(m); body.scrollTop = body.scrollHeight;
    }
    function setSug(list){
      sug.innerHTML = '';
      (list || []).slice(0,5).forEach(function(q){
        var s = document.createElement('span'); s.textContent = q;
        s.addEventListener('click', function(){ ask(q); });
        sug.appendChild(s);
      });
    }
    function ask(q){
      if (!q || !q.trim()) return;
      add('u', undefined, q);
      inp.value = '';
      var r = window.UhamiajiChatbot.ask(q);
      add('b', r.answer);
      setSug(r.suggestions);
    }
    btn.addEventListener('click', function(){
      panel.classList.add('open'); btn.style.display = 'none';
      if (body.children.length === 0) {
        var intro = window.UhamiajiChatbot.intro('en');
        add('b', intro.answer); setSug(intro.suggestions);
      }
      setTimeout(function(){ inp.focus(); }, 200);
    });
    cls.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); panel.classList.remove('open'); btn.style.display='flex'; return false; });
    snd.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); ask(inp.value); return false; });
    inp.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        ask(inp.value);
        return false;
      }
    });
    inp.addEventListener('keypress', function(e){
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault(); e.stopPropagation();
        return false;
      }
    });
  }
  loadScript(base + 'knowledge.js', function () {
    loadScript(base + 'engine.js', function () {
      if (document.body) bootUI();
      else document.addEventListener('DOMContentLoaded', bootUI);
    });
  });
})();
