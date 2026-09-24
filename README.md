# Mr. HamaHama — Hostinger PHP chatbot

Hili ndilo toleo jipya la chatbot ya Uhamiaji Tanzania. Linatumia FAQ zilizohakikiwa kutoka nyaraka zilizotolewa, bila Python, Ollama, database au API ya kulipia. JavaScript ya widget ipo pia kwenye mzizi wa repo (`embed.js`), pamoja na `widget.css` na `assets/` zinazohitajika nayo.

## Mpangilio wa Hostinger

Fungua [`hostinger/WEKA-HOSTINGER.md`](hostinger/WEKA-HOSTINGER.md) kwa hatua kamili. Kwenye hosting, weka yaliyomo kwenye `hostinger/public_html/chat/` ndani ya `public_html/chat/`. Weka `hostinger/hamahama-private/` sambamba na `public_html`, **si ndani yake**. PHP 8.1+ lazima iweze kusoma private folder na kuandika `rate-state.json` humo.

Baada ya API kufanya kazi, ongeza script hii kabla ya `</body>` kwenye template inayotumika na kurasa zote za ngosha.com:

```html
<script src="https://ngosha.com/chat/embed.js?v=hostinger1"
  data-uhamiaji-ai
  data-endpoint="https://ngosha.com/chat/api.php"
  data-open="false" defer></script>
```

Ukitaka ku-host JavaScript kupitia GitHub CDN badala ya Hostinger, tumia root `embed.js` lakini **weka `data-endpoint` wazi**:

```html
<script src="https://cdn.jsdelivr.net/gh/dullahngosha/uhamiaji-chatbot@main/embed.js"
  data-uhamiaji-ai
  data-endpoint="https://ngosha.com/chat/api.php"
  data-open="false" defer></script>
```

GitHub huhifadhi JavaScript na code; haianzishi PHP yenyewe. `https://ngosha.com/chat/` kurudisha service JSON ni kawaida, lakini **haithibitishi chatbot inajibu**. Jaribu swali kwa `POST https://ngosha.com/chat/api.php`; jibu la `503` linamaanisha backend bado ina hitilafu. Usiiwashe widget kwenye kurasa zote mpaka jaribio hilo lipite.

Run `php hostinger/tests/engine-test.php` kupima majibu ya FAQ kabla ya deployment. Hakuna admin ya kupakia PDF wala uchakataji wa LLM katika toleo hili; FAQ husasishwa kwenye private PHP files kwa ukaguzi.
