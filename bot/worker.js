/*!
 * Mr. HamaHama — bot ya Facebook Messenger na Instagram (Cloudflare Worker)
 *
 * Inajibu ujumbe wa Messenger na Instagram DM moja kwa moja kwa kutumia
 * maswali na majibu yale yale ya widget (data/knowledge.json) na injini ile
 * ile ya utafutaji. Hakuna AI wala API ya nje isipokuwa Graph API ya Meta.
 *
 * USIHARIRI faili hili (bot/worker.js) moja kwa moja: hariri faili hili kisha endesha
 *   python3 tools/build_bot.py
 * ili injini ya utafutaji inakiliwe kutoka embed.js.
 *
 * Mipangilio (Cloudflare → Worker → Settings → Variables and Secrets):
 *   VERIFY_TOKEN       neno la siri unalobuni, linawekwa pia kwenye Meta (Webhook)
 *   PAGE_ACCESS_TOKEN  token ya ukurasa wa Facebook (Messenger, na Instagram iliyounganishwa na ukurasa)
 *   APP_SECRET         App Secret ya Meta app (kuhakiki kwamba ujumbe unatoka Meta kweli)
 *   IG_ACCESS_TOKEN    (hiari) token ya "Instagram API with Instagram Login"
 *   IG_APP_SECRET      (hiari) App Secret ya Instagram app hiyo
 *   SETUP_KEY          (hiari) neno la siri la kuwasha kitufe cha "Anza" na menyu: /setup?key=...
 *   KB_URL             (hiari) chaguo-msingi: https://dullahngosha.github.io/uhamiaji-chatbot/data/knowledge.json
 *   GRAPH_VERSION      (hiari) chaguo-msingi: v23.0
 *   STATE              (hiari) KV namespace — inakumbuka lugha na orodha ya mwisho ili mtu aweze kuandika "3"
 */

var KB_DEFAULT = 'https://dullahngosha.github.io/uhamiaji-chatbot/data/knowledge.json';

var T = {
  sw: {
    welcome: 'Karibu! Mimi ni Mr. HamaHama, msaidizi wa kidijitali wa Idara ya Uhamiaji Tanzania. 🇹🇿',
    pick: 'Chagua huduma unayohitaji hapa chini, au andika swali lako moja kwa moja.',
    topicHead: 'Chagua namba ya swali:',
    more: 'Zaidi ▶', home: '🏠 Menyu', langBtn: '🇬🇧 English',
    steps: 'Hatua:', related: 'Maswali yanayohusiana:',
    suggest: 'Nimepata maswali haya yanayokaribiana na swali lako. Chagua namba:',
    notfound: 'Samahani, sijapata jibu la swali hilo. Chagua huduma hapa chini, au wasiliana na info@immigration.go.tz.',
    media: 'Nimepokea ujumbe wako. Kwa sasa ninajibu maandishi tu — chagua huduma au andika swali lako.',
    disclaimer: 'ℹ️ Kwa kesi yako binafsi, thibitisha na ofisi ya Uhamiaji.',
    page: 'Ukurasa'
  },
  en: {
    welcome: 'Welcome! I am Mr. HamaHama, the digital assistant of the Tanzania Immigration Department. 🇹🇿',
    pick: 'Choose a service below, or type your question directly.',
    topicHead: 'Choose a question number:',
    more: 'More ▶', home: '🏠 Menu', langBtn: '🇹🇿 Kiswahili',
    steps: 'Steps:', related: 'Related questions:',
    suggest: 'I found these questions close to yours. Choose a number:',
    notfound: 'Sorry, I could not find an answer to that. Choose a service below, or contact info@immigration.go.tz.',
    media: 'I received your message. For now I only answer text — choose a service or type your question.',
    disclaimer: 'ℹ️ For your personal case, confirm with an Immigration office.',
    page: 'Page'
  }
};
var PAGE_SIZE = 10;
var TOPIC_EMOJI = { passport: '📘', visa: '🛂', residence: '🏠', pass: '🎫', citizenship: '🇹🇿', mjue: '🛡️', general: 'ℹ️' };

/* ---------- Data ---------- */
var kb = null, kbAt = 0;
async function loadKb(env) {
  if (kb && Date.now() - kbAt < 10 * 60 * 1000) return kb;
  var r = await fetch(env.KB_URL || KB_DEFAULT, { cf: { cacheTtl: 600 } });
  if (!r.ok) { if (kb) return kb; throw new Error('knowledge.json ' + r.status); }
  kb = await r.json();
  kbAt = Date.now();
  indexFaqs();
  return kb;
}
function faq(id) { return kb.faqs.filter(function (f) { return f.id === id; })[0]; }
function topic(id) { return kb.topics.filter(function (x) { return x.id === id; })[0]; }
function Lg(obj, lang) { return obj ? (obj[lang] || obj.sw || obj.en || '') : ''; }

/* Imenakiliwa kutoka embed.js na tools/build_bot.py — usihariri hapa */
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

/* ---------- Lugha ---------- */
var EN_WORDS = /\b(the|how|what|where|when|which|who|can|do|does|is|are|my|i|you|to|for|of|get|need|want|apply|much|long|lost|fee|fees|renew|please|hello|hi)\b/g;
var SW_WORDS = /\b(na|ya|wa|za|kwa|ni|je|nini|gani|vipi|jinsi|naweza|nataka|naomba|nahitaji|ninaombaje|ngapi|wapi|lini|habari|mambo|shikamoo|pasipoti|uraia|kibali|ada|gharama|kupata|kuomba|imepotea|mimi|yangu)\b/g;
function detectLang(text) {
  var n = normalize(text);
  var en = (n.match(EN_WORDS) || []).length, sw = (n.match(SW_WORDS) || []).length;
  return en > sw ? 'en' : sw > en ? 'sw' : null; // null: haijulikani
}

/* ---------- Kujenga majibu ---------- */
function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function qr(title, payload) { return { content_type: 'text', title: clip(title, 20), payload: payload }; }

function menuReplies(lang) {
  var out = kb.topics.map(function (tp) { return qr((TOPIC_EMOJI[tp.id] ? TOPIC_EMOJI[tp.id] + ' ' : '') + Lg(tp.title, lang), 'T|' + lang + '|' + tp.id + '|0'); });
  out.push(qr(T[lang].langBtn, 'M|' + (lang === 'sw' ? 'en' : 'sw')));
  return out.slice(0, 13);
}
function menuMessage(lang, lead) {
  return [{ text: (lead ? lead + '\n\n' : '') + T[lang].welcome + '\n\n' + T[lang].pick, quick_replies: menuReplies(lang) }];
}
// Orodha yenye namba: maandishi + vitufe vya namba (kila kitufe kinabeba jibu lake).
function numbered(lang, head, list, extra) {
  var lines = [head, ''];
  var replies = list.map(function (f, i) {
    lines.push((i + 1) + '. ' + Lg(f.q, lang));
    return qr(String(i + 1), 'Q|' + lang + '|' + f.id);
  });
  return { text: lines.join('\n'), quick_replies: replies.concat(extra || []).slice(0, 13), _list: list.map(function (f) { return f.id; }) };
}
function topicMessage(lang, id, page) {
  var tp = topic(id);
  if (!tp) return menuMessage(lang);
  var all = kb.faqs.filter(function (f) { return f.topic === id; });
  // mpangilio wa vikundi kama kwenye widget
  var order = [], byGroup = {};
  all.forEach(function (f) { var g = Lg(f.group, lang); if (!byGroup[g]) { byGroup[g] = []; order.push(g); } byGroup[g].push(f); });
  var sorted = [];
  order.forEach(function (g) { sorted = sorted.concat(byGroup[g]); });
  var pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  page = Math.min(Math.max(0, page | 0), pages - 1);
  var slice = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  var head = (TOPIC_EMOJI[id] || '') + ' ' + Lg(tp.title, lang).toUpperCase() + (pages > 1 ? ' (' + T[lang].page + ' ' + (page + 1) + '/' + pages + ')' : '') +
    '\n' + Lg(tp.intro, lang) + '\n\n' + T[lang].topicHead;
  var lines = [head], lastGroup = null, replies = [];
  slice.forEach(function (f, i) {
    var g = Lg(f.group, lang);
    if (g !== lastGroup) { lines.push('', '▪️ ' + g); lastGroup = g; }
    lines.push((i + 1) + '. ' + Lg(f.q, lang));
    replies.push(qr(String(i + 1), 'Q|' + lang + '|' + f.id));
  });
  if (page + 1 < pages) replies.push(qr(T[lang].more, 'T|' + lang + '|' + id + '|' + (page + 1)));
  else if (pages > 1) replies.push(qr('◀ ' + T[lang].page + ' 1', 'T|' + lang + '|' + id + '|0'));
  replies.push(qr(T[lang].home, 'M|' + lang));
  return [{ text: lines.join('\n'), quick_replies: replies.slice(0, 13), _list: slice.map(function (f) { return f.id; }) }];
}
function answerMessages(lang, f) {
  var a = f.answer[lang] || f.answer.sw || {};
  var parts = ['✅ ' + Lg(f.q, lang)];
  if (a.text) parts.push(a.text);
  if (a.steps && a.steps.length) parts.push(T[lang].steps + '\n' + a.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
  if (a.list && a.list.length) parts.push(a.list.map(function (s) { return '• ' + s; }).join('\n'));
  if (a.note) parts.push('⚠️ ' + a.note);
  (f.links || []).forEach(function (l) { parts.push('🔗 ' + Lg(l.label, lang) + ': ' + l.url); });
  var msgs = [{ text: parts.join('\n\n') }];
  // maswali yanayohusiana: yaliyotajwa + ya kikundi kimoja (mpaka 5)
  var rel = (f.related || []).map(faq).filter(Boolean);
  kb.faqs.forEach(function (x) {
    if (rel.length < 5 && x.id !== f.id && x.topic === f.topic && Lg(x.group, 'sw') === Lg(f.group, 'sw') && rel.indexOf(x) < 0) rel.push(x);
  });
  rel = rel.slice(0, 5);
  var tp = topic(f.topic);
  var back = tp ? [qr('◀ ' + Lg(tp.title, lang), 'T|' + lang + '|' + tp.id + '|0')] : [];
  var tail = back.concat([qr(T[lang].home, 'M|' + lang)]);
  if (rel.length) {
    var m = numbered(lang, T[lang].related, rel, tail);
    m.text = m.text + '\n\n' + T[lang].disclaimer;
    msgs.push(m);
  } else {
    msgs.push({ text: T[lang].disclaimer, quick_replies: tail });
  }
  return msgs;
}
function greeting(text) {
  return /^(habari|hujambo|mambo|salama|shikamoo|salamu|asalaam\w*|assalam\w*|hello|hi|hey|good (morning|afternoon|evening)|menu|menyu|anza|start|get started|mwanzo)\b[\s\w!.,]{0,20}$/i.test(text.trim());
}
// Swali lililoandikwa: jibu moja kwa moja likiwa na uhakika, la sivyo mapendekezo (kama widget).
function textReply(text, lang, state) {
  var n = normalize(text);
  if (/^\d{1,2}$/.test(n) && state && state.list) {
    var id = state.list[parseInt(n, 10) - 1];
    if (id && faq(id)) return answerMessages(state.lang || lang, faq(id));
  }
  if (/^(english|kiingereza|en)$/.test(n)) return menuMessage('en');
  if (/^(kiswahili|swahili|sw)$/.test(n)) return menuMessage('sw');
  var res = searchFaqs(text);
  var top = res[0], second = res[1];
  if (!res.length && greeting(text)) return menuMessage(lang);
  if (top && top.score >= 0.62 && (!second || top.score - second.score >= 0.1 || top.score >= 1)) return answerMessages(lang, top.f);
  var tp = topicFor(text);
  if (tp && (!top || top.score < 0.5) && queryGroups(text).length <= 1) return topicMessage(lang, tp.id, 0);
  if (res.length) return [numbered(lang, T[lang].suggest, res.slice(0, 6).map(function (r) { return r.f; }), [qr(T[lang].home, 'M|' + lang)])];
  return [{ text: T[lang].notfound, quick_replies: menuReplies(lang) }];
}
function payloadReply(payload) {
  var p = String(payload || '').split('|');
  var lang = p[1] === 'en' ? 'en' : 'sw';
  if (p[0] === 'Q' && faq(p[2])) return answerMessages(lang, faq(p[2]));
  if (p[0] === 'T') return topicMessage(lang, p[2], parseInt(p[3], 10) || 0);
  return menuMessage(lang);
}

/* ---------- Kupokea ujumbe ---------- */
// Hurudisha orodha ya ujumbe wa kutuma kwa tukio moja la "messaging" (au null kama halihitaji jibu).
async function handleEvent(ev, env) {
  var sender = ev.sender && ev.sender.id;
  if (!sender) return null;
  if (ev.message && (ev.message.is_echo || ev.message.is_deleted || ev.message.is_unsupported)) return null;
  var state = await getState(env, sender);
  var payload = (ev.postback && ev.postback.payload) || (ev.message && ev.message.quick_reply && ev.message.quick_reply.payload);
  var msgs, lang;
  if (payload) {
    msgs = payloadReply(payload);
    lang = String(payload).split('|')[1];
  } else if (ev.message && ev.message.text) {
    lang = detectLang(ev.message.text) || (state && state.lang) || 'sw';
    msgs = textReply(ev.message.text, lang, state);
  } else if (ev.message && ev.message.attachments) {
    lang = (state && state.lang) || 'sw';
    msgs = menuMessage(lang, T[lang].media);
  } else {
    return null;
  }
  var withList = msgs.filter(function (m) { return m._list; }).pop();
  await putState(env, sender, { lang: lang === 'en' ? 'en' : 'sw', list: withList ? withList._list : (state && state.list) || null });
  return msgs;
}

async function getState(env, id) {
  if (!env.STATE) return null;
  try { return await env.STATE.get('u:' + id, 'json'); } catch (e) { return null; }
}
async function putState(env, id, value) {
  if (!env.STATE) return;
  try { await env.STATE.put('u:' + id, JSON.stringify(value), { expirationTtl: 60 * 60 * 24 * 7 }); } catch (e) { /* si lazima */ }
}

/* ---------- Kutuma kupitia Graph API ---------- */
function limitFor(platform) { return platform === 'instagram' ? 1000 : 2000; }
// Gawa maandishi marefu kwenye aya bila kuzidi kikomo cha jukwaa.
function splitText(text, max) {
  if (text.length <= max) return [text];
  var out = [], cur = '';
  text.split('\n').forEach(function (line) {
    while (line.length > max) { if (cur) { out.push(cur); cur = ''; } out.push(line.slice(0, max)); line = line.slice(max); }
    var next = cur ? cur + '\n' + line : line;
    if (next.length > max) { out.push(cur); cur = line; } else cur = next;
  });
  if (cur) out.push(cur);
  return out;
}
function endpoint(env, platform) {
  var v = env.GRAPH_VERSION || 'v23.0';
  if (platform === 'instagram' && env.IG_ACCESS_TOKEN) return { url: 'https://graph.instagram.com/' + v + '/me/messages', token: env.IG_ACCESS_TOKEN };
  return { url: 'https://graph.facebook.com/' + v + '/me/messages', token: env.PAGE_ACCESS_TOKEN };
}
async function graphSend(env, platform, body) {
  var ep = endpoint(env, platform);
  var r = await fetch(ep.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ep.token },
    body: JSON.stringify(body)
  });
  if (!r.ok) console.log('Graph API ' + r.status + ': ' + (await r.text()).slice(0, 500));
  return r.ok;
}
async function deliver(env, platform, recipient, msgs) {
  if (platform !== 'instagram') await graphSend(env, platform, { recipient: { id: recipient }, sender_action: 'typing_on' });
  var max = limitFor(platform);
  for (var i = 0; i < msgs.length; i++) {
    var chunks = splitText(msgs[i].text, max);
    for (var j = 0; j < chunks.length; j++) {
      var message = { text: chunks[j] };
      if (j === chunks.length - 1 && msgs[i].quick_replies && msgs[i].quick_replies.length) message.quick_replies = msgs[i].quick_replies;
      await graphSend(env, platform, { recipient: { id: recipient }, messaging_type: 'RESPONSE', message: message });
    }
  }
}

/* ---------- Usalama: saini ya Meta ---------- */
async function hmacHex(secret, body) {
  var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  var sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}
async function validSignature(env, header, body) {
  var secrets = [env.APP_SECRET, env.IG_APP_SECRET].filter(Boolean);
  if (!secrets.length) return true; // haijawekwa: inakubali (weka APP_SECRET kwa usalama)
  var got = String(header || '').replace(/^sha256=/, '');
  for (var i = 0; i < secrets.length; i++) if (got && got === await hmacHex(secrets[i], body)) return true;
  return false;
}

/* ---------- Kitufe cha "Anza", menyu ya kudumu na ice breakers ---------- */
async function setup(env) {
  await loadKb(env);
  var v = env.GRAPH_VERSION || 'v23.0';
  var pop = (kb.popular || []).map(faq).filter(Boolean).slice(0, 4);
  function breakers(lang) { return pop.map(function (f) { return { question: clip(Lg(f.q, lang), 80), payload: 'Q|' + lang + '|' + f.id }; }); }
  var menu = [{ type: 'postback', title: 'Menyu kuu / Main menu', payload: 'M|sw' }].concat(
    kb.topics.slice(0, 4).map(function (tp) { return { type: 'postback', title: clip(Lg(tp.title, 'sw'), 30), payload: 'T|sw|' + tp.id + '|0' }; }));
  var results = {};
  async function post(name, url, token, body) {
    var r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
    results[name] = r.status + ' ' + (await r.text()).slice(0, 300);
  }
  if (env.PAGE_ACCESS_TOKEN) {
    var fb = 'https://graph.facebook.com/' + v + '/me/messenger_profile';
    await post('messenger', fb, env.PAGE_ACCESS_TOKEN, {
      get_started: { payload: 'M|sw' },
      greeting: [
        { locale: 'default', text: 'Karibu Mr. HamaHama! Uliza chochote kuhusu Pasipoti, Visa, Vibali vya Ukaazi na Uraia.' },
        { locale: 'en_US', text: 'Welcome to Mr. HamaHama! Ask anything about Passports, Visas, Residence Permits and Citizenship.' }
      ],
      ice_breakers: [{ locale: 'default', call_to_actions: breakers('sw') }, { locale: 'en_US', call_to_actions: breakers('en') }],
      persistent_menu: [{ locale: 'default', composer_input_disabled: false, call_to_actions: menu }]
    });
    if (!env.IG_ACCESS_TOKEN) {
      await post('instagram', fb + '?platform=instagram', env.PAGE_ACCESS_TOKEN, {
        ice_breakers: [{ locale: 'default', call_to_actions: breakers('sw') }, { locale: 'en_US', call_to_actions: breakers('en') }],
        persistent_menu: [{ locale: 'default', call_to_actions: menu }]
      });
    }
  }
  if (env.IG_ACCESS_TOKEN) {
    await post('instagram', 'https://graph.instagram.com/' + v + '/me/messenger_profile', env.IG_ACCESS_TOKEN, {
      platform: 'instagram',
      ice_breakers: [{ locale: 'default', call_to_actions: breakers('sw') }, { locale: 'en_US', call_to_actions: breakers('en') }]
    });
  }
  return results;
}

/* ---------- Worker ---------- */
var seen = new Map(); // kuzuia jibu mara mbili Meta ikituma tukio lile lile tena
function duplicate(ev) {
  var id = (ev.message && ev.message.mid) || (ev.postback && ev.postback.mid);
  if (!id) return false;
  if (seen.has(id)) return true;
  seen.set(id, Date.now());
  if (seen.size > 500) seen.delete(seen.keys().next().value);
  return false;
}

async function processBody(body, env) {
  var platform = body.object === 'instagram' ? 'instagram' : 'page';
  await loadKb(env);
  var entries = body.entry || [];
  for (var i = 0; i < entries.length; i++) {
    var events = entries[i].messaging || [];
    for (var j = 0; j < events.length; j++) {
      var ev = events[j];
      if (!ev.sender || ev.sender.id === entries[i].id || duplicate(ev)) continue; // ujumbe wetu wenyewe
      try {
        var msgs = await handleEvent(ev, env);
        if (msgs && msgs.length) await deliver(env, platform, ev.sender.id, msgs);
      } catch (e) {
        console.log('Hitilafu: ' + (e && e.stack || e));
      }
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url);
    if (request.method === 'GET' && url.searchParams.get('hub.mode') === 'subscribe') {
      if (env.VERIFY_TOKEN && url.searchParams.get('hub.verify_token') === env.VERIFY_TOKEN) {
        return new Response(url.searchParams.get('hub.challenge') || '', { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }
    if (url.pathname === '/setup') {
      if (!env.SETUP_KEY || url.searchParams.get('key') !== env.SETUP_KEY) return new Response('Forbidden', { status: 403 });
      return Response.json(await setup(env));
    }
    if (url.pathname === '/test' && request.method === 'GET') {
      // jaribio la haraka kwenye kivinjari: /test?q=ada ya pasipoti
      await loadKb(env);
      var q = url.searchParams.get('q') || 'habari';
      return Response.json(textReply(q, detectLang(q) || 'sw', null));
    }
    if (request.method === 'POST') {
      var raw = await request.text();
      if (!(await validSignature(env, request.headers.get('x-hub-signature-256'), raw))) return new Response('Bad signature', { status: 401 });
      var body;
      try { body = JSON.parse(raw); } catch (e) { return new Response('Bad JSON', { status: 400 }); }
      // Meta inataka jibu la 200 haraka; kazi inaendelea nyuma.
      ctx.waitUntil(processBody(body, env));
      return new Response('EVENT_RECEIVED', { status: 200 });
    }
    return new Response('Mr. HamaHama bot iko hai ✅', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
};
