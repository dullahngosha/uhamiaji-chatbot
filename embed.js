/*!
 * Mr. HamaHama v3 — msaidizi wa Uhamiaji Tanzania: mafungu -> vikundi -> maswali -> majibu.
 * Majibu yote yako kwenye data/knowledge.json, yameandaliwa kutoka kwenye sheria, miongozo
 * na tovuti rasmi ya Idara ya Uhamiaji. Maswali ya kuandika hutafutwa kwa Kiswahili na Kiingereza.
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
  var VERSION = '3.0.0';

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
    pass: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><circle cx="12" cy="11" r="2.5"/><path d="M8.5 16.5a4 4 0 0 1 7 0"/>',
    up: '<path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7V10l4-8a2.9 2.9 0 0 1 4 3.9z"/>',
    down: '<path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.6 3H17v11l-4 8a2.9 2.9 0 0 1-4-3.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.info) + '</svg>';
  }

  /* ---------- UI text ---------- */
  var T = {
    sw: {
      subtitle: 'Msaidizi wako wa Uhamiaji', online: 'Mtandaoni',
      welcome: 'Karibu! Mimi ni Mr. HamaHama, msaidizi wa kidijitali wa Idara ya Uhamiaji Tanzania.',
      pick: 'Chagua huduma unayohitaji kuona maswali na majibu yake, au andika swali lako hapa chini.',
      popular: 'Maswali yanayoulizwa zaidi', topics: 'Mafungu ya huduma', placeholder: 'Andika swali lako...',
      home: 'Menyu kuu', back: 'Rudi', steps: 'Hatua', answer: 'Jibu',
      related: 'Maswali mengine yanayohusiana', helpful: 'Je, jibu hili limekusaidia?',
      thanks: 'Asante kwa maoni yako!', sorry: 'Samahani. Kwa msaada zaidi wasiliana na info@immigration.go.tz.',
      suggest: 'Nimepata maswali haya yanayokaribiana na swali lako. Chagua moja:',
      notfound: 'Sijapata jibu la swali hilo. Chagua fungu la huduma hapa chini, au wasiliana na info@immigration.go.tz.',
      greet: 'Karibu sana! Nikusaidie kuhusu huduma gani?', typing: 'Mr. HamaHama anaandika',
      disclaimer: 'Maelezo haya yameandaliwa kutoka kwenye sheria na miongozo ya Idara ya Uhamiaji. Kwa kesi yako binafsi, thibitisha na ofisi ya Uhamiaji.',
      enlarge: 'Kuza picha', closeImg: 'Funga',
      langBtn: 'EN', langLabel: 'Switch to English', close: 'Funga', open: 'Fungua Mr. HamaHama'
    },
    en: {
      subtitle: 'Your Immigration Assistant', online: 'Online',
      welcome: 'Welcome! I am Mr. HamaHama, the digital assistant of the Tanzania Immigration Department.',
      pick: 'Choose a service to see its questions and answers, or type your question below.',
      popular: 'Most asked questions', topics: 'Service topics', placeholder: 'Type your question...',
      home: 'Main menu', back: 'Back', steps: 'Steps', answer: 'Answer',
      related: 'Related questions', helpful: 'Was this answer helpful?',
      thanks: 'Thank you for your feedback!', sorry: 'Sorry about that. For more help contact info@immigration.go.tz.',
      suggest: 'I found these questions close to yours. Choose one:',
      notfound: 'I could not find an answer to that. Choose a service below, or contact info@immigration.go.tz.',
      greet: 'You are welcome! Which service can I help you with?', typing: 'Mr. HamaHama is typing',
      disclaimer: 'These explanations are based on the laws and guidelines of the Immigration Department. For your personal case, confirm with an Immigration office.',
      enlarge: 'Enlarge image', closeImg: 'Close',
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
    '<div class="hh-head">' +
      '<div class="hh-avatar"><img src="' + avatar + '" alt=""></div>' +
      '<div class="hh-title"><strong>Mr. HamaHama</strong><span data-t="subtitle"></span>' +
      '<span class="hh-status"><i></i><b data-t="online"></b></span></div>' +
      '<button type="button" class="hh-lang" data-lang></button>' +
      '<button type="button" class="hh-icon" data-home>' + icon('home') + '</button>' +
      '<button type="button" class="hh-icon" data-close>' + icon('close') + '</button>' +
    '</div>' +
    '<div class="hh-chat" role="region" aria-live="polite"></div>' +
    '<div class="hh-compose">' +
      '<form class="hh-box"><input type="text" autocomplete="off" maxlength="200"><button type="submit" class="hh-send">' + icon('send') + '</button></form>' +
      '<div class="hh-powered">Powered by <b>Ngosha Multimedia</b> · NgoshaChatBot</div>' +
    '</div>';
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
  var kb = null;
  var kbPromise = fetch(KB_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { kb = d; indexFaqs(); return d; })
    .catch(function () { kb = { topics: [], faqs: [], popular: [] }; return kb; });

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
  function answerText(f) {
    return ['sw', 'en'].map(function (l) {
      var a = f.answer[l] || {};
      return [a.text || '', (a.steps || []).join(' '), (a.list || []).join(' '), a.note || ''].join(' ');
    }).join(' ');
  }
  function indexFaqs() {
    kb.faqs.forEach(function (f) {
      var parts = [f.q.sw, f.q.en].concat(f.aliases || []);
      f._docs = parts.map(tokens);
      f._q = setOf(dtokens(parts.join(' ') + ' ' + L2(f.group)));
      f._a = setOf(dtokens(answerText(f)));
    });
  }
  function setOf(arr) { var s = {}; arr.forEach(function (x) { s[x] = 1; }); return s; }
  function L2(o) { return o ? (o.sw || '') + ' ' + (o.en || '') : ''; }
  // Sehemu ya "makundi ya maneno" ya swali yanayopatikana kwenye seti fulani ya maneno.
  function coverage(groups, set) {
    if (!groups.length) return 0;
    return groups.filter(function (g) { return Object.keys(g).some(function (t) { return set[t]; }); }).length / groups.length;
  }
  function searchFaqs(q) {
    var qt = tokens(q), groups = queryGroups(q);
    if (!Object.keys(qt).length && !groups.length) return [];
    return kb.faqs.map(function (f) {
      var best = 0, nq = normalize(q);
      // alama ya maana: maneno ya swali (na visawe) yako kwenye swali la FAQ, au angalau kwenye jibu lake
      var cq = coverage(groups, f._q), ca = coverage(groups, f._a);
      best = Math.max(best, 0.72 * cq + 0.23 * Math.max(cq, ca));
      f._docs.forEach(function (d) { best = Math.max(best, overlap(qt, d) * 0.6 + overlap(d, qt) * 0.4); });
      // Jina mbadala likipatikana lote ndani ya swali, hilo ndilo jibu (refu zaidi hushinda).
      // jina mbadala likipatikana lote ndani ya swali ni ishara kubwa, lakini swali lote bado lizingatiwe
      var aliasHit = 0;
      (f.aliases || []).forEach(function (a) {
        var na = normalize(a).trim();
        if (na.length > 3 && (' ' + nq + ' ').indexOf(' ' + na + ' ') > -1) aliasHit = Math.max(aliasHit, na.length);
      });
      if (aliasHit) best = Math.max(best, 0.72 * cq + 0.23 * Math.max(cq, ca) + 0.25 + aliasHit / 400);
      return { f: f, score: best };
    }).filter(function (r) { return r.score >= 0.3; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  var TOPIC_CONCEPT = { passport: '#passport', visa: '#visa', residence: '#permit', citizenship: '#citizen' };
  // maneno yanayoelekeza moja kwa moja kwenye fungu (swali la neno moja)
  var TOPIC_WORDS = { pass: /^(pasi|pass|passes)$/, mjue: /^(mjue jirani( yako)?|wahamiaji haramu|mhamiaji haramu)$/ };
  function topicFor(q) {
    var qt = tokens(q), nq = normalize(q);
    return kb.topics.filter(function (tp) {
      return (TOPIC_CONCEPT[tp.id] && qt[TOPIC_CONCEPT[tp.id]]) || (TOPIC_WORDS[tp.id] && TOPIC_WORDS[tp.id].test(nq));
    })[0];
  }
  /* ---------- Visawe vya Kiswahili <-> Kiingereza na mizizi ya maneno ---------- */
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
    'kuongeza kurefusha refusha extension extend renew renewal', 'muda kipindi dumu kinadumu inadumu period duration validity valid',
    'pacha dual', 'kukamatwa kamata kamatwa arrest detain detention', 'msafiri wasafiri traveller traveler passenger',
    'meli ship vessel', 'ndege aircraft', 'mwajiri employer', 'mwanafunzi wanafunzi student', 'kujitolea volunteer',
    'mstaafu wastaafu retiree retired', 'mmisionari missionary', 'mtafiti researcher research', 'siku days', 'nchi country countries', 'hitaji require required requirement requirements', 'ruhusiwa ruhusa allowed permitted', 'chukua processing processed process', 'dharura emergency', 'mwanafunzi wanafunzi student students', 'mwaka miaka year years',
    'mahakama court', 'pasi pass passes', 'jirani neighbour neighbor', 'haramu illegal unlawful', 'taarifa report ripoti', 'mtegemezi wategemezi dependant dependent', 'mstaafu retire', 'kuwekeza mwekezaji', 'mwanafunzi student', 'hati document documents nyaraka vielelezo', 'kughushi ghushi forge forgery forged false', 'kusafirisha smuggle smuggling trafficking'
  ].map(function (g) { return g.split(' '); });
  var SYNMAP = {};
  SYN.forEach(function (g) {
    var toks = [];
    g.forEach(function (w) { (normalize(w).match(/[a-z0-9]+/g) || []).forEach(function (t) { toks.push(stem(t)); }); });
    toks.forEach(function (t) { SYNMAP[t] = (SYNMAP[t] || []).concat(toks); });
  });
  var DSTOP = {};
  (STOP.join(' ') + ' bila wapi nitoe kiasi kupata pata nifanye nifanyeje fanye ngapi gani nchini tanzania mimi wewe yeye sisi changu chako chake zangu zako yake wake yetu nini sasa pia tu kweli ili shall such under may it its from who whom whose person act section any be by as at this that these those there where when been being has have had not no all other than into upon within without per said subsection paragraph regulations regulation made provided unless').split(' ').forEach(function (w) { if (w) DSTOP[w] = 1; });

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

  /* ---------- Vipengele vya UI ---------- */
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

  /* ---------- Skrini: kila fungu/jibu lina ukurasa wake ---------- */
  var current = { view: 'home', topic: null };
  function newScreen(view, topicId) {
    current = { view: view, topic: topicId || null };
    chat.innerHTML = '';
    var sc = el('div', 'hh-screen hh-screen-' + view);
    chat.appendChild(sc);
    chat.scrollTop = 0;
    return sc;
  }
  // Vitufe vya mafungu (tabs) juu ya kila ukurasa wa fungu/jibu
  function topicTabs(activeId) {
    var bar = el('div', 'hh-tabs');
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', t('topics'));
    kb.topics.forEach(function (tp) {
      var b = button('hh-tab' + (tp.id === activeId ? ' is-active' : ''), icon(tp.icon) + '<span></span>', function () { openTopic(tp.id); });
      b.lastChild.textContent = L(tp.title);
      if (tp.id === activeId) b.setAttribute('aria-current', 'page');
      bar.appendChild(b);
    });
    requestAnimationFrame(function () {
      var act = bar.querySelector('.is-active');
      if (act) bar.scrollLeft = Math.max(0, act.offsetLeft - bar.offsetLeft - 16);
    });
    return bar;
  }
  function crumbs(topicId) {
    var row = el('div', 'hh-crumbs');
    var home = button('hh-crumb', icon('home') + '<span></span>', showHome);
    home.lastChild.textContent = t('home');
    row.appendChild(home);
    var tp = topicId && topic(topicId);
    if (tp) {
      row.appendChild(el('span', 'hh-crumb-sep', '›'));
      var tb = button('hh-crumb', '<span></span>', function () { openTopic(tp.id); });
      tb.firstChild.textContent = L(tp.title);
      row.appendChild(tb);
    }
    return row;
  }
  function stagger(container) {
    container.querySelectorAll('.hh-q, .hh-topic, .hh-steps li, .hh-list li').forEach(function (n, i) {
      n.style.setProperty('--i', Math.min(i, 14));
    });
  }

  function showHome() {
    var sc = newScreen('home');
    var hero = el('div', 'hh-hero');
    hero.appendChild(el('p', 'hh-lead', t('welcome')));
    hero.appendChild(el('p', 'hh-sub', t('pick')));
    sc.appendChild(hero);
    // ukurasa wa kwanza: blocks za huduma tu; maswali hufunguka ndani ya block inayobofywa
    sc.appendChild(topicGrid());
    sc.appendChild(el('p', 'hh-disclaimer', t('disclaimer')));
    stagger(sc);
  }

  function openTopic(id) {
    var tp = topic(id);
    if (!tp) return showHome();
    var sc = newScreen('topic', id);
    sc.appendChild(topicTabs(id));
    var banner = el('div', 'hh-banner');
    banner.innerHTML = '<span class="hh-banner-icon">' + icon(tp.icon) + '</span><div><strong></strong><small></small></div>';
    banner.querySelector('strong').textContent = L(tp.title);
    var list = kb.faqs.filter(function (f) { return f.topic === id; });
    banner.querySelector('small').textContent = L(tp.intro) + ' · ' + (lang === 'sw' ? 'maswali ' + list.length : list.length + ' questions');
    sc.appendChild(banner);
    // panga maswali kwa vikundi vidogo kwa mpangilio wa data
    var groups = [], byKey = {};
    list.forEach(function (f) {
      var key = L(f.group) || '';
      if (!byKey[key]) { byKey[key] = []; groups.push(key); }
      byKey[key].push(f);
    });
    groups.forEach(function (key) {
      if (key) sc.appendChild(el('h4', 'hh-h hh-group', key));
      sc.appendChild(questionList(byKey[key]));
    });
    if (!groups.length) sc.appendChild(el('p', null, t('notfound')));
    sc.appendChild(crumbs());
    stagger(sc);
  }

  function renderAnswer(f, sc) {
    var box = el('div', 'hh-card');
    var a = f.answer[lang] || f.answer.sw;
    // kichwa cha jibu: alama ya "JIBU" + swali lenyewe, kisha mwili wa jibu wenye rangi yake
    var head = el('div', 'hh-card-head');
    head.innerHTML = '<span class="hh-card-badge">' + icon('check') + '<b></b></span>';
    head.querySelector('b').textContent = t('answer');
    head.appendChild(el('h3', 'hh-card-q', L(f.q)));
    box.appendChild(head);
    var card = el('div', 'hh-card-body');
    box.appendChild(card);
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
    card.appendChild(feedback(f.id));
    sc.appendChild(box);
    var rel = (f.related || []).map(faq).filter(Boolean);
    // ongeza maswali mengine ya kikundi hichohicho ili mtu aendelee kusoma bila kurudi nyuma
    kb.faqs.forEach(function (x) {
      if (rel.length < 5 && x.id !== f.id && x.topic === f.topic && L(x.group) === L(f.group) && rel.indexOf(x) < 0) rel.push(x);
    });
    if (rel.length) {
      sc.appendChild(el('h4', 'hh-h hh-group', t('related')));
      sc.appendChild(questionList(rel));
    }
    sc.appendChild(crumbs(f.topic));
    stagger(sc);
  }

  function showAnswer(id, asked) {
    var f = faq(id);
    if (!f) return;
    var sc = newScreen('answer', f.topic);
    sc.appendChild(topicTabs(f.topic));
    if (asked) sc.appendChild(el('div', 'hh-msg hh-user', asked));
    renderAnswer(f, sc);
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

  /* ---------- Swali la kuandika ---------- */
  function ask(text) {
    text = (text || '').trim();
    if (!text) return;
    input.value = '';
    var res = searchFaqs(text);
    var top = res[0], second = res[1];
    if (/^(habari|hujambo|mambo|salama|shikamoo|hello|hi|hey|good (morning|afternoon|evening))\b[\s\w!.,]{0,20}$/i.test(text) && !res.length) {
      var hs = newScreen('home');
      hs.appendChild(el('div', 'hh-msg hh-user', text));
      var g = el('div', 'hh-msg hh-bot');
      g.appendChild(el('p', 'hh-lead', t('greet')));
      g.appendChild(topicGrid());
      hs.appendChild(g);
      stagger(hs);
      return;
    }
    // jibu moja kwa moja likiwa na uhakika; vinginevyo mapendekezo ya maswali yanayokaribiana
    if (top && top.score >= 0.62 && (!second || top.score - second.score >= 0.1 || top.score >= 1)) {
      showAnswer(top.f.id, text);
      return;
    }
    var tp = topicFor(text);
    if (tp && (!top || top.score < 0.5) && queryGroups(text).length <= 1) { openTopic(tp.id); return; }
    var sc = newScreen('search', tp ? tp.id : null);
    sc.appendChild(el('div', 'hh-msg hh-user', text));
    var m = el('div', 'hh-msg hh-bot');
    sc.appendChild(m);
    if (res.length) {
      m.appendChild(el('p', null, t('suggest')));
      m.appendChild(questionList(res.slice(0, 6).map(function (r) { return r.f; })));
    } else {
      m.appendChild(el('p', null, t('notfound')));
      m.appendChild(topicGrid());
    }
    sc.appendChild(crumbs());
    stagger(sc);
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
        showHome();
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
    kbPromise.then(function () {
      // baki kwenye ukurasa uleule baada ya kubadili lugha
      if (current.view === 'topic') openTopic(current.topic);
      else showHome();
    });
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
    topic: function (id) { toggle(true); kbPromise.then(function () { openTopic(id); }); },
    version: VERSION
  };
}
})();