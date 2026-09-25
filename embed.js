/*!
 * Mr. HamaHama v2 — chatbot ya Uhamiaji Tanzania inayoongozwa kwa kubofya.
 * Majibu yote yanatoka data/knowledge.json (FAQ zilizohakikiwa) na data/sheria.json
 * (vifungu vya sheria vilivyotolewa na tools/build_kb.py). Haibuni jibu lolote.
 */
(function () {
  'use strict';
  var script = document.currentScript;
  // Script ikiwekwa kwenye <head> bila defer, subiri <body> ipatikane.
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', function () { start(script); });
    return;
  }
  start(script);

function start(script) {
  if (document.getElementById('hamahama-panel')) return;

  var base = script && script.src ? script.src.replace(/[^/]+$/, '') : './';
  var cfg = (script && script.dataset) || {};
  var KB_URL = cfg.kb || base + 'data/knowledge.json';
  var LAWS_URL = cfg.laws || base + 'data/sheria.json';
  var VERSION = '2.0.0';

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = base + 'widget.css?v=' + VERSION;
  document.head.appendChild(css);

  /* ---------- Icons ---------- */
  var paths = {
    chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    back: '<path d="M15 18 9 12l6-6"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/>',
    visa: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    permit: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 9h.01M11 9h6M8 13h9"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    law: '<path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
    up: '<path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7V10l4-8a2.9 2.9 0 0 1 4 3.9z"/>',
    down: '<path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.6 3H17v11l-4 8a2.9 2.9 0 0 1-4-3.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.info) + '</svg>';
  }

  /* ---------- UI text ---------- */
  var T = {
    sw: {
      subtitle: 'Msaidizi wako wa Uhamiaji', online: 'Mtandaoni',
      welcome: 'Karibu! Mimi ni Mr. HamaHama, msaidizi wa kidijitali wa Idara ya Uhamiaji Tanzania.',
      pick: 'Bofya huduma unayohitaji, au andika swali lako hapa chini.',
      popular: 'Maswali yanayoulizwa zaidi', placeholder: 'Andika swali lako...',
      home: 'Menyu kuu', back: 'Rudi', steps: 'Hatua', source: 'Chanzo', page: 'uk.',
      related: 'Maswali yanayohusiana', helpful: 'Je, jibu hili limekusaidia?',
      thanks: 'Asante kwa maoni yako!', sorry: 'Samahani. Kwa msaada zaidi wasiliana na info@immigration.go.tz.',
      suggest: 'Nimepata maswali haya yanayokaribiana na swali lako. Chagua moja:',
      docsLead: 'Kwa mujibu wa', readSection: 'Soma kifungu kizima', otherSections: 'Vifungu vingine vinavyohusiana',
      docsNote: 'Haya ni maneno halisi ya nyaraka rasmi; sheria nyingi zimeandikwa kwa Kiingereza. Kwa kesi yako binafsi, thibitisha na Idara ya Uhamiaji.',
      fromLaw: 'Kutoka kwenye sheria', notfound: 'Sijapata jibu lililohakikiwa kwa swali hilo. Chagua huduma hapa chini au wasiliana na info@immigration.go.tz.',
      greet: 'Karibu sana! Nikusaidie kuhusu huduma gani?', typing: 'Mr. HamaHama anaandika',
      disclaimer: 'Taarifa hizi ni muhtasari wa miongozo rasmi. Thibitisha na Idara ya Uhamiaji kabla ya kufanya uamuzi.',
      lawsEmpty: 'Sheria bado hazijapakiwa kwenye chatbot. (Msimamizi: endesha tools/build_kb.py.)',
      lawsLoading: 'Inapakia sheria...', sections: 'Chagua kifungu:', more: 'Onyesha zaidi', readMore: 'Soma zaidi',
      filter: 'Tafuta ndani ya sheria hii...', section: 'Kifungu', enlarge: 'Kuza picha', closeImg: 'Funga',
      langBtn: 'EN', langLabel: 'Switch to English', close: 'Funga', open: 'Fungua Mr. HamaHama'
    },
    en: {
      subtitle: 'Your Immigration Assistant', online: 'Online',
      welcome: 'Welcome! I am Mr. HamaHama, the digital assistant of the Tanzania Immigration Department.',
      pick: 'Tap the service you need, or type your question below.',
      popular: 'Most asked questions', placeholder: 'Type your question...',
      home: 'Main menu', back: 'Back', steps: 'Steps', source: 'Source', page: 'p.',
      related: 'Related questions', helpful: 'Was this answer helpful?',
      thanks: 'Thank you for your feedback!', sorry: 'Sorry about that. For more help contact info@immigration.go.tz.',
      suggest: 'I found these questions close to yours. Choose one:',
      docsLead: 'According to', readSection: 'Read the full section', otherSections: 'Other related sections',
      docsNote: 'These are the exact words of the official documents. For your personal case, confirm with the Immigration Department.',
      fromLaw: 'From the law', notfound: 'I do not have a verified answer for that. Choose a service below or contact info@immigration.go.tz.',
      greet: 'You are welcome! Which service can I help you with?', typing: 'Mr. HamaHama is typing',
      disclaimer: 'This is a summary of official guidelines. Confirm with the Immigration Department before making a decision.',
      lawsEmpty: 'Laws have not been loaded into the chatbot yet. (Admin: run tools/build_kb.py.)',
      lawsLoading: 'Loading laws...', sections: 'Choose a section:', more: 'Show more', readMore: 'Read more',
      filter: 'Search within this law...', section: 'Section', enlarge: 'Enlarge image', closeImg: 'Close',
      langBtn: 'SW', langLabel: 'Badili kuwa Kiswahili', close: 'Close', open: 'Open Mr. HamaHama'
    }
  };

  var lang = (cfg.lang || 'sw').toLowerCase() === 'en' ? 'en' : 'sw';
  function t(key) { return T[lang][key]; }
  function L(obj) { return obj ? (obj[lang] || obj.sw || obj.en || '') : ''; }

  /* ---------- DOM helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function button(cls, html, onClick, label) {
    var b = el('button', cls);
    b.type = 'button';
    b.innerHTML = html;
    if (label) b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    return b;
  }

  /* ---------- Build shell ---------- */
  var avatar = base + 'assets/mr-hamahama.png';
  var panel = el('section', 'hh-panel');
  panel.id = 'hamahama-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Mr. HamaHama');
  panel.innerHTML =
    '<header class="hh-head">' +
      '<div class="hh-avatar"><img src="' + avatar + '" alt=""></div>' +
      '<div class="hh-title"><strong>Mr. HamaHama</strong><span data-t="subtitle"></span>' +
      '<span class="hh-status"><i></i><b data-t="online"></b></span></div>' +
      '<button type="button" class="hh-lang" data-lang></button>' +
      '<button type="button" class="hh-icon" data-home>' + icon('home') + '</button>' +
      '<button type="button" class="hh-icon" data-close>' + icon('close') + '</button>' +
    '</header>' +
    '<main class="hh-chat" aria-live="polite"></main>' +
    '<footer class="hh-compose">' +
      '<form class="hh-box"><input type="text" autocomplete="off" maxlength="200"><button type="submit" class="hh-send">' + icon('send') + '</button></form>' +
      '<div class="hh-powered">Powered by <b>Ngosha Multimedia</b> · NgoshaChatBot</div>' +
    '</footer>';
  var launcher = el('button', 'hh-launcher');
  launcher.type = 'button';
  launcher.innerHTML = '<span class="hh-launch-logo"><img src="' + avatar + '" alt=""><i></i></span>' +
    '<span class="hh-launch-copy"><strong>Ask Me!</strong><small>Mr. HamaHama</small></span>' + icon('chat');
  document.body.appendChild(panel);
  document.body.appendChild(launcher);

  var chat = panel.querySelector('.hh-chat');
  var form = panel.querySelector('form');
  var input = form.querySelector('input');

  function applyText() {
    panel.querySelectorAll('[data-t]').forEach(function (n) { n.textContent = t(n.getAttribute('data-t')); });
    var lb = panel.querySelector('[data-lang]');
    lb.textContent = t('langBtn');
    lb.setAttribute('aria-label', t('langLabel'));
    panel.querySelector('[data-home]').setAttribute('aria-label', t('home'));
    panel.querySelector('[data-close]').setAttribute('aria-label', t('close'));
    panel.querySelector('.hh-send').setAttribute('aria-label', t('placeholder'));
    input.placeholder = t('placeholder');
    input.setAttribute('aria-label', t('placeholder'));
    launcher.setAttribute('aria-label', t('open'));
    panel.lang = lang;
  }

  /* ---------- Data ---------- */
  var kb = null, laws = null, lawsPromise = null;
  var kbPromise = fetch(KB_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { kb = d; indexFaqs(); return d; })
    .catch(function () { kb = { topics: [], faqs: [], popular: [] }; return kb; });

  function loadLaws() {
    if (!lawsPromise) {
      lawsPromise = fetch(LAWS_URL, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { laws = (d && d.laws) || []; indexLaws(); return laws; })
        .catch(function () { laws = []; return laws; });
    }
    return lawsPromise;
  }
  function faq(id) { return kb && kb.faqs.filter(function (f) { return f.id === id; })[0]; }
  function topic(id) { return kb && kb.topics.filter(function (x) { return x.id === id; })[0]; }

  /* ---------- Search (Kiswahili + English) ---------- */
  var STOP = ' na ya wa za la cha vya kwa ni je au kama hii hiyo huo yangu wangu langu changu nini gani vipi jinsi naweza nataka ninataka naomba ninaomba nahitaji ninahitaji tafadhali mkuu habari the a an and or of to for in on is are do does can i my me how what which please about with want need get '.split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { if (w) STOPSET[w] = 1; });
  // Maneno yenye maana moja (Kiswahili/Kiingereza) hupewa jina moja la dhana.
  var CONCEPTS = [
    ['passport', ['pasipot', 'pasport', 'paspot', 'passport', 'hati ya kusafiri']],
    ['visa', ['visa', 'viza', 'evisa']],
    ['permit', ['kibali', 'vibali', 'permit', 'residen', 'ukaazi', 'ukazi', 'kuishi']],
    ['citizen', ['uraia', 'citizen', 'naturali', 'tajnisi']],
    ['fee', ['gharama', 'ada', 'bei', 'fee', 'cost', 'price', 'shilingi', 'dola']],
    ['pay', ['lipa', 'malipo', 'pay', 'control']],
    ['lost', ['pote', 'ibiw', 'lost', 'stolen', 'stole']],
    ['damaged', ['harib', 'ungua', 'chanik', 'damag']],
    ['track', ['fuatil', 'track', 'status', 'angalia', 'hali ya', 'progress']],
    ['apply', ['omba', 'ombi', 'apply', 'applic', 'pata', 'jipya', 'new']],
    ['child', ['mtoto', 'watoto', 'child', 'kid']],
    ['docs', ['viambat', 'vielele', 'nyaraka', 'masharti', 'requir', 'document', 'mahitaji', 'vitu']],
    ['types', ['aina', 'type', 'class', 'daraja', 'madaraja']],
    ['enrol', ['vidole', 'finger', 'enrol', 'biometr']],
    ['zanzibar', ['zanzibar', 'unguja', 'pemba']],
    ['entry', ['kuingia', 'entry', 'enter', 'border', 'mpakani']],
    ['contact', ['wasilian', 'mawasiliano', 'contact', 'email', 'simu', 'msaada', 'help']],
    ['work', ['kazi', 'work', 'ajira', 'employ']]
  ];
  function normalize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s.-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tokens(s) {
    var text = normalize(s), out = {};
    CONCEPTS.forEach(function (c) {
      for (var i = 0; i < c[1].length; i++) {
        var stem = c[1][i];
        var hit = stem.length <= 3 ? new RegExp('\\b' + stem + '\\b').test(text) : text.indexOf(stem) > -1;
        if (hit) { out['#' + c[0]] = 2; break; }
      }
    });
    (text.match(/[a-z0-9]+/g) || []).forEach(function (w) {
      if (w.length > 2 && !STOPSET[w]) out[w] = out[w] || 1;
    });
    return out;
  }
  function overlap(q, doc) {
    var total = 0, hit = 0;
    Object.keys(q).forEach(function (k) {
      total += q[k];
      if (doc[k]) hit += q[k];
      else if (k.charAt(0) !== '#' && k.length >= 5) {
        // kosa dogo la tahajia au neno linaloanza sawa
        for (var d in doc) {
          if (d.charAt(0) !== '#' && d.length >= 5 && (d.indexOf(k.slice(0, 5)) === 0 || close1(k, d))) { hit += q[k] * 0.7; break; }
        }
      }
    });
    return total ? hit / total : 0;
  }
  function close1(a, b) { // umbali wa Levenshtein <= 1
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }
  function indexFaqs() {
    kb.faqs.forEach(function (f) {
      var parts = [f.q.sw, f.q.en].concat(f.aliases || []);
      f._docs = parts.map(tokens);
    });
  }
  function searchFaqs(q) {
    var qt = tokens(q);
    if (!Object.keys(qt).length) return [];
    return kb.faqs.map(function (f) {
      var best = 0, nq = normalize(q);
      f._docs.forEach(function (d) { best = Math.max(best, overlap(qt, d) * 0.6 + overlap(d, qt) * 0.4); });
      // Jina mbadala likipatikana lote ndani ya swali, hilo ndilo jibu (refu zaidi hushinda).
      (f.aliases || []).forEach(function (a) {
        var na = normalize(a).trim();
        if (na.length > 3 && (' ' + nq + ' ').indexOf(' ' + na + ' ') > -1) best = Math.max(best, 1 + na.length / 100);
      });
      return { f: f, score: best };
    }).filter(function (r) { return r.score >= 0.3; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  var TOPIC_CONCEPT = { passport: '#passport', visa: '#visa', residence: '#permit', citizenship: '#citizen' };
  function topicFor(q) {
    var qt = tokens(q);
    return kb.topics.filter(function (tp) { return TOPIC_CONCEPT[tp.id] && qt[TOPIC_CONCEPT[tp.id]]; })[0];
  }
  /* ---------- Injini ya kusoma nyaraka (BM25 + kuchagua sentensi) ----------
   * Hakuna AI wala API: chatbot inatafuta kifungu kinachohusika zaidi kwenye sheria
   * na kuonyesha sentensi halisi zinazojibu swali, pamoja na chanzo chake.
   */
  var SYN = [
    'pasipoti passport hati kusafiria', 'visa viza', 'kibali vibali permit residence ukaazi ukazi',
    'uraia citizenship citizen naturalisation naturalization tajnisi', 'mgeni wageni foreigner alien immigrant non-citizen',
    'adhabu penalty punishment faini fine kifungo imprisonment jela', 'kosa makosa offence offense contravene contravention',
    'kuingia ingia entry enter admission', 'kutoka departure exit', 'mpaka mipaka border frontier port kituo',
    'afisa ofisa officer', 'mkurugenzi kamishna director commissioner', 'kufukuzwa fukuza fukuzwa deport deportation removal expel',
    'marufuku prohibited forbidden', 'kazi ajira ajiri kuajiri work employment employ employed employer engage', 'mwekezaji uwekezaji investor investment business',
    'mtoto watoto mdogo child children minor', 'ndoa mke mume mwenzi spouse marriage married wife husband',
    'kuzaliwa zaliwa birth born', 'nje outside abroad', 'kukana kana renounce renunciation', 'masharti sharti vigezo conditions condition eligibility qualifications', 'kunyang anywa nyang deprivation deprive deprived', 'ada gharama bei fee fees cost charge', 'kupotea potea imepotea lost stolen imeibiwa ibiwa',
    'kuharibika imeharibika damaged', 'maombi ombi kuomba omba apply application applicant',
    'kufuta kufutwa futwa futa cancel cancelled cancellation revoke revocation', 'rufaa appeal', 'mkimbizi wakimbizi refugee asylum',
    'kuongeza kurefusha refusha extension extend renew renewal', 'muda kipindi period duration validity',
    'pacha dual', 'kukamatwa kamata kamatwa arrest detain detention', 'msafiri wasafiri traveller traveler passenger',
    'meli ship vessel', 'ndege aircraft', 'mwajiri employer', 'mwanafunzi wanafunzi student', 'kujitolea volunteer',
    'mstaafu wastaafu retiree retired', 'mmisionari missionary', 'mtafiti researcher research', 'siku days', 'nchi country countries', 'hitaji require required requirement requirements', 'ruhusiwa ruhusa allowed permitted', 'chukua processing processed process', 'dharura emergency', 'mwanafunzi wanafunzi student students', 'mwaka miaka year years',
    'mahakama court', 'hati document documents nyaraka vielelezo', 'kughushi ghushi forge forgery forged false', 'kusafirisha smuggle smuggling trafficking'
  ].map(function (g) { return g.split(' '); });
  var SYNMAP = {};
  SYN.forEach(function (g) {
    var toks = [];
    g.forEach(function (w) { (normalize(w).match(/[a-z0-9]+/g) || []).forEach(function (t) { toks.push(stem(t)); }); });
    toks.forEach(function (t) { SYNMAP[t] = (SYNMAP[t] || []).concat(toks); });
  });
  var DSTOP = {};
  (STOP.join(' ') + ' bila kiasi kupata pata nifanye nifanyeje fanye ngapi gani nchini tanzania mimi wewe yeye sisi changu chako chake zangu zako yake wake yetu nini sasa pia tu kweli ili shall such under may it its from who whom whose person act section any be by as at this that these those there where when been being has have had not no all other than into upon within without per said subsection paragraph regulations regulation made provided unless').split(' ').forEach(function (w) { if (w) DSTOP[w] = 1; });

  function stem(w) {
    if (w.length > 5) {
      var sufs = [['ations', 'ate'], ['ation', 'ate'], ['ments', ''], ['ment', ''], ['ings', ''], ['ing', ''], ['ies', 'y'], ['ed', ''], ['es', ''], ['s', '']];
      for (var i = 0; i < sufs.length; i++) {
        var s = sufs[i][0];
        if (w.slice(-s.length) === s && w.slice(-2) !== 'ss') return w.slice(0, -s.length) + sufs[i][1];
      }
    } else if (w.length > 3 && w.slice(-1) === 's' && w.slice(-2) !== 'ss') return w.slice(0, -1);
    return w;
  }
  function dtokens(s) {
    // "Class B", "Permit C", "daraja B" -> neno moja "classb"
    s = normalize(s).replace(/\b(class|permit|daraja|kundi)\s+([abc])\b/g, ' $1 class$2 ')
      // kukanusha: "zisizohitaji visa", "do not require a visa" -> norequire
      .replace(/\b(do not|does not|don t|doesn t|not) requir\w*/g, ' norequire ')
      .replace(/\b\w*sizohitaji\b|\bhazihitaji\b|\bhaihitaji\b|\bhahitaji\b|\bvisa free\b/g, ' norequire ');
    return (s.match(/[a-z0-9]+/g) || []).filter(function (w) { return w.length > 1 && !DSTOP[w]; }).map(stem);
  }

  var docs = [], postings = {}, avgLen = 1;
  function indexLaws() {
    docs = []; postings = {};
    laws.forEach(function (law) {
      law.sections.forEach(function (s) {
        s._tok = tokens((s.title || '') + ' ' + (s.text || '').slice(0, 1500)); // kichujio cha orodha ya vifungu
        var text = s.text || '';
        var parts = [];
        for (var i = 0; i < text.length; i += 1600) parts.push(text.slice(Math.max(0, i - 200), i + 1600));
        if (!parts.length) parts.push('');
        parts.forEach(function (part) {
          var toks = dtokens((s.title || '') + ' ' + (s.title || '') + ' ' + part);
          var d = { law: law, s: s, text: part, len: Math.max(1, toks.length), tf: {} };
          toks.forEach(function (t) { d.tf[t] = (d.tf[t] || 0) + 1; });
          var idx = docs.push(d) - 1;
          Object.keys(d.tf).forEach(function (t) { (postings[t] = postings[t] || []).push(idx); });
        });
      });
    });
    avgLen = docs.reduce(function (a, d) { return a + d.len; }, 0) / (docs.length || 1);
  }
  // Maneno ya swali: kila neno ni "kundi" (neno + visawe vyake vya Kiswahili/Kiingereza).
  function queryGroups(q) {
    var seen = {};
    return dtokens(q).filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; })
      .map(function (t) {
        var g = {}; g[t] = 1;
        var syn = SYNMAP[t];
        if (!syn) {
          // Kiswahili: neno lenye viambishi (nikiingia, kimefutwa) -> mzizi wake (ingia, futwa)
          var root = Object.keys(SYNMAP).filter(function (k) { return k.length >= 4 && t.length > k.length && t.indexOf(k) > -1; })
            .sort(function (a, b) { return b.length - a.length; })[0];
          if (root) syn = SYNMAP[root].concat(root);
        }
        (syn || []).forEach(function (x) { if (!g[x]) g[x] = 0.95; }); // lugha isiamue jibu: kisawe ~ neno lenyewe
        return g;
      });
  }
  function idf(t) {
    var n = (postings[t] || []).length;
    return n ? Math.log(1 + (docs.length - n + 0.5) / (n + 0.5)) : 0;
  }
  function searchDocs(q, k) {
    if (!docs.length) return [];
    var groups = queryGroups(q), scores = {};
    var wantsFee = groups.some(function (g) { return g.fee || g.ada || g.gharama; });
    groups.forEach(function (g) {
      // kwa kila kundi, chukua alama bora ya neno lake moja ndani ya kila hati (visawe havijumlishwi mara mbili)
      var best = {};
      Object.keys(g).forEach(function (t) {
        var w = g[t] * idf(t);
        (postings[t] || []).forEach(function (i) {
          var d = docs[i], tf = d.tf[t];
          var sc = w * tf * 2.4 / (tf + 1.4 * (0.25 + 0.75 * d.len / avgLen));
          if (!best[i] || sc > best[i]) best[i] = sc;
        });
      });
      Object.keys(best).forEach(function (i) { scores[i] = (scores[i] || 0) + best[i]; });
    });
    return Object.keys(scores).map(function (i) {
      var d = docs[i], hit = groups.filter(function (g) { return Object.keys(g).some(function (t) { return d.tf[t]; }); }).length;
      // vipande vifupi sana ("angalia jedwali hapa chini") visishinde maelezo kamili
      var prior = Math.sqrt(Math.min(1, d.len / 30));
      // kichwa cha kipengele chenye maneno ya swali ni ishara kubwa ya jibu sahihi
      var tt = {};
      dtokens((d.s.title || '') + ' ' + (d.law.title || '')).forEach(function (t) { tt[t] = 1; });
      var titleHit = groups.filter(function (g) { return Object.keys(g).some(function (t) { return tt[t]; }); }).length;
      var boost = 1 + 0.8 * (groups.length ? titleHit / groups.length : 0);
      if (wantsFee && isTable(d.text)) boost *= 1.6;
      boost *= Math.pow(d.law.priority || 1, wantsFee ? 3 : 1); // ada: majedwali safi ya tovuti rasmi kwanza
      return { d: d, score: scores[i] * prior * boost, coverage: groups.length ? hit / groups.length : 0 };
    }).sort(function (a, b) { return b.score - a.score; }).slice(0, k || 5);
  }
  // Gawa maandishi ya kisheria kuwa sentensi/vifungu vidogo: (1), (a), au mwisho wa sentensi.
  function sentences(text) {
    return text.replace(/\s*\n\s*(?=\(\w{1,4}\)\s)/g, '\n').split(/\n+|(?<=[.;:])\s+(?=[A-Z(])/)
      .map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 25; });
  }
  function bestSentences(d, groups, max) {
    var sents = sentences(d.text);
    var scored = sents.map(function (sn, i) {
      var toks = {}, sc = 0;
      dtokens(sn).forEach(function (t) { toks[t] = 1; });
      groups.forEach(function (g) {
        var m = 0;
        Object.keys(g).forEach(function (t) { if (toks[t]) m = Math.max(m, g[t] * idf(t)); });
        sc += m;
      });
      return { i: i, text: sn, score: sc / Math.pow(Math.max(8, Object.keys(toks).length), 0.35) };
    }).filter(function (x) { return x.score > 0; });
    var top = scored.sort(function (a, b) { return b.score - a.score; }).slice(0, max);
    return top.sort(function (a, b) { return a.i - b.i; });
  }
  // Jedwali (ada n.k.): onyesha mistari yote badala ya sentensi 3.
  function isTable(text) {
    var lines = text.split('\n');
    var money = lines.filter(function (l) { return /\b(USD|Tsh|TZS|Gratis)\b|\d[\d,]*\/-/i.test(l); }).length;
    return (text.match(/\|/g) || []).length >= 6 || money >= 3;
  }
  function tableLines(text) {
    // mistari ya jedwali tu (yenye | au kiasi cha fedha); simama aya ndefu ya maelezo ikianza
    var out = [];
    text.split('\n').some(function (l) {
      l = l.trim();
      if (!l) return false;
      var row = /\|/.test(l) || (/\b(USD|Tsh|TZS|Gratis)\b|\d[\d,]*\/-/i.test(l) && l.length < 110) || l.length < 60;
      if (!row && out.length >= 2) return true;
      if (row) out.push(l);
      return out.length >= 10;
    });
    return out.map(function (l, i) { return { i: i, text: l, score: 1 }; });
  }
  function docsAnswer(q) {
    var groups = queryGroups(q);
    if (!groups.length || (groups.length === 1 && topicFor(q))) return null; // "uraia" peke yake -> fungua mada
    var need = groups.length <= 2 ? 1 : 0.5;
    var hits = searchDocs(q, 12).filter(function (h) { return h.coverage >= need; });
    if (!hits.length) return null;
    // alama ya BM25 ikichanganywa na sehemu ya maneno ya swali yaliyoguswa
    hits.sort(function (a, b) { return b.score * (0.4 + b.coverage) - a.score * (0.4 + a.coverage); });
    var top = hits[0];
    var picks = isTable(top.d.text) ? tableLines(top.d.text) : bestSentences(top.d, groups, 3);
    var second = null;
    if (isTable(top.d.text)) { // swali la ada: onyesha pia jedwali la pili linalohusiana (mf. ndani ya nchi / ubalozini)
      second = hits.slice(1).filter(function (h) {
        return h.d.s !== top.d.s && h.d.law === top.d.law && isTable(h.d.text) && h.score >= top.score * 0.5;
      })[0] || null;
    }
    if (!picks.length) return null;
    var others = [], seen = {};
    seen[top.d.law.id + '#' + top.d.s.no + top.d.s.title] = 1;
    hits.slice(1).forEach(function (h) {
      var key = h.d.law.id + '#' + h.d.s.no + h.d.s.title;
      if (!seen[key] && h.coverage >= need * 0.8 && h.score >= top.score * 0.45) { seen[key] = 1; others.push(h); }
    });
    if (second) others = others.filter(function (h) { return h.d.s !== second.d.s; });
    return { top: top, picks: picks, second: second, others: others.slice(0, 3), groups: groups };
  }
  function highlight(text, groups, node) {
    var words = {};
    groups.forEach(function (g) { Object.keys(g).forEach(function (t) { words[t] = 1; }); });
    text.split(/([A-Za-z0-9À-ɏ]+)/).forEach(function (part) {
      if (/^[A-Za-z0-9À-ɏ]+$/.test(part) && words[stem(normalize(part))]) node.appendChild(el('mark', null, part));
      else if (part) node.appendChild(document.createTextNode(part));
    });
  }
  // Sehemu ya maneno ya swali yanayopatikana kwenye swali/majina mbadala ya FAQ yenyewe.
  function faqCoverage(f, q) {
    var groups = queryGroups(q), toks = {};
    dtokens([f.q.sw, f.q.en].concat(f.aliases || []).join(' ')).forEach(function (t) { toks[t] = 1; });
    if (!groups.length) return 1;
    return groups.filter(function (g) { return Object.keys(g).some(function (t) { return toks[t]; }); }).length / groups.length;
  }
  function lawRef(law, s) { return law.title + (s.no ? ' — ' + t('section') + ' ' + s.no : '') + (s.title ? ' (' + s.title + ')' : ''); }
  function searchLaws(q) {
    return searchDocs(q, 3).filter(function (h) { return h.coverage >= 0.5; }).map(function (h) { return { law: h.d.law, s: h.d.s }; });
  }

  /* ---------- Messages ---------- */
  function scroll(node) {
    requestAnimationFrame(function () {
      if (node) chat.scrollTop = Math.max(0, node.offsetTop - 12);
      else chat.scrollTop = chat.scrollHeight;
    });
  }
  function userSay(text) {
    var m = el('div', 'hh-msg hh-user', text);
    chat.appendChild(m);
    return m;
  }
  function botSay() {
    var m = el('div', 'hh-msg hh-bot');
    chat.appendChild(m);
    return m;
  }
  function typing(done) {
    var tp = el('div', 'hh-typing');
    tp.setAttribute('role', 'status');
    tp.innerHTML = '<span class="hh-typing-avatar"><img src="' + avatar + '" alt=""></span><span>' + t('typing') + '</span><span class="hh-dots"><i></i><i></i><i></i></span>';
    chat.appendChild(tp);
    scroll();
    setTimeout(function () { tp.remove(); done(); }, 380);
  }
  function chipRow(items, cls) {
    var row = el('div', 'hh-chips ' + (cls || ''));
    items.forEach(function (it) {
      row.appendChild(button('hh-chip ' + (it.cls || ''), (it.icon ? icon(it.icon) : '') + '<span></span>', it.go)).lastChild.textContent = it.label;
    });
    return row;
  }
  function questionList(list) {
    var box = el('div', 'hh-qlist');
    list.forEach(function (f) {
      var b = button('hh-q', '<span></span>' + icon('next'), function () { showAnswer(f.id); });
      b.firstChild.textContent = L(f.q);
      box.appendChild(b);
    });
    return box;
  }
  function navRow(topicId) {
    var items = [];
    var tp = topicId && topic(topicId);
    if (tp) items.push({ label: L(tp.title), icon: 'back', cls: 'hh-nav', go: function () { openTopic(tp.id); } });
    items.push({ label: t('home'), icon: 'home', cls: 'hh-nav', go: showHome });
    return chipRow(items, 'hh-navrow');
  }
  function topicGrid() {
    var grid = el('div', 'hh-topics');
    kb.topics.forEach(function (tp, i) {
      var b = button('hh-topic', icon(tp.icon) + '<span></span>', function () { openTopic(tp.id); });
      b.lastChild.textContent = L(tp.title);
      b.style.setProperty('--d', (i * 50) + 'ms');
      grid.appendChild(b);
    });
    return grid;
  }

  /* ---------- Screens ---------- */
  function showHome(first) {
    if (!first) userSay(t('home'));
    var m = botSay();
    m.classList.add('hh-home');
    m.appendChild(el('p', 'hh-lead', t('welcome')));
    m.appendChild(el('p', 'hh-sub', t('pick')));
    m.appendChild(topicGrid());
    var pop = (kb.popular || []).map(faq).filter(Boolean);
    if (pop.length) {
      m.appendChild(el('h4', 'hh-h', t('popular')));
      m.appendChild(questionList(pop));
    }
    scroll(first ? null : m);
  }

  function openTopic(id, silent) {
    var tp = topic(id);
    if (!tp) return showHome();
    if (!silent) userSay(L(tp.title));
    if (tp.special === 'laws') return openLaws();
    typing(function () {
      var m = botSay();
      var list = kb.faqs.filter(function (f) { return f.topic === id; });
      if (list.length) {
        m.appendChild(el('p', null, L(tp.intro)));
        m.appendChild(questionList(list));
      } else {
        m.appendChild(el('p', null, L(tp.empty) || t('notfound')));
        var lawsTp = topic('laws');
        m.appendChild(chipRow([
          lawsTp ? { label: L(lawsTp.title), icon: 'law', go: function () { openTopic('laws'); } } : null,
          { label: L((faq('contact') || {}).q) || 'Contact', icon: 'info', go: function () { showAnswer('contact'); } }
        ].filter(Boolean)));
      }
      m.appendChild(navRow());
      scroll(m);
    });
  }

  function showAnswer(id, silent, lawHits) {
    var f = faq(id);
    if (!f) return;
    if (!silent) userSay(L(f.q));
    typing(function () {
      var m = botSay();
      var card = el('div', 'hh-card');
      var a = f.answer[lang] || f.answer.sw;
      if (silent) card.appendChild(el('h4', 'hh-card-q', L(f.q)));
      if (a.text) card.appendChild(el('p', null, a.text));
      if (a.steps && a.steps.length) {
        card.appendChild(el('h5', 'hh-h', t('steps')));
        var ol = el('ol', 'hh-steps');
        a.steps.forEach(function (s) { ol.appendChild(el('li', null, s)); });
        card.appendChild(ol);
      }
      if (a.list && a.list.length) {
        var ul = el('ul', 'hh-list');
        a.list.forEach(function (s) { ul.appendChild(el('li', null, s)); });
        card.appendChild(ul);
      }
      if (a.note) {
        var note = el('p', 'hh-note');
        note.innerHTML = icon('info') + '<span></span>';
        note.lastChild.textContent = a.note;
        card.appendChild(note);
      }
      if (f.images && f.images.length) card.appendChild(gallery(f.images));
      if (f.links && f.links.length) {
        var lk = el('div', 'hh-links');
        f.links.forEach(function (l) {
          var aTag = el('a', 'hh-link');
          aTag.href = l.url;
          aTag.target = '_blank';
          aTag.rel = 'noopener';
          aTag.innerHTML = icon('link') + '<span></span>';
          aTag.lastChild.textContent = L(l.label);
          lk.appendChild(aTag);
        });
        card.appendChild(lk);
      }
      if (f.source) {
        var src = el('div', 'hh-source');
        var pages = (f.source.pages || []).join(', ');
        src.innerHTML = icon('doc') + '<span></span>';
        src.lastChild.textContent = t('source') + ': ' + f.source.document.replace(/\.pdf$/i, '').replace(/\s+/g, ' ') + (pages ? ' · ' + t('page') + ' ' + pages : '');
        card.appendChild(src);
      }
      card.appendChild(feedback(f.id));
      m.appendChild(card);

      var rel = (f.related || []).map(faq).filter(Boolean);
      if (rel.length) {
        m.appendChild(el('h4', 'hh-h', t('related')));
        m.appendChild(questionList(rel));
      }
      if (lawHits && lawHits.length) m.appendChild(sectionLinks(t('fromLaw'), lawHits));
      m.appendChild(navRow(f.topic !== 'general' ? f.topic : null));
      scroll(m);
    });
  }

  function feedback(id) {
    var row = el('div', 'hh-feedback');
    row.appendChild(el('span', null, t('helpful')));
    function vote(v) {
      return function () {
        try {
          var log = JSON.parse(localStorage.getItem('hh-feedback') || '[]');
          log.push({ id: id, v: v, at: new Date().toISOString() });
          localStorage.setItem('hh-feedback', JSON.stringify(log.slice(-200)));
        } catch (e) { /* hifadhi haipatikani */ }
        row.innerHTML = '';
        row.appendChild(el('span', 'hh-thanks', v > 0 ? t('thanks') : t('sorry')));
      };
    }
    row.appendChild(button('hh-vote', icon('up'), vote(1), '+1'));
    row.appendChild(button('hh-vote', icon('down'), vote(-1), '-1'));
    return row;
  }

  function gallery(images) {
    var grid = el('div', 'hh-gallery');
    images.forEach(function (p) {
      var label = L(p.label);
      var b = button('hh-img', '<img alt="" loading="lazy"><span></span>', function () {
        var dlg = el('dialog', 'hh-dialog');
        var close = el('button', null, t('closeImg'));
        close.type = 'button';
        var big = el('img');
        big.src = base + 'assets/' + p.file;
        big.alt = label;
        dlg.append(close, big, el('p', null, label));
        document.body.appendChild(dlg);
        close.onclick = function () { dlg.close(); };
        dlg.onclick = function (e) { if (e.target === dlg) dlg.close(); };
        dlg.addEventListener('close', function () { dlg.remove(); b.focus(); }, { once: true });
        dlg.showModal();
      }, label + ' — ' + t('enlarge'));
      b.querySelector('img').src = base + 'assets/' + p.file;
      b.querySelector('span').textContent = label;
      grid.appendChild(b);
    });
    return grid;
  }

  /* ---------- Laws browser ---------- */
  function openLaws() {
    var m = botSay();
    m.appendChild(el('p', 'hh-sub', t('lawsLoading')));
    loadLaws().then(function () {
      m.innerHTML = '';
      if (!laws.length) {
        m.appendChild(el('p', null, t('lawsEmpty')));
      } else {
        m.appendChild(el('p', null, L(topic('laws').intro)));
        var box = el('div', 'hh-qlist');
        laws.forEach(function (law) {
          var b = button('hh-q', '<span></span><small></small>' + icon('next'), function () { openLaw(law); });
          b.firstChild.textContent = law.title;
          b.children[1].textContent = law.sections.length + ' ' + (lang === 'sw' ? 'vifungu' : 'sections');
          box.appendChild(b);
        });
        m.appendChild(box);
      }
      m.appendChild(navRow());
      scroll(m);
    });
  }

  function openLaw(law) {
    userSay(law.title);
    var m = botSay();
    m.appendChild(el('p', null, t('sections')));
    var filter = el('input', 'hh-filter');
    filter.type = 'search';
    filter.placeholder = t('filter');
    m.appendChild(filter);
    var box = el('div', 'hh-qlist hh-sections');
    m.appendChild(box);
    var shown = 0, current = law.sections, PAGE = 12;
    var moreBtn = button('hh-chip hh-more', '<span></span>', function () { render(false); });
    moreBtn.firstChild.textContent = t('more');
    function render(reset) {
      if (reset) { box.innerHTML = ''; shown = 0; }
      current.slice(shown, shown + PAGE).forEach(function (s) {
        var b = button('hh-q', '<span></span>' + icon('next'), function () { showSection(law, s); });
        b.firstChild.textContent = (s.no ? t('section') + ' ' + s.no + ': ' : '') + (s.title || '').slice(0, 90);
        box.appendChild(b);
      });
      shown += PAGE;
      moreBtn.style.display = shown < current.length ? '' : 'none';
    }
    filter.addEventListener('input', function () {
      var q = filter.value.trim();
      if (!q) current = law.sections;
      else {
        var qt = tokens(q), nq = normalize(q);
        current = law.sections.filter(function (s) {
          return String(s.no) === q || normalize(s.title).indexOf(nq) > -1 || overlap(qt, s._tok) >= 0.5;
        });
      }
      render(true);
    });
    m.appendChild(moreBtn);
    render(true);
    m.appendChild(navRow('laws'));
    scroll(m);
  }

  function showSection(law, s) {
    userSay((s.no ? t('section') + ' ' + s.no + ' — ' : '') + law.title);
    typing(function () {
      var m = botSay();
      var card = el('div', 'hh-card hh-law');
      card.appendChild(el('h4', 'hh-card-q', (s.no ? t('section') + ' ' + s.no + '. ' : '') + (s.title || '')));
      var body = el('div', 'hh-law-text');
      var text = s.text || '';
      var LIMIT = 1100;
      body.textContent = text.length > LIMIT ? text.slice(0, LIMIT) + '…' : text;
      card.appendChild(body);
      if (text.length > LIMIT) {
        var more = button('hh-chip hh-more', '<span></span>', function () { body.textContent = text; more.remove(); });
        more.firstChild.textContent = t('readMore');
        card.appendChild(more);
      }
      var src = el('div', 'hh-source');
      src.innerHTML = icon('doc') + '<span></span>';
      src.lastChild.textContent = t('source') + ': ' + law.title + (s.page ? ' · ' + t('page') + ' ' + s.page : '');
      card.appendChild(src);
      m.appendChild(card);
      m.appendChild(chipRow([
        { label: law.title, icon: 'back', cls: 'hh-nav', go: function () { openLaw(law); } },
        { label: t('home'), icon: 'home', cls: 'hh-nav', go: showHome }
      ], 'hh-navrow'));
      scroll(m);
    });
  }

  /* ---------- Jibu kutoka kwenye nyaraka ---------- */
  function sectionLinks(heading, hits) {
    var wrap = el('div');
    wrap.appendChild(el('h4', 'hh-h', heading));
    var box = el('div', 'hh-qlist');
    hits.forEach(function (h) {
      var b = button('hh-q', '<span></span><small></small>' + icon('next'), function () { showSection(h.d.law, h.d.s); });
      b.firstChild.textContent = (h.d.s.no ? t('section') + ' ' + h.d.s.no + ': ' : '') + (h.d.s.title || '').slice(0, 80);
      b.children[1].textContent = h.d.law.title;
      box.appendChild(b);
    });
    wrap.appendChild(box);
    return wrap;
  }
  function showDocsAnswer(ans, faqRes) {
    var m = botSay(), card = el('div', 'hh-card hh-docs');
    var d = ans.top.d;
    var lead = el('div', 'hh-docs-lead');
    lead.innerHTML = icon('law') + '<span></span>';
    lead.lastChild.textContent = t('docsLead') + ' ' + lawRef(d.law, d.s) + ':';
    card.appendChild(lead);
    var quote = el('blockquote', 'hh-quote');
    ans.picks.forEach(function (p) {
      var para = el('p');
      highlight(p.text, ans.groups, para);
      quote.appendChild(para);
    });
    card.appendChild(quote);
    if (ans.second) {
      var d2 = ans.second.d, lead2 = el('div', 'hh-docs-lead');
      lead2.innerHTML = icon('law') + '<span></span>';
      lead2.lastChild.textContent = lawRef(d2.law, d2.s) + ':';
      card.appendChild(lead2);
      var q2 = el('blockquote', 'hh-quote');
      tableLines(d2.text).forEach(function (p) { var para = el('p'); highlight(p.text, ans.groups, para); q2.appendChild(para); });
      card.appendChild(q2);
    }
    card.appendChild(chipRow([{ label: t('readSection'), icon: 'doc', go: function () { showSection(d.law, d.s); } }]));
    var src = el('div', 'hh-source');
    src.innerHTML = icon('doc') + '<span></span>';
    src.lastChild.textContent = t('source') + ': ' + (d.law.file || d.law.title) + (d.s.page ? ' · ' + t('page') + ' ' + d.s.page : '');
    card.appendChild(src);
    var note = el('p', 'hh-note');
    note.innerHTML = icon('info') + '<span></span>';
    note.lastChild.textContent = t('docsNote');
    card.appendChild(note);
    card.appendChild(feedback('docs:' + d.law.id + '#' + (d.s.no || d.s.title)));
    m.appendChild(card);
    if (ans.others.length) m.appendChild(sectionLinks(t('otherSections'), ans.others));
    if (faqRes && faqRes.length) {
      m.appendChild(el('h4', 'hh-h', t('related')));
      m.appendChild(questionList(faqRes.slice(0, 3).map(function (r) { return r.f; })));
    }
    m.appendChild(navRow());
    scroll(m);
  }

  /* ---------- Free text ---------- */
  function ask(text) {
    text = (text || '').trim();
    if (!text) return;
    input.value = '';
    userSay(text);
    if (/^(habari|hujambo|mambo|salama|shikamoo|hello|hi|hey|good (morning|afternoon|evening))\b[\s\w!.,]{0,20}$/i.test(text) && searchFaqs(text).length === 0) {
      return typing(function () {
        var m = botSay();
        m.appendChild(el('p', null, t('greet')));
        m.appendChild(topicGrid());
        scroll(m);
      });
    }
    Promise.all([kbPromise, loadLaws()]).then(function () {
      var res = searchFaqs(text);
      var lawHits = searchLaws(text);
      var top = res[0], second = res[1];
      var ans = docsAnswer(text);
      var faqOk = top && top.score >= 0.62 && (!second || top.score - second.score >= 0.12);
      // FAQ iliyohakikiwa hushinda, isipokuwa nyaraka zinagusa swali lote na FAQ si ya uhakika mkubwa.
      if (faqOk && !(ans && ans.top.coverage >= 0.99 && faqCoverage(top.f, text) < 0.99)) {
        showAnswer(top.f.id, true, ans ? [ans.top].concat(ans.others).slice(0, 2) : null);
        return;
      }
      if (ans) {
        typing(function () { showDocsAnswer(ans, res); });
        return;
      }
      typing(function () {
        var m = botSay();
        if (res.length) {
          m.appendChild(el('p', null, t('suggest')));
          m.appendChild(questionList(res.slice(0, 4).map(function (r) { return r.f; })));
        }
        if (lawHits.length) {
          m.appendChild(el('h4', 'hh-h', t('fromLaw')));
          var box = el('div', 'hh-qlist');
          lawHits.forEach(function (h) {
            var b = button('hh-q', '<span></span><small></small>' + icon('next'), function () { showSection(h.law, h.s); });
            b.firstChild.textContent = (h.s.no ? t('section') + ' ' + h.s.no + ': ' : '') + (h.s.title || '').slice(0, 80);
            b.children[1].textContent = h.law.title;
            box.appendChild(b);
          });
          m.appendChild(box);
        }
        var tp = !res.length && topicFor(text);
        if (tp) { m.remove(); openTopic(tp.id, true); return; }
        if (!res.length && !lawHits.length) {
          m.appendChild(el('p', null, t('notfound')));
          m.appendChild(topicGrid());
        } else {
          m.appendChild(navRow());
        }
        scroll(m);
      });
    });
  }

  /* ---------- Wiring ---------- */
  var started = false;
  function toggle(show) {
    panel.hidden = !show;
    launcher.hidden = show;
    document.documentElement.classList.toggle('hh-open', show);
    if (show && !started) {
      started = true;
      kbPromise.then(function () {
        showHome(true);
        chat.appendChild(el('p', 'hh-disclaimer', t('disclaimer')));
        loadLaws();
      });
    }
    if (show) setTimeout(function () { input.focus({ preventScroll: true }); }, 60);
    else launcher.focus();
  }
  launcher.addEventListener('click', function () { toggle(true); });
  panel.querySelector('[data-close]').addEventListener('click', function () { toggle(false); });
  panel.querySelector('[data-home]').addEventListener('click', function () { kbPromise.then(function () { showHome(); }); });
  panel.querySelector('[data-lang]').addEventListener('click', function () {
    lang = lang === 'sw' ? 'en' : 'sw';
    applyText();
    kbPromise.then(function () { showHome(); });
  });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    kbPromise.then(function () { ask(v); });
  });

  applyText();
  if (cfg.open === 'true') toggle(true);

  // API ndogo kwa ajili ya ukurasa mwenyeji (mf. kitufe kwenye blog).
  window.HamaHama = {
    open: function () { toggle(true); },
    close: function () { toggle(false); },
    ask: function (q) { toggle(true); kbPromise.then(function () { ask(q); }); },
    show: function (id) { toggle(true); kbPromise.then(function () { showAnswer(id); }); },
    version: VERSION
  };
}
})();
