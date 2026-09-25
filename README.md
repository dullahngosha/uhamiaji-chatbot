# Mr. HamaHama v3 — msaidizi wa Uhamiaji Tanzania

Mtumiaji anabofya **fungu** (Pasipoti, Visa, Vibali vya Ukaazi, Pasi, Uraia, Mjue Jirani Yako, Huduma Nyingine). Kila fungu hufunguka kwenye ukurasa wake, na maswali yamepangwa kwa **vikundi** (mf. Kuomba, Ada na malipo, Kupotea). Akibofya swali anapata **jibu** kwenye block yake: hatua, orodha, tahadhari na viungo. Anaweza pia kuandika swali lake kwa Kiswahili au Kiingereza, nayo chatbot hulitafuta kwa visawe vya lugha zote mbili na mizizi ya maneno ya Kiswahili.

- **Majibu 106** yameandaliwa kutoka kwenye Sheria ya Uraia (Sura 357), Sheria ya Pasipoti na Hati za Safari (R.E. 2023), Sheria ya Wakimbizi, Sheria ya Ajira kwa Wageni, miongozo ya Pasipoti na Visa, brochures za Uhamiaji na tovuti rasmi ya immigration.go.tz. Yote yako kwenye `data/knowledge.json`.
- Hakuna AI, API wala gharama ya kila swali; chatbot inafanya kazi kwenye GitHub Pages pekee.
- `data/sheria.json` (maandishi ya sheria) hutumika na msimamizi kuandaa na kuhakiki majibu; widget haiyaonyeshi moja kwa moja.

| Faili | Kazi |
|---|---|
| `embed.js` | Widget nzima: mafungu, vikundi, majibu na utafutaji wa Kiswahili/Kiingereza (JavaScript tupu, haitumii maktaba yoyote) |
| `widget.css` | Muonekano: navy + dhahabu, mistari ya bendera, na simu (fullscreen) |
| `data/knowledge.json` | Mafungu 7 na maswali/majibu 106 (Kiswahili na Kiingereza), yamepangwa kwa vikundi |
| `data/sheria.json` | Maandishi ya sheria na miongozo (rejea ya msimamizi), yanayotengenezwa na `tools/build_kb.py` |
| `tools/build_kb.py` | Inageuza PDF/DOCX/TXT kuwa `sheria.json` na kuunganisha FAQ kutoka CSV |
| `tools/faq_template.csv` | Kiolezo cha kuongeza maswali mapya kwa Excel |
| `JENGA_SHERIA.bat` | Double-click: inapakua nyaraka rasmi na kuzigeuza, pamoja na sheria zako, kuwa `data/sheria.json` |
| `tools/fetch_official.py` | Inapakua sheria, miongozo, brochures na kurasa za huduma kutoka immigration.go.tz |
| `index.html` | Ukurasa wa majaribio |

## 1. Data ya sheria na miongozo (`data/sheria.json`)

Chatbot tayari ina nyaraka rasmi zilizopakuliwa kutoka **immigration.go.tz**:

- **Sheria:** Tanzania Citizenship Act, Tanzania Passports and Travel Documents Act (R.E. 2023), Refugees Act, na Non-Citizens (Employment Regulation) Act.
- **Miongozo:** Mwongozo wa Huduma ya Pasipoti na Hati za Safari, na Visa Guidelines.
- **Brochures:** Uraia, e-Passport, Residence Permit, e-Visa, na Wahamiaji Haramu.
- **Kurasa za huduma za tovuti:** aina za visa, majedwali ya ada (visa, pasipoti, vibali, passes), madaraja ya vibali A/B/C, uraia, passes, na mengine.

**Kusasisha au kuongeza sheria zako:** double-click `JENGA_SHERIA.bat`. Inafanya hatua mbili:

1. Inapakua upya nyaraka rasmi kutoka immigration.go.tz na kuziweka kwenye folda `rasmi/` (folda hii haipandi GitHub).
2. Inasoma `rasmi/`, `Desktop\SHERIA ZA UHAMIAJI` na `Desktop\hamahama`, inaruka faili zinazojirudia au zinazofanana, kisha inaandika `data\sheria.json`.

Baada ya hapo, fanya commit na push ya `data/sheria.json`. Hatua hii inahitaji Python iliyosakinishwa.

Kila kitu kinaweza pia kufanywa kwa mkono:

```powershell
pip install pypdf python-docx
python tools\fetch_official.py
python tools\build_kb.py rasmi "C:\Users\ABDALLAH MAJID NASSOR\Desktop\SHERIA ZA UHAMIAJI"
```

`build_kb.py` inafanya kazi hizi:

- inasoma PDF, DOCX, TXT na MD, na kuruka README, fomu tupu za kujaza, na folda za mfumo (`tools`, `data`, `assets`);
- **inaruka nakala**, iwe faili linalofanana kabisa au linalofanana kwa ≥85% (`--similar 0.9` kubadilisha kiwango hicho);
- kwa **sheria (Acts):** inatumia vichwa vya "Arrangement of Sections", inaondoa vichwa na miguu ya kurasa pamoja na maelezo ya pembeni, na inaunganisha mistari iliyokatwa na PDF;
- kwa **miongozo na brochures:** inagawa kwa vichwa, mfano "2.1 PASIPOTI YA KAWAIDA";
- inaeleza kila faili ililoruka na sababu, mfano "PDF ya picha, inahitaji OCR".

> PDF zilizochanganuliwa (scanned) hazina maandishi. Zipitishe kwanza kwenye OCR (mfano Adobe Acrobat → "Recognize Text") kisha endesha zana tena.

## 2. Kuongeza maswali na majibu (bila kuandika code)

1. Fungua `tools/faq_template.csv` kwenye Excel. Kila mstari ni swali moja; hatua zitenganishwe kwa `|`.
2. `topic` iwe mojawapo ya: `passport`, `visa`, `residence`, `citizenship`, `general`.
3. Hifadhi kama *CSV UTF-8*, kisha endesha:
   ```powershell
   python tools\build_kb.py --faq maswali_yangu.csv
   ```
   Mistari yenye `id` iliyopo itasasishwa, na mipya itaongezwa kwenye `data/knowledge.json`.

Kwa kila jibu jipya, weka `document` na `pages` za chanzo. Jibu lisilo na chanzo lisiingie kwenye mfumo.

**Uraia:** kwa sasa hakuna FAQ zilizohakikiwa. Kitufe cha Uraia kinaeleza hilo na kumpeleka mtumiaji kwenye sheria au mawasiliano; hakivunjiki tena. Ongeza maswali ya uraia kupitia CSV kutoka kwenye Sheria ya Uraia.

## 3. Kuunganisha na blog (Blogger)

Blog tayari ina mstari huu, na **haihitaji kubadilishwa**:

```html
<script src="https://dullahngosha.github.io/uhamiaji-chatbot/embed.js"></script>
```

Kila mabadiliko yanapoingia kwenye `main`, GitHub Pages huyasambaza, na wageni huyaona ndani ya takriban dakika 10 (muda wa cache ya GitHub Pages). Script inafanya kazi ikiwa ndani ya `<head>` au kabla ya `</body>`, iwe na `defer` au isiwe nayo. Iwe mara moja tu kwenye template.

Chaguo za ziada (sifa za `data-*` kwenye tag ya script):

| Sifa | Maana |
|---|---|
| `data-lang="en"` | Anza kwa Kiingereza (chaguo-msingi ni Kiswahili) |
| `data-open="true"` | Fungua chatbot ukurasa unapofunguka |
| `data-kb="…"` / `data-laws="…"` | URL nyingine ya data |

Viungo ndani ya posti za blog vinaweza kufungua jibu moja kwa moja:

```html
<button onclick="HamaHama.show('passport.apply')">Ninaombaje pasipoti?</button>
<button onclick="HamaHama.ask('pasipoti imepotea')">Pasipoti imepotea</button>
```

## 4. Majaribio ya ndani

```powershell
python -m http.server 8000
# fungua http://localhost:8000/index.html
```

Jaribu "nataka pasipoti", "pasipoti imepotea", "visa ya watoto", "gharama", "uraia" na "habari mkuu". Baada ya kuweka sheria, jaribu pia "nikiingia bila pasipoti adhabu ni nini?", "kibali changu kimefutwa nifanye nini" na "nikifukuzwa nchini".

## 5. Bot ya Facebook Messenger na Instagram

Maswali na majibu yale yale yanajibiwa kiotomatiki kwenye Messenger na Instagram DM.
Bot inaishi kwenye Cloudflare Workers, ambayo ni bure, na mwongozo kamili wa kuiweka hewani uko kwenye [`bot/README.md`](bot/README.md).

| Faili | Kazi |
|---|---|
| `bot/worker.src.js` | Code ya bot (hariri hapa) |
| `bot/worker.js` | Faili la kubandika Cloudflare (linatengenezwa na `python3 tools/build_bot.py`) |
| `tools/test_bot.mjs` | Majaribio: `node tools/test_bot.mjs` |

## Tahadhari

- Repo ni ya umma. **Usiweke nyaraka zenye taarifa binafsi.**
- Majibu ya ada hayataji kiasi, kwa sababu ada hubadilika. Mtumiaji huelekezwa kwenye control number au info@immigration.go.tz.
- Maoni ya 👍/👎 yanahifadhiwa kwenye browser ya mtumiaji tu (`localStorage`, `hh-feedback`).
