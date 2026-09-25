# Mr. HamaHama kwenye Facebook Messenger na Instagram

Bot hii inajibu kiotomatiki ujumbe wa **Facebook Messenger** na **Instagram DM**, saa 24.
Inatumia maswali na majibu yale yale 106 ya widget ya blogu (`data/knowledge.json`) na utafutaji ule ule.
Haitumii AI wala API ya kulipia.

## Mtu anavyoona kwenye Messenger/Instagram

1. **Anaanza mazungumzo** kwa kubofya "Anza", kusalimia ("habari", "hi") au kubofya moja ya maswali yanayoonekana mwanzoni (*ice breakers*).
   Bot inamkaribisha na kumwonyesha vitufe vya huduma 7:
   Pasipoti · Visa · Vibali vya Ukaazi · Pasi · Uraia · Mjue Jirani Yako · Huduma Nyingine · 🇬🇧 English
2. **Anabofya huduma**, kwa mfano Visa. Anaona maswali ya Visa tu, yenye namba 1–10, na vitufe vya namba.
   Kitufe cha **Zaidi ▶** kinaonyesha maswali mengine ya huduma hiyo.
3. **Anabofya namba** (au anaiandika, mfano "3") na kupata jibu kamili: maelezo, hatua na tahadhari.
   Chini ya jibu kuna maswali yanayohusiana, kitufe cha **◀ Visa** na kitufe cha **🏠 Menyu**.
4. **Akiandika swali lake mwenyewe**, kwa mfano "pasipoti yangu imepotea nifanye nini", bot inatafuta.
   - Ikiwa na uhakika, inajibu moja kwa moja.
   - Isipokuwa na uhakika, inampa maswali yanayokaribiana ili achague.
   - Isipopata kabisa, inamrudisha kwenye menyu ya huduma.
5. **Lugha:** akiandika kwa Kiingereza anajibiwa kwa Kiingereza. Pia anaweza kubadili lugha kwa kitufe.

Ukibadilisha au kuongeza majibu kwenye `data/knowledge.json`, bot huyatumia yenyewe ndani ya dakika 10. Huhitaji kuiweka upya.

---

## Utakachohitaji

| Kitu | Maelezo |
|---|---|
| Ukurasa wa Facebook | Wewe uwe **admin** wa ukurasa huo |
| Akaunti ya Instagram | Iwe **Professional** (Business au Creator) na **iunganishwe na ukurasa wa Facebook** (Instagram → Settings → Account type and tools) |
| Akaunti ya Meta for Developers | Bure: <https://developers.facebook.com> (ingia kwa Facebook yako) |
| Akaunti ya Cloudflare | Bure: <https://dash.cloudflare.com/sign-up> (hapa ndipo bot "inaishi") |

GitHub Pages haiwezi kupokea ujumbe wa Meta, kwa sababu inaonyesha kurasa tu na haiendeshi code.
Kwa hiyo bot inaishi Cloudflare Workers. Kifurushi cha bure kinaruhusu maombi 100,000 kwa siku, ambayo yanatosha sana.

---

## Hatua ya 1 — Weka bot kwenye Cloudflare

1. Ingia <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Create Worker**.
2. Ipe jina `hamahama-bot` → **Deploy**.
3. Bofya **Edit code**. Futa code yote iliyopo.
   Bandika (paste) maudhui yote ya faili [`bot/worker.js`](worker.js). Kwenye GitHub, fungua faili hilo, bofya kitufe cha **Copy raw file**, kisha paste.
   Bofya **Deploy**.
4. Nakili anwani ya worker, mfano `https://hamahama-bot.JINA-LAKO.workers.dev`.
   Ukiifungua kwenye kivinjari utaona: **Mr. HamaHama bot iko hai ✅**.
   Jaribu pia: `https://hamahama-bot.JINA-LAKO.workers.dev/test?q=ada ya pasipoti`
5. **Settings → Variables and Secrets → Add**. Ongeza hizi, zote zikiwa aina ya **Secret**:

   | Jina | Thamani |
   |---|---|
   | `VERIFY_TOKEN` | Neno la siri unalobuni wewe, mfano `hamahama2026` |
   | `SETUP_KEY` | Neno jingine la siri unalobuni wewe |
   | `PAGE_ACCESS_TOKEN` | Utalipata kwenye Hatua ya 2 |
   | `APP_SECRET` | Utalipata kwenye Hatua ya 2 |

6. **(Inashauriwa) Kumbukumbu fupi.** Hii ndiyo inayowezesha mtu kuandika namba ("3") badala ya kubofya kitufe, na bot kukumbuka lugha yake:
   1. **Storage & Databases → KV → Create** → jina `hamahama-state`.
   2. Rudi kwenye worker → **Settings → Bindings → Add → KV namespace**.
   3. Variable name: `STATE`, chagua `hamahama-state` → **Deploy**.

## Hatua ya 2 — Tengeneza app ya Meta

1. <https://developers.facebook.com/apps> → **Create App**.
2. Chagua matumizi (use cases) haya:
   - **Engage with customers on Messenger from Meta**
   - **Manage messaging & content on Instagram**

   Chagua Business portfolio yako, kisha maliza kuunda app.
3. **App settings → Basic** → **App secret** → **Show**. Nakili kisha iweke Cloudflare kama `APP_SECRET`.
4. **Messenger → Messenger API Settings**:
   1. Sehemu ya **Generate access tokens** → **Connect** ukurasa wako.
   2. Bofya **Generate** na unakili token.
   3. Iweke Cloudflare kama `PAGE_ACCESS_TOKEN`.
5. Bado kwenye ukurasa huo, sehemu ya **Configure webhooks**:
   - **Callback URL:** anwani ya worker yako (Hatua ya 1.4)
   - **Verify token:** neno ulilolibuni kwenye `VERIFY_TOKEN`
   - Bofya **Verify and save**.
   - Kwenye ukurasa wako, bofya **Add subscriptions** na uchague `messages` na `messaging_postbacks`.

## Hatua ya 3 — Washa Instagram

1. Kwenye Instagram (simu): **Settings → Messages and story replies → Message controls → Connected tools** → washa **Allow access to messages**.
2. Kwenye app ya Meta: **Instagram → API setup with Facebook login** (au **Messenger → Instagram settings**):
   1. Weka webhook ile ile: Callback URL na Verify token vilevile.
   2. Chagua `messages` na `messaging_postbacks`.
   3. Hakikisha akaunti yako ya Instagram imeunganishwa.

   Instagram inatumia ile ile `PAGE_ACCESS_TOKEN`, kwa hiyo hakuna token nyingine inayohitajika.

   > Ukitumia njia ya **API setup with Instagram login** (bila ukurasa wa Facebook), weka pia `IG_ACCESS_TOKEN` na `IG_APP_SECRET` (Instagram app secret) kwenye Cloudflare.

## Hatua ya 4 — Washa kitufe cha "Anza", menyu na maswali ya mwanzo

Fungua kwenye kivinjari mara moja tu (tumia `SETUP_KEY` yako):

```
https://hamahama-bot.JINA-LAKO.workers.dev/setup?key=SETUP_KEY_YAKO
```

Hii inaweka:

- kitufe cha **Get Started**;
- salamu ya kukaribisha;
- menyu ya kudumu (☰);
- maswali 4 yanayoulizwa zaidi, yanayoonekana mtu anapofungua mazungumzo, kwa Messenger na Instagram.

Kila sehemu inapaswa kuonyesha `200 {"result":"success"}`.

## Hatua ya 5 — Jaribu

Tuma ujumbe "habari" kwa ukurasa wako, kwa Messenger na kwa Instagram DM, ukitumia akaunti yako. Bot inapaswa kujibu mara moja.

> **Muhimu:** wakati app iko kwenye hali ya majaribio (*Development mode*), bot inawajibu **watu wenye nafasi (roles) kwenye app tu**, kama wewe na testers uliowaongeza (**App roles → Roles**).
> Ili ijibu **kila mtu**, fanya Hatua ya 6.

## Hatua ya 6 — Ruhusa ya kujibu umma (App Review)

1. **App Review → Permissions and features** → omba **Advanced Access** kwa ruhusa hizi:
   - `pages_messaging`
   - `pages_manage_metadata`
   - `instagram_manage_messages` (au `instagram_business_manage_messages`)
   - `instagram_basic`
2. Meta inaomba mambo mawili:
   - **video fupi ya skrini** ikionyesha mtu akimwandikia ukurasa na bot ikimjibu. Rekodi Hatua ya 5.
   - **maelezo mafupi**, kwa mfano: *"Automated FAQ assistant that answers questions about Tanzania immigration services (passport, visa, residence permit, citizenship) using a fixed knowledge base."*
3. Kamilisha **Business Verification** ikiombwa (**Business settings → Security center**).
4. Ukikubaliwa, badilisha app kuwa **Live** (juu ya ukurasa wa app).

Kawaida uhakiki huchukua siku chache hadi wiki 1–2.

---

## Matengenezo

- **Kuongeza au kubadilisha majibu:**
  1. Hariri `data/knowledge.json`, au tumia CSV kupitia `tools/build_kb.py`.
  2. Fanya commit.
  3. Widget na bot zote zitabadilika ndani ya dakika 10.
- **Kubadilisha jinsi bot inavyoongea:**
  1. Hariri `bot/worker.src.js`.
  2. Endesha `python3 tools/build_bot.py`.
  3. Endesha majaribio `node tools/test_bot.mjs`.
  4. Bandika `bot/worker.js` mpya kwenye Cloudflare.
- **Injini ya utafutaji** inanakiliwa kutoka `embed.js` kila unapoendesha `tools/build_bot.py`, ili bot na widget zijibu sawa.
- **Kuona makosa:** Cloudflare → worker → **Logs** (washa *Real-time logs*). Hitilafu za Meta zinaonekana kama `Graph API 400: ...`.
- **Usalama:**
  - Ujumbe usio na saini sahihi ya Meta (`APP_SECRET`) unakataliwa.
  - Tokens zinakaa Cloudflare kama Secrets, si kwenye GitHub. **Usiziweke kamwe kwenye repo.**

## Kwa wanaotumia command line (hiari)

```bash
cd bot
npx wrangler deploy          # inatumia wrangler.toml
npx wrangler secret put PAGE_ACCESS_TOKEN
npx wrangler secret put APP_SECRET
npx wrangler secret put VERIFY_TOKEN
npx wrangler secret put SETUP_KEY
```
