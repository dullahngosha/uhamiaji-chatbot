# Mr. HamaHama — PHP 8.1+ / Hostinger
Hakuna Python, Docker, database, LLM au API ya kulipia. FAQ 18 za Kiswahili na English. Hakuna ukurasa wa mfano. Muonekano unatokana na embed.js, widget.css na assets.

## Kupakia
1. Katika File Manager ya ngosha.com, chagua folder inayohifadhi public_html.
2. Upload ZIP na Extract hapo (nje ya public_html).
3. Hamisha folder hamahama-private iwe jirani na public_html. Data isiwe ndani ya public_html.
4. Hamisha folder chat kutoka public_html ya package iwe ndani ya public_html ya ngosha.com. Ikiwa chat tayari ipo, fanya backup na usi-overwrite bila kukagua.
5. PHP iwe 8.1 au juu. PHP inahitaji kusoma hamahama-private na kuandika rate-state.json humo. Ruhusa za kawaida 0755/0644 zinatosha kwa account owner; usitumie 0777.
6. Fungua https://ngosha.com/chat/ kuona service JSON. Huu si ukurasa wa chat; Ask Me huonekana kwenye tovuti yenye script.
7. Weka code ya EMBED-CODE.html kabla ya </body> kwenye template kuu ya website.

Domains zinazoruhusiwa ziko hamahama-private/config.php: ngosha.com, www.ngosha.com na uhamiajihabari.blogspot.com. Ongeza domain halisi ya tovuti ya Uhamiaji hapo. Tumia origin kamili yenye https bila slash ya mwisho.

FAQ zina source_checked dhidi ya nyaraka ulizotoa; si official approval. Ada hazijajibiwa kwa kuwa zinahitaji uhakiki wa sasa. Hakuna kutuma email kiotomatiki au admin ya upload katika kifurushi hiki. Sasisha faqs.php na source/status kwa uangalifu; draft/retired hazitumiki.

CORS si uthibitisho wa mtumiaji. API ni ya public, yenye rate limit 30 kwa IP/dakika na 300 kwa mfumo/dakika. IP inatoka REMOTE_ADDR tu; proxy inaweza kufanya wageni washiriki limit. Backend husoma FAQ zilizowekwa; haiendeshi SQL wala commands kutoka maswali. Ulinzi wa hosting, SSL na updates bado unahitajika. Usifiche errors kwa kuondoa vizuizi vya private folder.

Data imehifadhiwa kama PHP pia: kwenye server inayowasha PHP, kuomba faili hakurudishi data yenyewe. .htaccess ya private folder ni ulinzi wa ziada. Iweke nje ya public_html kama ilivyoelekezwa.

Hakuna kupakia moja kwa moja kulikofanywa na Codex. Jaribu kwenye hosting: swali la English, Kiswahili, historia, picha, na hakikisha https://ngosha.com/hamahama-private/faqs.php ni 404/403.
