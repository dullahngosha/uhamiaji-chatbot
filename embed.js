(function () {
  'use strict';
  var script = document.currentScript;
  var base = script && script.src ? script.src.replace(/[^/]+$/, '') : './';
  if (document.getElementById('uhamiaji-ai-panel')) return;

  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = base + 'widget.css?v=hostinger1'; document.head.appendChild(css);
  var paths = {
    chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>', minus:'<path d="M5 12h14"/>',
    send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    passport:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/>',
    permit:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 9h.01M11 9h6M8 13h9"/>',
    people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>'; }

  var ui = {
    sw:{welcome:'Karibu! Mimi ni Mr. HamaHama, msaidizi wako wa kidijitali kutoka Idara ya Uhamiaji Tanzania.',intro:'Uliza swali kuhusu visa, pasipoti, vibali vya kuishi, uraia au huduma nyingine za Uhamiaji.',placeholder:'Andika swali lako...',online:'Mtandaoni',day:'Leo',auto:'Lugha: Otomatiki',disclaimer:'Taarifa hii ni muhtasari. Thibitisha na Idara ya Uhamiaji Tanzania kabla ya kufanya uamuzi.',notfound:'Sijapata taarifa ya kutosha kuhusu swali hilo. Jaribu kutaja visa, pasipoti, kibali cha kuishi au uraia.',page:'ukurasa',lead:''},
    en:{welcome:'Welcome! I am Mr. HamaHama, your digital assistant from the Tanzania Immigration Department.',intro:'Ask about visas, passports, residence permits, citizenship or other immigration services.',placeholder:'Type your question...',online:'Online',day:'Today',auto:'Language: Automatic',disclaimer:'This is a summary. Verify it with the Tanzania Immigration Department before making a decision.',notfound:'I could not find enough information about that question. Try mentioning visa, passport, residence permit or citizenship.',page:'page',lead:''},
    fr:{welcome:'Bienvenue ! Je suis lÃ  pour vous aider.',intro:"Posez une question sur les visas, passeports, permis de sÃ©jour ou la citoyennetÃ©.",placeholder:'Ã‰crivez votre question...',online:'En ligne',day:"Aujourdâ€™hui",auto:'Langue : Automatique',disclaimer:"Ceci est un rÃ©sumÃ©. VÃ©rifiez auprÃ¨s du DÃ©partement de lâ€™immigration de Tanzanie.",notfound:"Je nâ€™ai pas trouvÃ© suffisamment dâ€™informations dans les documents.",page:'page',lead:'Selon le document :'},
    es:{welcome:'Â¡Bienvenido! Estoy aquÃ­ para ayudarle.',intro:'Pregunte sobre visados, pasaportes, permisos de residencia o ciudadanÃ­a.',placeholder:'Escriba su pregunta...',online:'En lÃ­nea',day:'Hoy',auto:'Idioma: AutomÃ¡tico',disclaimer:'Este es un resumen. VerifÃ­quelo con el Departamento de InmigraciÃ³n de Tanzania.',notfound:'No encontrÃ© informaciÃ³n suficiente en los documentos.',page:'pÃ¡gina',lead:'SegÃºn el documento:'},
    de:{welcome:'Willkommen! Ich helfe Ihnen gern.',intro:'Fragen Sie nach Visa, PÃ¤ssen, Aufenthaltsgenehmigungen oder StaatsbÃ¼rgerschaft.',placeholder:'Schreiben Sie Ihre Frage...',online:'Online',day:'Heute',auto:'Sprache: Automatisch',disclaimer:'Dies ist eine Zusammenfassung. BestÃ¤tigen Sie sie bei der tansanischen EinwanderungsbehÃ¶rde.',notfound:'Ich habe in den Dokumenten nicht genÃ¼gend Informationen gefunden.',page:'Seite',lead:'Laut Dokument:'},
    pt:{welcome:'Bem-vindo! Estou aqui para ajudar.',intro:'Pergunte sobre vistos, passaportes, autorizaÃ§Ãµes de residÃªncia ou cidadania.',placeholder:'Escreva a sua pergunta...',online:'Online',day:'Hoje',auto:'Idioma: AutomÃ¡tico',disclaimer:'Este Ã© um resumo. Confirme junto ao Departamento de ImigraÃ§Ã£o da TanzÃ¢nia.',notfound:'NÃ£o encontrei informaÃ§Ã£o suficiente nos documentos.',page:'pÃ¡gina',lead:'Segundo o documento:'},
    it:{welcome:'Benvenuto! Sono qui per aiutarti.',intro:'Chiedi informazioni su visti, passaporti, permessi di soggiorno o cittadinanza.',placeholder:'Scrivi la tua domanda...',online:'Online',day:'Oggi',auto:'Lingua: Automatica',disclaimer:"Questo Ã¨ un riepilogo. Verificalo con il Dipartimento dellâ€™immigrazione della Tanzania.",notfound:'Non ho trovato informazioni sufficienti nei documenti.',page:'pagina',lead:'Secondo il documento:'},
    ar:{welcome:'Ù…Ø±Ø­Ø¨Ø§Ù‹! Ø£Ù†Ø§ Ù‡Ù†Ø§ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ.',intro:'Ø§Ø³Ø£Ù„ Ø¹Ù† Ø§Ù„ØªØ£Ø´ÙŠØ±Ø§Øª Ø£Ùˆ Ø¬ÙˆØ§Ø²Ø§Øª Ø§Ù„Ø³ÙØ± Ø£Ùˆ ØªØµØ§Ø±ÙŠØ­ Ø§Ù„Ø¥Ù‚Ø§Ù…Ø© Ø£Ùˆ Ø§Ù„Ø¬Ù†Ø³ÙŠØ©.',placeholder:'Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ...',online:'Ù…ØªØµÙ„',day:'Ø§Ù„ÙŠÙˆÙ…',auto:'Ø§Ù„Ù„ØºØ©: ØªÙ„Ù‚Ø§Ø¦ÙŠ',disclaimer:'Ù‡Ø°Ù‡ Ø®Ù„Ø§ØµØ©. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù†Ù‡Ø§ Ù„Ø¯Ù‰ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù‡Ø¬Ø±Ø© ÙÙŠ ØªÙ†Ø²Ø§Ù†ÙŠØ§.',notfound:'Ù„Ù… Ø£Ø¬Ø¯ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙƒØ§ÙÙŠØ© ÙÙŠ Ø§Ù„ÙˆØ«Ø§Ø¦Ù‚.',page:'Ø§Ù„ØµÙØ­Ø©',lead:'ÙˆÙÙ‚Ø§Ù‹ Ù„Ù„ÙˆØ«ÙŠÙ‚Ø©:'},
    ur:{welcome:'Ø®ÙˆØ´ Ø¢Ù…Ø¯ÛŒØ¯! Ù…ÛŒÚº Ù…Ø¯Ø¯ Ú©Û’ Ù„ÛŒÛ’ Ø­Ø§Ø¶Ø± ÛÙˆÚºÛ”',intro:'ÙˆÛŒØ²Ø§ØŒ Ù¾Ø§Ø³Ù¾ÙˆØ±Ù¹ØŒ Ø±ÛØ§Ø¦Ø´ÛŒ Ø§Ø¬Ø§Ø²Øª Ù†Ø§Ù…Û’ ÛŒØ§ Ø´ÛØ±ÛŒØª Ú©Û’ Ø¨Ø§Ø±Û’ Ù…ÛŒÚº Ù¾ÙˆÚ†Ú¾ÛŒÚºÛ”',placeholder:'Ø§Ù¾Ù†Ø§ Ø³ÙˆØ§Ù„ Ù„Ú©Ú¾ÛŒÚº...',online:'Ø¢Ù† Ù„Ø§Ø¦Ù†',day:'Ø¢Ø¬',auto:'Ø²Ø¨Ø§Ù†: Ø®ÙˆØ¯Ú©Ø§Ø±',disclaimer:'ÛŒÛ Ø®Ù„Ø§ØµÛ ÛÛ’Û” ØªÙ†Ø²Ø§Ù†ÛŒÛ Ø§Ù…ÛŒÚ¯Ø±ÛŒØ´Ù† ÚˆÛŒÙ¾Ø§Ø±Ù¹Ù…Ù†Ù¹ Ø³Û’ ØªØµØ¯ÛŒÙ‚ Ú©Ø±ÛŒÚºÛ”',notfound:'Ø¯Ø³ØªØ§ÙˆÛŒØ²Ø§Øª Ù…ÛŒÚº Ú©Ø§ÙÛŒ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù†ÛÛŒÚº Ù…Ù„ÛŒÚºÛ”',page:'ØµÙØ­Û',lead:'Ø¯Ø³ØªØ§ÙˆÛŒØ² Ú©Û’ Ù…Ø·Ø§Ø¨Ù‚:'},
    hi:{welcome:'à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ! à¤®à¥ˆà¤‚ à¤†à¤ªà¤•à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤¯à¤¹à¤¾à¤ à¤¹à¥‚à¤à¥¤',intro:'à¤µà¥€à¤œà¤¼à¤¾, à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ, à¤¨à¤¿à¤µà¤¾à¤¸ à¤ªà¤°à¤®à¤¿à¤Ÿ à¤¯à¤¾ à¤¨à¤¾à¤—à¤°à¤¿à¤•à¤¤à¤¾ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤ªà¥‚à¤›à¥‡à¤‚à¥¤',placeholder:'à¤…à¤ªà¤¨à¤¾ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤²à¤¿à¤–à¥‡à¤‚...',online:'à¤‘à¤¨à¤²à¤¾à¤‡à¤¨',day:'à¤†à¤œ',auto:'à¤­à¤¾à¤·à¤¾: à¤¸à¥à¤µà¤šà¤¾à¤²à¤¿à¤¤',disclaimer:'à¤¯à¤¹ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤¹à¥ˆà¥¤ à¤¤à¤‚à¤œà¤¼à¤¾à¤¨à¤¿à¤¯à¤¾ à¤†à¤µà¥à¤°à¤œà¤¨ à¤µà¤¿à¤­à¤¾à¤— à¤¸à¥‡ à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤•à¤°à¥‡à¤‚à¥¤',notfound:'à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼à¥‹à¤‚ à¤®à¥‡à¤‚ à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¥€à¥¤',page:'à¤ªà¥ƒà¤·à¥à¤ ',lead:'à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼ à¤•à¥‡ à¤…à¤¨à¥à¤¸à¤¾à¤°:'},
    zh:{welcome:'æ¬¢è¿Žï¼æˆ‘éšæ—¶ä¸ºæ‚¨æä¾›å¸®åŠ©ã€‚',intro:'æ‚¨å¯ä»¥è¯¢é—®ç­¾è¯ã€æŠ¤ç…§ã€å±…ç•™è®¸å¯æˆ–å…¬æ°‘èº«ä»½ã€‚',placeholder:'è¯·è¾“å…¥æ‚¨çš„é—®é¢˜...',online:'åœ¨çº¿',day:'ä»Šå¤©',auto:'è¯­è¨€ï¼šè‡ªåŠ¨',disclaimer:'æ­¤ä¿¡æ¯ä¸ºæ‘˜è¦ï¼Œè¯·å‘å¦æ¡‘å°¼äºšç§»æ°‘å±€æ ¸å®žã€‚',notfound:'åœ¨æ–‡ä»¶ä¸­æœªæ‰¾åˆ°è¶³å¤Ÿçš„ä¿¡æ¯ã€‚',page:'é¡µ',lead:'æ ¹æ®æ–‡ä»¶ï¼š'},
    ru:{welcome:'Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ! Ð¯ Ð³Ð¾Ñ‚Ð¾Ð² Ð¿Ð¾Ð¼Ð¾Ñ‡ÑŒ.',intro:'Ð¡Ð¿Ñ€Ð¾ÑÐ¸Ñ‚Ðµ Ð¾ Ð²Ð¸Ð·Ð°Ñ…, Ð¿Ð°ÑÐ¿Ð¾Ñ€Ñ‚Ð°Ñ…, Ð²Ð¸Ð´Ð°Ñ… Ð½Ð° Ð¶Ð¸Ñ‚ÐµÐ»ÑŒÑÑ‚Ð²Ð¾ Ð¸Ð»Ð¸ Ð³Ñ€Ð°Ð¶Ð´Ð°Ð½ÑÑ‚Ð²Ðµ.',placeholder:'Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð²Ð¾Ð¿Ñ€Ð¾Ñ...',online:'Ð’ ÑÐµÑ‚Ð¸',day:'Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ',auto:'Ð¯Ð·Ñ‹Ðº: Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸',disclaimer:'Ð­Ñ‚Ð¾ ÐºÑ€Ð°Ñ‚ÐºÐ¾Ðµ Ð¸Ð·Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ. Ð£Ñ‚Ð¾Ñ‡Ð½Ð¸Ñ‚Ðµ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸ÑŽ Ð² Ð˜Ð¼Ð¼Ð¸Ð³Ñ€Ð°Ñ†Ð¸Ð¾Ð½Ð½Ð¾Ð¼ Ð´ÐµÐ¿Ð°Ñ€Ñ‚Ð°Ð¼ÐµÐ½Ñ‚Ðµ Ð¢Ð°Ð½Ð·Ð°Ð½Ð¸Ð¸.',notfound:'Ð’ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð°Ñ… Ð½ÐµÐ´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ð¸.',page:'ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ð°',lead:'Ð¡Ð¾Ð³Ð»Ð°ÑÐ½Ð¾ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñƒ:'},
    tr:{welcome:'HoÅŸ geldiniz! YardÄ±m etmek iÃ§in buradayÄ±m.',intro:'Vize, pasaport, oturma izni veya vatandaÅŸlÄ±k hakkÄ±nda sorun.',placeholder:'Sorunuzu yazÄ±n...',online:'Ã‡evrimiÃ§i',day:'BugÃ¼n',auto:'Dil: Otomatik',disclaimer:'Bu bir Ã¶zettir. Tanzanya GÃ¶Ã§menlik Dairesi ile doÄŸrulayÄ±n.',notfound:'Belgelerde yeterli bilgi bulamadÄ±m.',page:'sayfa',lead:'Belgeye gÃ¶re:'}
  };
  var panel=document.createElement('section'); panel.className='ua-panel'; panel.id='uhamiaji-ai-panel'; panel.setAttribute('aria-label','Mr. HamaHama immigration chatbot');
  panel.innerHTML='<header class="ua-head"><div class="ua-mark"><img src="'+base+'assets/mr-hamahama.png" alt="Mr. HamaHama"></div><div class="ua-title"><strong>Mr. HamaHama</strong><span>Your Immigration Assistant!</span><span class="ua-status"><i></i> <b data-online>Mtandaoni</b></span></div><button class="ua-icon-btn" data-min aria-label="Punguza">'+icon('minus')+'</button><button class="ua-icon-btn" data-close aria-label="Funga">'+icon('close')+'</button></header><main class="ua-chat"><div class="ua-welcome"><h2>Karibu! Nipo hapa kwa ajili yako.</h2><p>Uliza swali kuhusu visa, pasipoti, vibali vya kuishi, uraia au huduma nyingine za Uhamiaji.</p></div><div class="ua-actions"><button class="ua-action" data-q="Nieleze kuhusu visa za Tanzania">'+icon('passport')+'Visa</button><button class="ua-action" data-q="Ninaombaje pasipoti ya Tanzania?">'+icon('passport')+'Pasipoti</button><button class="ua-action" data-q="Nahitaji kibali gani cha kuishi?">'+icon('permit')+'Vibali vya kuishi</button><button class="ua-action" data-q="Nieleze kuhusu uraia wa Tanzania">'+icon('people')+'Uraia</button></div><div class="ua-day">Leo</div><div class="ua-messages"></div></main><footer class="ua-compose"><div class="ua-compose-box"><textarea rows="1" placeholder="Andika swali lako..." aria-label="Andika swali lako"></textarea><button class="ua-send" aria-label="Tuma">'+icon('send')+'</button></div><div class="ua-powered">Powered by <b>Ngosha Multimedia</b> · <b>NgoshaChatBot AI</b> Agent</div></footer>';
  var launcher=document.createElement('button'); launcher.className='ua-launcher'; launcher.setAttribute('aria-label','Ask Me! Open Mr. HamaHama'); launcher.innerHTML='<span class="ua-launch-logo"><img src="'+base+'assets/mr-hamahama.png" alt=""><i class="ua-notify"></i></span><span class="ua-launch-copy"><strong>Ask Me!</strong><small>Mr. HamaHama</small></span>'+icon('chat');
  document.body.appendChild(panel); document.body.appendChild(launcher);

  var messages=panel.querySelector('.ua-messages'), chat=panel.querySelector('.ua-chat'), input=panel.querySelector('textarea'), activeLang='sw', greeted=false, conversation=[];
  var faqPromise=fetch(base+'faq-data.json').then(function(response){if(!response.ok)throw new Error('FAQ unavailable');return response.json()}).then(function(items){if(!Array.isArray(items))throw new Error('Invalid FAQ');return items}).catch(function(){return null});
  function detect(text){
    if(/[\u3040-\u30ff]/.test(text))return'ja'; if(/[\uac00-\ud7af]/.test(text))return'ko'; if(/[\u4e00-\u9fff]/.test(text))return'zh';
    if(/[\u0900-\u097f]/.test(text))return'hi'; if(/[\u0980-\u09ff]/.test(text))return'bn'; if(/[\u0b80-\u0bff]/.test(text))return'ta'; if(/[\u0c00-\u0c7f]/.test(text))return'te'; if(/[\u0a80-\u0aff]/.test(text))return'gu'; if(/[\u0a00-\u0a7f]/.test(text))return'pa';
    if(/[\u0400-\u04ff]/.test(text))return'ru'; if(/[\u0370-\u03ff]/.test(text))return'el'; if(/[\u0590-\u05ff]/.test(text))return'he'; if(/[\u0e00-\u0e7f]/.test(text))return'th'; if(/[\u1200-\u137f]/.test(text))return'am';
    if(/[\u0600-\u06ff]/.test(text))return /[Û’Ú©Ú¯ÚºÚ¾]/.test(text)?'ur':'ar';
    if(/\b(nani|gani|ni ya|kwa nini|inahitajika|nahitaji|gharama|ada|bei|yake|masharti|viambato)\b/i.test(text))return'sw';
    var t=(' '+text.toLowerCase()+' '); var tests={sw:[' nini ',' kuhusu ',' naomba ',' nataka ',' pasipoti ',' kibali ',' uraia ',' habari '],fr:[' bonjour ',' visa pour ',' passeport ',' citoyennetÃ© ',' permis de sÃ©jour ',' comment '],es:[' hola ',' visado ',' pasaporte ',' ciudadanÃ­a ',' permiso ',' cÃ³mo '],de:[' hallo ',' visum ',' reisepass ',' aufenthalt ',' wie '],pt:[' olÃ¡ ',' visto ',' passaporte ',' cidadania ',' como '],it:[' ciao ',' visto ',' passaporto ',' cittadinanza ',' come '],tr:[' merhaba ',' vize ',' pasaport ',' vatandaÅŸlÄ±k ',' nasÄ±l ']};
    tests.nl=[' hallo ',' visum ',' paspoort ',' verblijf ',' hoe '];tests.pl=[' witam ',' wiza ',' paszport ',' obywatelstwo ',' jak '];tests.id=[' halo ',' visa ',' paspor ',' izin tinggal ',' bagaimana '];tests.ms=[' hai ',' visa ',' pasport ',' permit tinggal ',' bagaimana '];tests.vi=[' xin chÃ o ',' thá»‹ thá»±c ',' há»™ chiáº¿u ',' cÆ° trÃº ',' nhÆ° tháº¿ nÃ o '];
    var best='en',score=0;Object.keys(tests).forEach(function(code){var s=tests[code].reduce(function(n,w){return n+(t.indexOf(w)>-1?1:0)},0);if(s>score){best=code;score=s}});return best;
  }
  function setLanguage(code){activeLang=code||'en';var l=ui[activeLang]||ui.en;panel.dir=(activeLang==='ar'||activeLang==='ur'||activeLang==='he')?'rtl':'ltr';panel.querySelector('.ua-welcome h2').textContent=l.welcome;panel.querySelector('.ua-welcome p').textContent=l.intro;panel.querySelector('[data-online]').textContent=l.online;panel.querySelector('.ua-day').textContent=l.day;input.placeholder=l.placeholder;input.setAttribute('lang',activeLang);localizeActions()}
  var stop={na:1,ya:1,wa:1,za:1,vya:1,yangu:1,ni:1,kwa:1,kuhusu:1,nini:1,how:1,the:1,and:1,for:1,what:1,about:1,do:1,can:1,please:1,my:1,to:1,i:1,a:1};
  function words(text){return (text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z]+/g)?.map(function(word){return ({viza:'visa',visas:'visa',pasipoti:'passport',passports:'passport',ninataka:'nataka',nahitaji:'nataka',naomba:'nataka',ninaomba:'nataka'}[word]||word)}).filter(function(word){return !stop[word]})||[]}
  function topic(text){if(/\b(pasipoti|passport|passports)\b/i.test(text))return'passport';if(/\b(visa|viza|visas)\b/i.test(text))return'visa';if(/\b(residence|permit|kibali|vibali)\b/i.test(text))return'residence';if(/\b(citizenship|uraia)\b/i.test(text))return'citizenship';return''}
  function matchFaq(question,items){
    var query=[...new Set(words(question))],askedTopic=topic(question);
    if(query.length<2)return null;
    var ranked=items.filter(function(item){return item.status==='source_checked'&&(!askedTopic||item.topic===askedTopic)}).map(function(item){
      var best=0;item.questions.forEach(function(alias){var candidate=[...new Set(words(alias))],overlap=query.filter(function(word){return candidate.includes(word)}).length;if(overlap>=2)best=Math.max(best,2*overlap/(query.length+candidate.length))});return {item:item,score:best}
    }).sort(function(a,b){return b.score-a.score});
    return ranked.length&&ranked[0].score>=0.68&&(!ranked[1]||ranked[0].score-ranked[1].score>=0.08)?ranked[0].item:null
  }

  var passportPictures=[
    {file:'passport-ordinary.png',sw:'Pasipoti ya Kawaida',en:'Ordinary Passport',match:/\b(ordinary|kawaida)\b/i},
    {file:'passport-diplomatic.jpg',sw:'Pasipoti ya Kidiplomasia',en:'Diplomatic Passport',match:/\b(diplomatic|kidiplomasia|diplomasia)\b/i},
    {file:'passport-service.jpg',sw:'Pasipoti ya Utumishi',en:'Service Passport',match:/\b(service|utumishi)\b/i}
  ];
  function passportSelection(q){
    if(!/\b(pasipoti|passports?)\b/i.test(q))return [];
    var selected=passportPictures.filter(function(p){return p.match.test(q)});
    return selected.length?selected:(/\b(aina|types?|picha|pictures?|onyesha|show)\b/i.test(q)?passportPictures:[]);
  }
  function showPassportPictures(box,q){
    var selected=passportSelection(q);if(!selected.length)return;
    var grid=document.createElement('div');grid.className='ua-passport-gallery';
    selected.forEach(function(p){
      var label=activeLang==='sw'?p.sw:p.en,button=document.createElement('button'),img=document.createElement('img'),caption=document.createElement('span');
      button.type='button';button.className='ua-passport-card';button.setAttribute('aria-label',label+(activeLang==='sw'?' — Kuza picha':' — Enlarge image'));
      img.src=base+'assets/'+p.file;img.alt=label;img.loading='lazy';caption.textContent=label;
      button.append(img,caption);grid.appendChild(button);
      button.onclick=function(){
        var dialog=document.createElement('dialog');dialog.className='ua-passport-dialog';dialog.setAttribute('aria-label',label);
        var close=document.createElement('button'),large=document.createElement('img'),title=document.createElement('p');
        close.type='button';close.textContent=activeLang==='sw'?'Funga':'Close';large.src=img.src;large.alt=label;title.textContent=label;
        dialog.append(close,large,title);document.body.appendChild(dialog);
        close.onclick=function(){dialog.close()};dialog.onclick=function(e){if(e.target===dialog)dialog.close()};
        dialog.addEventListener('close',function(){dialog.remove();button.focus()},{once:true});dialog.showModal();close.focus();
      };
    });box.appendChild(grid);
  }

  function localizeActions(){
    var sw=activeLang==='sw',labels=sw?['Visa','Pasipoti','Vibali vya kuishi','Uraia']:['Visa','Passport','Residence permits','Citizenship'];
    var questions=sw?['jinsi ya kuomba visa','jinsi ya kuomba pasipoti','aina za vibali vya kuishi','Nieleze kuhusu uraia wa Tanzania']:['How to apply for visa','How do I apply for a passport','Types of residence permits','Tell me about Tanzanian citizenship'];
    panel.querySelectorAll('.ua-action').forEach(function(b,i){b.dataset.q=questions[i];while(b.childNodes.length>1)b.removeChild(b.lastChild);b.appendChild(document.createTextNode(labels[i]));});
  }
  async function answer(q){
    if(passportSelection(q).length===3 && /\b(aina|types?|picha|pictures?|onyesha|show)\b/i.test(q) && !/\b(ada|fee|cost|requirements|masharti)\b/i.test(q))return {text:activeLang==='sw'?'Aina hizi tatu ni Pasipoti ya Kawaida, Pasipoti ya Kidiplomasia na Pasipoti ya Utumishi. Bofya picha yoyote kuikuza.':'These three types are the Ordinary Passport, Diplomatic Passport and Service Passport. Select an image to enlarge it.'};
    var sw=activeLang==='sw',knownTopic=topic(q);
    if(/^(hello|hi|hey|habari|hujambo|mambo)(\s+mkuu)?[!. ]*$/i.test(q))return{text:sw?'Karibu! Mimi ni Mr. HamaHama. Nikusaidie kuhusu huduma gani ya Uhamiaji?':'Welcome! I am Mr. HamaHama. Which immigration service can I help you with?'};
    if(/\b(ada|gharama|bei|fee|fees|cost|price)\b/i.test(q))return{text:sw?'Ada zinahitaji uthibitisho wa sasa. Tafadhali wasiliana na info@immigration.go.tz na utaje huduma unayoomba.':'Fees need current confirmation. Please contact info@immigration.go.tz and specify the service you are applying for.'};
    if(!knownTopic&&/\b(yake|its|it|masharti|requirements|viambato)\b/i.test(q)){for(var i=conversation.length-1;i>=0;i--){if(conversation[i].role==='user'&&(knownTopic=topic(conversation[i].content)))break}}
    var items=await faqPromise;if(!items)return{text:sw?'Taarifa za majibu hazijapakiwa kwa sasa. Tafadhali jaribu tena au wasiliana na info@immigration.go.tz.':'The answer data could not load. Please try again or contact info@immigration.go.tz.'};
    var entry=matchFaq(q,items);if(!entry&&knownTopic&&/\b(yake|its|it|masharti|requirements|viambato)\b/i.test(q))entry=matchFaq(knownTopic+' '+q,items);if(entry)return{text:entry.answers[sw?'sw':'en']};
    if(knownTopic==='visa')return{text:sw?'Unaulizia kuomba visa, kufuatilia ombi au masharti gani? Nieleze kidogo zaidi. Kwa msaada zaidi: info@immigration.go.tz.':'Are you asking about applying, tracking or particular visa requirements? Please tell me more. Further help: info@immigration.go.tz.'};
    return{text:sw?'Sina jibu lililohakikiwa kwa swali hilo bado. Tafadhali eleza zaidi au wasiliana na Idara ya Uhamiaji kupitia info@immigration.go.tz.':'I do not yet have a verified answer for that question. Please give more detail or contact the Tanzania Immigration Department at info@immigration.go.tz.'}
  }
  async function add(q){
    q=(q||'').trim();if(!q)return;setLanguage(detect(q));messages.insertAdjacentHTML('beforeend','<div class="ua-message user"></div>');messages.lastElementChild.textContent=q;input.value='';var typing=document.createElement('div');typing.className='ua-typing';typing.setAttribute('role','status');typing.setAttribute('aria-live','polite');typing.setAttribute('aria-label','Mr. HamaHama anaandika');typing.innerHTML='<span class="ua-typing-avatar" aria-hidden="true"><img src="'+base+'assets/mr-hamahama.png" alt=""></span><span class="ua-typing-label">Mr. HamaHama anaandika</span><span class="ua-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>';var label=activeLang==='sw'?'Mr. HamaHama anaandika':'Mr. HamaHama is typing';typing.setAttribute('aria-label',label);typing.querySelector('.ua-typing-label').textContent=label;messages.appendChild(typing);chat.scrollTop=chat.scrollHeight;
    var pending=await Promise.all([answer(q),new Promise(function(resolve){setTimeout(resolve,550)})]),a=pending[0],locale=ui[activeLang]||ui.en;conversation.push({role:'user',content:q},{role:'assistant',content:a.text});conversation=conversation.slice(-8);typing.remove();var box=document.createElement('div');box.className='ua-message bot ua-answer';box.innerHTML='<p></p>';box.querySelector('p').textContent=a.text;messages.appendChild(box);showPassportPictures(box,q);var note=document.createElement('div');note.className='ua-disclaimer';note.innerHTML=icon('info')+'<span></span>';note.querySelector('span').textContent=locale.disclaimer;messages.appendChild(note);chat.scrollTop=chat.scrollHeight;
  }
  function greet(){if(greeted)return;greeted=true;var l=ui[activeLang]||ui.en;var hello=document.createElement('div');hello.className='ua-message bot ua-answer ua-greeting';hello.textContent=l.welcome+' '+l.intro;messages.appendChild(hello);chat.scrollTop=chat.scrollHeight}
  function toggle(show){panel.hidden=!show;launcher.style.display=show?'none':'flex';if(show){greet();setTimeout(function(){input.focus()},50)}}
  launcher.onclick=function(){toggle(true)};panel.querySelector('[data-close]').onclick=function(){toggle(false)};panel.querySelector('[data-min]').onclick=function(){toggle(false)};panel.querySelector('.ua-send').onclick=function(){add(input.value)};input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();add(input.value)}});panel.querySelectorAll('.ua-action').forEach(function(b){b.onclick=function(){add(b.dataset.q)}});
  var browserLang=((navigator.language||'sw').split('-')[0]||'sw').toLowerCase();setLanguage(browserLang);toggle(script&&script.dataset.open==='true');
})();
