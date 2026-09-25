// Majaribio ya bot ya Messenger/Instagram bila mtandao: node tools/test_bot.mjs
// Inaiga matukio ya webhook ya Meta na kukamata ujumbe ambao bot ingetuma.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'bot/worker.js'), 'utf8');
const tmp = path.join(os.tmpdir(), 'hamahama-worker-' + process.pid + '.mjs');
fs.writeFileSync(tmp, src + '\nexport { textReply, payloadReply, handleEvent, splitText, detectLang };\n');
const W = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);
const worker = W.default;
const KB = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge.json'), 'utf8'));

let sent = [];
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.endsWith('knowledge.json')) return new Response(JSON.stringify(KB), { status: 200 });
  if (url.includes('graph.')) { sent.push({ url, auth: opts.headers.Authorization, body: JSON.parse(opts.body) }); return new Response('{}', { status: 200 }); }
  throw new Error('fetch isiyotarajiwa: ' + url);
};
const kv = new Map();
const env = {
  VERIFY_TOKEN: 'siri123', PAGE_ACCESS_TOKEN: 'PAGE', APP_SECRET: 'appsecret', SETUP_KEY: 'k',
  STATE: { get: async (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => { kv.set(k, v); } }
};

let fails = 0, passes = 0;
function ok(cond, name, extra) { if (cond) passes++; else { fails++; console.log('✗ ' + name, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : ''); } }

async function post(body, { sign = true } = {}) {
  const raw = JSON.stringify(body);
  const headers = {};
  if (sign) headers['x-hub-signature-256'] = 'sha256=' + crypto.createHmac('sha256', env.APP_SECRET).update(raw).digest('hex');
  const waits = [];
  const res = await worker.fetch(new Request('https://bot.example/webhook', { method: 'POST', body: raw, headers }), env, { waitUntil: (p) => waits.push(p) });
  await Promise.all(waits);
  return res;
}
function ev(object, sender, message, postback) {
  const e = { sender: { id: sender }, recipient: { id: 'PAGEID' }, timestamp: Date.now() };
  if (message) e.message = Object.assign({ mid: 'm' + Math.random() }, message);
  if (postback) e.postback = Object.assign({ mid: 'p' + Math.random() }, postback);
  return { object, entry: [{ id: 'PAGEID', time: Date.now(), messaging: [e] }] };
}
async function say(text, { object = 'page', user = 'U1' } = {}) { sent = []; await post(ev(object, user, { text })); return msgs(); }
async function tap(payload, { object = 'page', user = 'U1' } = {}) { sent = []; await post(ev(object, user, { text: 'x', quick_reply: { payload } })); return msgs(); }
function msgs() { return sent.filter((s) => s.body.message).map((s) => s.body.message); }
function all(m) { return m.map((x) => x.text).join('\n'); }
function lastQR(m) { return (m[m.length - 1] || {}).quick_replies || []; }

// 1. Uthibitisho wa webhook
let r = await worker.fetch(new Request('https://bot.example/webhook?hub.mode=subscribe&hub.verify_token=siri123&hub.challenge=CH42'), env, {});
ok(r.status === 200 && (await r.text()) === 'CH42', 'verify token sahihi');
r = await worker.fetch(new Request('https://bot.example/webhook?hub.mode=subscribe&hub.verify_token=vibaya&hub.challenge=CH42'), env, {});
ok(r.status === 403, 'verify token isiyo sahihi inakataliwa');

// 2. Saini
r = await post(ev('page', 'U1', { text: 'habari' }), { sign: false });
ok(r.status === 401, 'bila saini inakataliwa');

// 3. Salamu -> menyu ya huduma
let m = await say('habari');
ok(m.length === 1 && /Mr\. HamaHama/.test(m[0].text), 'salamu -> karibu', m);
ok(lastQR(m).length === KB.topics.length + 1, 'menyu: huduma 7 + lugha', lastQR(m).map((q) => q.title));
ok(sent[0].body.sender_action === 'typing_on', 'Messenger: typing_on');
ok(sent[1].auth === 'Bearer PAGE' && sent[1].url.includes('graph.facebook.com'), 'Messenger: graph.facebook.com + token ya ukurasa');

// 4. Kubofya huduma -> maswali ya huduma hiyo tu
m = await tap('T|sw|visa|0');
const visaCount = KB.faqs.filter((f) => f.topic === 'visa').length;
ok(/VISA/.test(m[0].text) && /1\. /.test(m[0].text), 'visa: orodha', m);
ok(lastQR(m).some((q) => q.payload === 'T|sw|visa|1'), 'visa: kitufe cha Zaidi', lastQR(m));
m = await tap('T|sw|visa|' + Math.ceil(visaCount / 10 - 1));
ok(!lastQR(m).some((q) => /Zaidi/.test(q.title)), 'visa ukurasa wa mwisho hauna Zaidi');

// 5. Kuandika namba baada ya orodha
m = await tap('T|sw|passport|0');
const third = m[0].quick_replies[2].payload.split('|')[2];
m = await say('3');
ok(m[0].text.startsWith('✅ ' + KB.faqs.find((f) => f.id === third).q.sw), 'namba "3" -> swali la 3 la orodha', m[0].text.slice(0, 80));

// 6. Kubofya swali -> jibu
m = await tap('Q|sw|passport.fee');
ok(/150,000/.test(all(m)), 'ada ya pasipoti', all(m).slice(0, 200));
ok(lastQR(m).some((q) => q.payload === 'T|sw|passport|0') && lastQR(m).some((q) => q.payload === 'M|sw'), 'jibu: rudi + menyu');

// 7. Maswali yaliyoandikwa (Kiswahili/Kiingereza)
const cases = [
  ['ada ya pasipoti ni ngapi', 'passport.fee'],
  ['nimepoteza pasipoti yangu nifanye nini', 'passport.lost'],
  ['ninaombaje pasipoti', 'passport.apply'],
  ['how do I apply for a passport', 'passport.apply', 'en'],
  ['how much is a tanzania visa', null, 'en'],
  ['nataka uraia wa tanzania', null],
];
for (const [q, id, lang] of cases) {
  m = await say(q, { user: 'U-' + q });
  const text = all(m);
  if (id) {
    const f = KB.faqs.find((x) => x.id === id);
    ok(m[0].text.startsWith('✅ ' + f.q[lang || 'sw']), 'swali: ' + q, text.slice(0, 120));
  } else ok(m.length > 0 && text.length > 20, 'swali lina jibu au mapendekezo: ' + q, text.slice(0, 120));
  if (lang === 'en') ok(!/Chagua|Hatua:/.test(text), 'Kiingereza kinajibiwa kwa Kiingereza: ' + q, text.slice(0, 200));
}
m = await say('xyzzy qwerty');
ok(/Samahani|Sorry/.test(m[0].text) && lastQR(m).length >= 7, 'lisilojulikana -> menyu', m[0].text);

// 8. Instagram: vikomo vya herufi 1000
sent = [];
for (const f of KB.faqs) {
  await post(ev('instagram', 'IG1', { text: 'x', quick_reply: { payload: 'Q|sw|' + f.id } }));
  await post(ev('instagram', 'IG1', { text: 'x', quick_reply: { payload: 'Q|en|' + f.id } }));
}
const igMsgs = sent.filter((s) => s.body.message);
ok(igMsgs.every((s) => s.body.message.text.length <= 1000), 'Instagram: kila ujumbe <= 1000', Math.max(...igMsgs.map((s) => s.body.message.text.length)));
ok(!sent.some((s) => s.body.sender_action), 'Instagram: hakuna typing_on');

// 9. Vitufe: kila kichwa <= 20, idadi <= 13, payload inaeleweka — kwa kila huduma, ukurasa na jibu
let qrs = [];
for (const lang of ['sw', 'en']) {
  for (const tp of KB.topics) for (let p = 0; p < 3; p++) qrs = qrs.concat(W.payloadReply('T|' + lang + '|' + tp.id + '|' + p));
  for (const f of KB.faqs) qrs = qrs.concat(W.payloadReply('Q|' + lang + '|' + f.id));
  qrs = qrs.concat(W.payloadReply('M|' + lang));
}
const allQ = qrs.flatMap((x) => x.quick_replies || []);
ok(qrs.every((x) => !x.quick_replies || x.quick_replies.length <= 13), 'quick replies <= 13');
ok(allQ.every((q) => q.title.length <= 20 && q.title.length > 0), 'vichwa vya vitufe <= 20', allQ.filter((q) => q.title.length > 20).map((q) => q.title));
ok(allQ.every((q) => /^(Q\|(sw|en)\|[\w.-]+|T\|(sw|en)\|\w+\|\d+|M\|(sw|en))$/.test(q.payload) && q.payload.length <= 1000), 'payload sahihi');
ok(allQ.filter((q) => q.payload.startsWith('Q|')).every((q) => KB.faqs.some((f) => f.id === q.payload.split('|')[2])), 'kila kitufe cha swali kina jibu');
// kila swali linafikika kupitia kurasa za huduma
const reach = new Set(allQ.filter((q) => q.payload.startsWith('Q|')).map((q) => q.payload.split('|')[2]));
ok(KB.faqs.every((f) => reach.has(f.id)), 'maswali yote 106 yanafikika kwa kubofya', KB.faqs.filter((f) => !reach.has(f.id)).map((f) => f.id));

// 10. Echo na picha
sent = [];
await post(ev('page', 'U1', { text: 'hello', is_echo: true }));
ok(sent.length === 0, 'echo haijibiwi');
m = await (async () => { sent = []; await post(ev('page', 'U9', { attachments: [{ type: 'image' }] })); return msgs(); })();
ok(m.length === 1 && lastQR(m).length >= 7, 'picha -> menyu');
// postback ya "Anza"
sent = []; await post(ev('page', 'U10', null, { title: 'Get Started', payload: 'M|sw' }));
ok(msgs().length === 1 && /Karibu/.test(msgs()[0].text), 'Get Started -> karibu');

// 11. /test na splitText
r = await worker.fetch(new Request('https://bot.example/test?q=ada%20ya%20visa'), env, {});
ok(r.status === 200 && (await r.json()).length > 0, '/test inafanya kazi');
const parts = W.splitText('a'.repeat(2500) + '\n' + 'b'.repeat(300), 1000);
ok(parts.every((p) => p.length <= 1000) && parts.join('').replace(/\n/g, '').length === 2800, 'splitText');

console.log((fails ? '❌ ' : '✅ ') + passes + ' yamepita, ' + fails + ' yameshindwa');
process.exit(fails ? 1 : 0);
