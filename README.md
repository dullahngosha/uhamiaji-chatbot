# Mr. HamaHama — chatbot ya Blogger/GitHub Pages

Widget hii inafanya kazi kwa JavaScript pekee. Majibu yake ya Kiswahili na Kiingereza yanatoka kwenye [`faq-data.json`](faq-data.json), yenye FAQ 18 zilizohakikiwa dhidi ya nyaraka zilizotolewa. Haihitaji Hostinger, PHP, Ollama, database au API. Ikiwa swali halina jibu lililohakikiwa, haisemi jambo la kubuni; inaomba ufafanuzi au inaelekeza `info@immigration.go.tz`.

## Kuiweka kwenye Blogger

Weka script hii mara moja kabla ya `</body>` kwenye template ya Blogger. Ikiwa tayari ipo `https://dullahngosha.github.io/uhamiaji-chatbot/embed.js`, **badilisha tag ya zamani** kwa hii yenye toleo maalum ili kuepuka cache ya browser:

```html
<script src="https://dullahngosha.github.io/uhamiaji-chatbot/embed.js?v=static-faq-1" defer></script>
```

GitHub Pages inatakiwa kutumikia `embed.js`, `widget.css`, `faq-data.json` na `assets/` kutoka `main` root. Unaweza kufungua [ukurasa wa majaribio](https://dullahngosha.github.io/uhamiaji-chatbot/) kuona widget bila Blogger. GitHub Pages inaweza kuchelewa kusambaza commit mpya; ikiwa URL ya `faq-data.json` inarudisha 404, subiri uchapishaji wa Pages ukamilike.

Kwa matumizi kwenye domain nyingine, ongeza script hiyo kwenye ukurasa husika. Hakuna `data-endpoint` inayohitajika; script inachukua FAQ kutoka mahali palepale ambapo `embed.js` imehifadhiwa.

## Uwezo na mipaka

- Maswali yaliyofunikwa: pasipoti, visa na vibali vya kuishi; mazungumzo ya kufuatilia, salamu na maswali ya ada yenye uangalifu.
- Lugha za majibu ya FAQ: Kiswahili na Kiingereza. Lugha nyingine zinaweza kutambuliwa kwa muonekano wa widget, lakini majibu ya FAQ hutolewa kwa Kiingereza mpaka yakaguliwe na kutafsiriwa.
- Huu si mfumo wa LLM. Maswali mapya yasiyo kwenye FAQ hayatapata jibu la kubuni.
- Usiongeze nyaraka zenye taarifa binafsi kwenye repo ya umma. FAQ husasishwa kwa ukaguzi wa maudhui kabla ya commit.

Ili kujaribu kwa local, serve folder hii kupitia HTTP kisha fungua `index.html`. Jaribu “habari mkuu”, “nataka pasipoti”, “how do I apply for a visa?”, na “gharama yake?”.
