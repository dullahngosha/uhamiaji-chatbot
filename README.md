# Mr. HamaHama v2: chatbot ya Uhamiaji inayojibu kwa kubofya

Mtumiaji anabofya **Mada**, kisha **Swali**, kisha anapata **Jibu** lenye hatua, viungo na chanzo (hati + ukurasa). Pia anaweza kuandika swali kwa maneno yake. **Hakuna AI, API wala gharama ya kila swali.** Chatbot yenyewe inasoma sheria ndani ya browser na kujibu kwa maneno halisi ya nyaraka, kwa hivyo haibuni jibu lolote.

### Jinsi inavyojibu swali lililoandikwa

1. **FAQ iliyohakikiwa** (`knowledge.json`): swali likilingana na FAQ, jibu lenye hatua linaonyeshwa, pamoja na vifungu vya sheria vinavyohusiana.
2. **Kusoma sheria** (`sheria.json`): injini ya BM25 inatafuta kifungu kinachohusika zaidi, kisha inachagua sentensi 1–3 zinazojibu swali na kuweka alama (highlight) kwenye maneno husika. Inaonyesha pia "Kwa mujibu wa Sheria X, Kifungu Y", kitufe cha "Soma kifungu kizima" na vifungu vingine vinavyohusiana.
   - Swali la Kiswahili hutafutwa pia kwa Kiingereza kupitia kamusi ya visawe iliyo ndani ya `embed.js` (`SYN`): pasipoti↔passport, adhabu↔penalty/fine, kufukuzwa↔deportation/removal, na kadhalika. Pia inatambua viambishi vya Kiswahili, kwa mfano "nikiingia" → ingia → entry.
   - Unaweza kuongeza maneno kwenye `SYN` kila unapoona swali ambalo halikupata jibu.
3. Kama hakuna kilichofanana vya kutosha, bot hupendekeza maswali yanayokaribiana au mada za kuchagua. Haitoi jibu la kubuni.

| Faili | Kazi |
|---|---|
| `embed.js` | Widget nzima pamoja na injini ya kusoma sheria (JavaScript tupu, haitumii maktaba yoyote) |
| `widget.css` | Muonekano: navy + dhahabu, mistari ya bendera, na simu (fullscreen) |
| `data/knowledge.json` | Maswali na majibu yaliyohakikiwa (FAQ) katika Kiswahili na Kiingereza |
| `data/sheria.json` | Vifungu vya sheria, kanuni na miongozo, vinavyotengenezwa na `tools/build_kb.py` |
| `tools/build_kb.py` | Inageuza PDF/DOCX/TXT kuwa `sheria.json` na kuunganisha FAQ kutoka CSV |
| `tools/faq_template.csv` | Kiolezo cha kuongeza maswali mapya kwa Excel |
| `JENGA_SHERIA.bat` | Double-click: inageuza folda ya sheria kuwa `data/sheria.json` |
| `index.html` | Ukurasa wa majaribio |

## 1. Kuweka sheria zako (kwenye kompyuta yako ya Windows)

**Njia rahisi:** double-click `JENGA_SHERIA.bat`. Litasoma `Desktop\SHERIA ZA UHAMIAJI` (na `Desktop\hamahama` kama ipo), kisha kuandika `data\sheria.json`. Linahitaji Python iliyosakinishwa.

Njia ya mkono:

```powershell
pip install pypdf python-docx
cd uhamiaji-chatbot
python tools\build_kb.py "C:\Users\ABDALLAH MAJID NASSOR\Desktop\hamahama" "C:\Users\ABDALLAH MAJID NASSOR\Desktop\SHERIA ZA UHAMIAJI"
```

Zana hii:

- inasoma folda **zote** ulizotaja, pamoja na folda ndogo zilizo ndani yake;
- **inaruka nakala**, iwe faili linalofanana kabisa au linalofanana kwa ≥85% (`--similar 0.9` kubadilisha kiwango hicho). Kwa faili zinazofanana, inabakiza toleo refu zaidi;
- inaeleza kila faili ililoruka na sababu, mfano "PDF ya picha, inahitaji OCR";
- inagawa kila sheria katika **vifungu** (`12.-(1) ...`, `Section 12`, `Kifungu cha 12`) pamoja na kichwa chake na Sehemu (PART) yake. Miongozo isiyo na nambari za vifungu inagawanywa kwa vichwa vyake.

Kagua `data/sheria.json`, kisha fanya commit. Kwenye chatbot, vifungu vitaonekana chini ya **Sheria na Kanuni** na kwenye matokeo ya utafutaji ("Kutoka kwenye sheria").

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

Weka mstari huu mara moja kabla ya `</body>` kwenye template. **Ondoa script ya zamani** (`embed.js?v=static-faq-1`) kwanza:

```html
<script src="https://dullahngosha.github.io/uhamiaji-chatbot/embed.js?v=2.0.0" defer></script>
```

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

## Tahadhari

- Repo ni ya umma. **Usiweke nyaraka zenye taarifa binafsi.**
- Majibu ya ada hayataji kiasi, kwa sababu ada hubadilika. Mtumiaji huelekezwa kwenye control number au info@immigration.go.tz.
- Maoni ya 👍/👎 yanahifadhiwa kwenye browser ya mtumiaji tu (`localStorage`, `hh-feedback`).
