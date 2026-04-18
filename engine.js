// Uhamiaji Chatbot — pure JavaScript engine (no server).
// Knowledge for 9 languages is embedded below. Everything runs in the browser.
(function (global) {
'use strict';

// ========== LANGUAGE DETECTION ==========
function detectLang(q) {
  if (!q) return 'en';
  if (/[\u4e00-\u9fff]/.test(q)) return 'zh';
  if (/[\u0900-\u097f]/.test(q)) return 'hi';
  if (/[\u0600-\u06ff\u0750-\u077f]/.test(q)) {
    if (/[\u06BA\u06D2\u0688\u0691\u0679\u06C1\u06D4]/.test(q)) return 'ur';
    return 'ar';
  }
  var qlc = q.toLowerCase();
  if (/[äöüß]/.test(qlc) || /\b(was ist|wie kann|welche|ausländer|visum|staatsbürgerschaft|reisepass|aufenthalt|gebühr|einwanderung)\b/.test(qlc)) return 'de';
  if (/[àâçéèêëîïôùûœ]/.test(qlc) || /\b(qu'est-ce|comment|quels|étranger|citoyenneté|passeport|permis|séjour|frais|immigration|tanzanie)\b/.test(qlc)) return 'fr';
  if (/[áéíñóúü¿¡]/.test(qlc) || /\b(qué es|cómo|cuáles|extranjero|ciudadanía|pasaporte|permiso|residencia|tarifa|inmigración)\b/.test(qlc)) return 'es';
  if (/\b(ni nini|jinsi|aina|uraia|pasipoti|vibali|kibali|ada|ninahitaji|habari|karibu|mkuu|kiasi|nieleze|fafanua)\b/.test(qlc)) return 'sw';
  return 'en';
}

// ========== TOPIC + INTENT ==========
function detectTopic(q) {
  var map = [
    ['签证','visa'],['国籍','citizenship'],['护照','passport'],['居留','permit'],['移民','immigration'],
    ['تأشيرة','visa'],['جنسية','citizenship'],['جواز','passport'],['إقامة','permit'],['تصريح','permit'],['هجرة','immigration'],
    ['वीज़ा','visa'],['नागरिकता','citizenship'],['पासपोर्ट','passport'],['निवास','permit'],['परमिट','permit'],['आप्रवासन','immigration'],
    ['ویزا','visa'],['شہریت','citizenship'],['پاسپورٹ','passport'],['رہائش','permit'],['امیگریشن','immigration']
  ];
  for (var i = 0; i < map.length; i++) if (q.indexOf(map[i][0]) !== -1) return map[i][1];
  if (/\b(visa|visado|visum|biashara|transit|gratis|ordinary|tourist|business)\b/i.test(q)) return 'visa';
  if (/\b(citizen|citizenship|uraia|raia|naturalis|citoyen|ciudadan|staatsb)\b/i.test(q)) return 'citizenship';
  if (/\b(passport|pasipoti|passeport|pasaporte|reisepass)\b/i.test(q)) return 'passport';
  if (/\b(permit|residence permit|kibali|vibali|work permit|séjour|sejour|residencia|aufenthalt|class [abc])\b/i.test(q)) return 'permit';
  if (/\b(immigration|uhamiaji|inmigrac|einwanderung|cap\s*54)\b/i.test(q)) return 'immigration';
  return null;
}

function detectIntent(q) {
  var qlc = q.toLowerCase();
  var signals = {
    fees:['费用','多少','رسوم','كم','शुल्क','कितना','फीस','فیس','کتنا'],
    types:['种类','类型','أنواع','प्रकार','اقسام'],
    application:['申请','如何','تقديم','كيف','आवेदन','कैसे','درخواست','کیسے'],
    validity:['有效','期限','صلاحية','मान्यता','میعاد'],
    authority:['谁','من يصدر','السلطة','कौन','अधिकारी','کون']
  };
  for (var intent in signals) {
    for (var i = 0; i < signals[intent].length; i++) {
      if (q.indexOf(signals[intent][i]) !== -1) return intent;
    }
  }
  if (/\b(fee|cost|price|how much|ada|gharama|bei|kiasi|frais|combien|tarifa|cuanto|cuánto|gebuhr|gebühr|wie viel)\b/i.test(qlc)) return 'fees';
  if (/\b(types?|kind|aina|class|genre|tipo|clase|art|arten)\b/i.test(qlc)) return 'types';
  if (/\b(apply|application|how to|jinsi|procedure|mahitaji|utaratibu|demander|comment|solicitar|como|cómo|beantragen|wie bekommt)\b/i.test(qlc)) return 'application';
  if (/\b(valid|validity|expire|muda|renew|duree|durée|validite|validité|validez|gultig|gültig)\b/i.test(qlc)) return 'validity';
  if (/\b(who|authority|commissioner|nani|anayetoa|qui|autorite|autorité|quien|quién|wer|behorde|behörde)\b/i.test(qlc)) return 'authority';
  if (/\b(what is|define|definition|maana|ni nini|nieleze|qu.est-ce|que es|qué es|是什么|ما هو|क्या है|کیا ہے|was ist)\b/i.test(qlc)) return 'definition';
  if (/\b(prohibited|marufuku|禁止|ممنوع|निषिद्ध|interdit|prohibido|verboten)\b/i.test(qlc)) return 'prohibited';
  return 'overview';
}

// ========== KNOWLEDGE ==========
var KB = window.UHAMIAJI_KB || {};

// ========== SMALL TALK ==========
function smallTalk(q, lang) {
  var qlc = q.toLowerCase();
  var greetings = ['hi','hello','hey','habari','mambo','shikamoo','hujambo','jambo','morning','asubuhi','evening','mchana','salama','你好','您好','مرحبا','أهلا','السلام عليكم','नमस्ते','नमस्कार','سلام','ہیلو','bonjour','salut','bonsoir','hola','buenos','hallo','guten'];
  for (var i = 0; i < greetings.length; i++) {
    if (q.indexOf(greetings[i]) !== -1 || qlc.indexOf(greetings[i]) !== -1) {
      return { answer: GREETINGS[lang] || GREETINGS.en };
    }
  }
  var thanks = ['thanks','thank you','asante','ahsante','shukrani','谢谢','شكرا','धन्यवाद','شکریہ','merci','gracias','danke'];
  for (var i = 0; i < thanks.length; i++) if (qlc.indexOf(thanks[i]) !== -1) return { answer: THANKS[lang] || THANKS.en };
  var bye = ['bye','goodbye','kwaheri','再见','وداعا','अलविदा','خدا حافظ','au revoir','adiós','auf wiedersehen'];
  for (var i = 0; i < bye.length; i++) if (qlc.indexOf(bye[i]) !== -1) return { answer: BYES[lang] || BYES.en };
  if (/\b(who are you|wewe ni nani|what are you|你是谁|من أنت|क्या हो|tum kaun|qui es-tu|quién eres|wer bist du)\b/i.test(qlc)) {
    return { answer: ABOUT[lang] || ABOUT.en };
  }
  return null;
}

var GREETINGS = {
  en: '<p>Hello! 👋 Welcome to Uhamiaji Chatbot. I can help you understand Tanzania immigration law. What would you like to know?</p>',
  sw: '<p>Habari! 👋 Karibu Uhamiaji Chatbot. Naweza kukusaidia kuelewa sheria za uhamiaji wa Tanzania. Ungependa kujua nini?</p>',
  zh: '<p>您好！👋 欢迎使用乌哈米亚吉聊天机器人。我可以帮助您了解坦桑尼亚的移民法。您想了解什么？</p>',
  ar: '<p>مرحبًا! 👋 أهلاً بك في روبوت أوهاميّاجي. يمكنني مساعدتك في فهم قانون الهجرة التنزاني. ماذا تود أن تعرف؟</p>',
  hi: '<p>नमस्ते! 👋 उहामियाजी चैटबॉट में स्वागत है। मैं तंज़ानिया के प्रवासन कानून में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?</p>',
  ur: '<p>السلام علیکم! 👋 اُہامیاجی چیٹ بوٹ میں خوش آمدید۔ میں تنزانیہ کے امیگریشن قانون میں مدد کر سکتا ہوں۔</p>',
  fr: '<p>Bonjour ! 👋 Bienvenue sur Uhamiaji Chatbot. Je peux vous aider avec le droit tanzanien de l\'immigration.</p>',
  es: '<p>¡Hola! 👋 Bienvenido a Uhamiaji Chatbot. Puedo ayudarte con la ley de inmigración de Tanzania.</p>',
  de: '<p>Hallo! 👋 Willkommen bei Uhamiaji Chatbot. Ich helfe beim tansanischen Einwanderungsrecht.</p>'
};
var THANKS = {
  en:'<p>You are most welcome! Ask anytime.</p>', sw:'<p>Karibu sana! Uliza wakati wowote.</p>',
  zh:'<p>不客气！随时提问。</p>', ar:'<p>العفو! اسأل في أي وقت.</p>',
  hi:'<p>आपका स्वागत है!</p>', ur:'<p>خوش آمدید!</p>',
  fr:'<p>Je vous en prie !</p>', es:'<p>¡De nada!</p>', de:'<p>Gern geschehen!</p>'
};
var BYES = {
  en:'<p>Goodbye! 👋 Come back anytime.</p>', sw:'<p>Kwaheri! 👋 Karibu tena.</p>',
  zh:'<p>再见！👋</p>', ar:'<p>مع السلامة! 👋</p>',
  hi:'<p>अलविदा! 👋</p>', ur:'<p>خدا حافظ! 👋</p>',
  fr:'<p>Au revoir ! 👋</p>', es:'<p>¡Adiós! 👋</p>', de:'<p>Auf Wiedersehen! 👋</p>'
};
var ABOUT = {
  en:'<p>I am <strong>Uhamiaji Chatbot</strong> — a Tanzania immigration law assistant, in 9 languages.</p>',
  sw:'<p>Mimi ni <strong>Uhamiaji Chatbot</strong> — msaidizi wa sheria za uhamiaji wa Tanzania, kwa lugha 9.</p>',
  zh:'<p>我是 <strong>乌哈米亚吉聊天机器人</strong>，坦桑尼亚移民法助手，支持9种语言。</p>',
  ar:'<p>أنا <strong>روبوت أوهاميّاجي</strong> — مساعد قانون الهجرة التنزاني، بتسع لغات.</p>',
  hi:'<p>मैं <strong>उहामियाजी चैटबॉट</strong> हूँ — तंज़ानिया प्रवासन कानून सहायक, 9 भाषाओं में।</p>',
  ur:'<p>میں <strong>اُہامیاجی چیٹ بوٹ</strong> ہوں، تنزانیہ امیگریشن قانون کا معاون، 9 زبانوں میں۔</p>',
  fr:'<p>Je suis <strong>Uhamiaji Chatbot</strong>, assistant tanzanien d\'immigration en 9 langues.</p>',
  es:'<p>Soy <strong>Uhamiaji Chatbot</strong>, asistente de inmigración de Tanzania en 9 idiomas.</p>',
  de:'<p>Ich bin <strong>Uhamiaji Chatbot</strong>, Assistent für tansanisches Einwanderungsrecht in 9 Sprachen.</p>'
};

// ========== ANSWER BUILDER ==========
function buildAnswer(topic, intent, lang) {
  var entry = (KB[topic] && (KB[topic][lang] || KB[topic].en));
  if (!entry) return null;
  var html = '';

  if (intent === 'fees' && entry.fees_default) {
    html += '<p>' + feesIntro(lang) + '</p>' + feesTable(entry.fees_default, lang);
  } else if (intent === 'types' && entry.types) {
    html += '<p>' + typesIntro(lang) + '</p><ul>';
    for (var i = 0; i < entry.types.length; i++) {
      html += '<li><strong>' + esc(entry.types[i][0]) + '</strong> — ' + esc(entry.types[i][1]) + '</li>';
    }
    html += '</ul>';
  } else if (intent === 'application' && entry.application) {
    html += '<p>' + entry.application + '</p>';
  } else if (intent === 'validity' && entry.validity) {
    html += '<p>' + entry.validity + '</p>';
  } else if (intent === 'authority' && entry.authority) {
    html += '<p>' + entry.authority + '</p>';
  } else {
    html += '<p>' + entry.def + '</p>';
    if (entry.types) {
      html += '<p>' + typesIntro(lang) + '</p><ul>';
      for (var j = 0; j < entry.types.length; j++) {
        html += '<li><strong>' + esc(entry.types[j][0]) + '</strong> — ' + esc(entry.types[j][1]) + '</li>';
      }
      html += '</ul>';
    }
  }
  if (entry.follow) html += '<p>' + entry.follow + '</p>';
  return html;
}

function feesIntro(lang) {
  return ({
    en:'The fees are set in the Schedule of the regulations, payable in US dollars.',
    sw:'Ada zimeorodheshwa kwenye Schedule ya kanuni, hulipwa kwa Dola za Kimarekani.',
    zh:'费用在法规附表中列明，以美元支付。', ar:'الرسوم محددة بالدولار الأمريكي.',
    hi:'शुल्क अमेरिकी डॉलर में देय हैं।', ur:'فیس امریکی ڈالر میں ہے۔',
    fr:'Les frais sont payables en dollars américains.', es:'Las tarifas se pagan en dólares estadounidenses.',
    de:'Die Gebühren sind in US-Dollar zu zahlen.'
  })[lang] || '';
}
function typesIntro(lang) {
  return ({
    en:'The main categories are:', sw:'Aina kuu ni:', zh:'主要类别：', ar:'الفئات الرئيسية:',
    hi:'मुख्य प्रकार:', ur:'اہم اقسام:', fr:'Les catégories :', es:'Las categorías:', de:'Die Kategorien:'
  })[lang] || 'Categories:';
}
function feesTable(fees, lang) {
  var cat = ({en:'Category',sw:'Aina',zh:'类别',ar:'الفئة',hi:'श्रेणी',ur:'درجہ',fr:'Catégorie',es:'Categoría',de:'Kategorie'})[lang] || 'Category';
  var h = '<table><thead><tr><th>' + cat + '</th><th style="text-align:right;">USD</th></tr></thead><tbody>';
  for (var i = 0; i < fees.length; i++) h += '<tr><td>' + esc(fees[i][0]) + '</td><td style="text-align:right;">' + esc(fees[i][1]) + '</td></tr>';
  return h + '</tbody></table>';
}

function esc(s) { return String(s).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

// ========== SUGGESTIONS ==========
function defaultSug(lang) {
  return ({
    en:['What is a visa?','Types of visa','Visa fees','Tanzanian citizenship','How to apply for a passport'],
    sw:['Visa ni nini?','Aina za visa','Ada ya visa','Uraia wa Tanzania','Jinsi ya kupata pasipoti'],
    zh:['什么是签证？','签证类型','签证费用','坦桑尼亚国籍','如何申请护照'],
    ar:['ما هي التأشيرة؟','أنواع التأشيرات','رسوم التأشيرة','الجنسية التنزانية','كيفية طلب جواز السفر'],
    hi:['वीज़ा क्या है?','वीज़ा के प्रकार','वीज़ा शुल्क','तंज़ानियाई नागरिकता','पासपोर्ट कैसे प्राप्त करें'],
    ur:['ویزا کیا ہے؟','ویزا کی اقسام','ویزا فیس','تنزانیہ شہریت','پاسپورٹ کیسے حاصل کریں'],
    fr:['Qu\'est-ce qu\'un visa?','Types de visa','Frais de visa','Citoyenneté tanzanienne','Obtenir un passeport'],
    es:['¿Qué es una visa?','Tipos de visa','Tarifas de visa','Ciudadanía tanzana','Obtener un pasaporte'],
    de:['Was ist ein Visum?','Arten von Visa','Visumgebühren','Tansanische Staatsbürgerschaft','Reisepass beantragen']
  })[lang] || [];
}

// ========== INTRO ==========
function intro(lang) {
  return ({
    en:'<p>Hello, I am <strong>Uhamiaji Chatbot</strong>. Ask me anything about Tanzania immigration law — visas, citizenship, passports, residence permits.</p><p>You can write in English, Swahili, Chinese, Arabic, Hindi, Urdu, French, Spanish, or German.</p>',
    sw:'<p>Habari, mimi ni <strong>Uhamiaji Chatbot</strong>. Niulize chochote kuhusu sheria za uhamiaji wa Tanzania — visa, uraia, pasipoti, vibali vya kuishi.</p><p>Unaweza kuandika kwa Kiswahili, Kiingereza, Kichina, Kiarabu, Kihindi, Kiurdu, Kifaransa, Kihispania au Kijerumani.</p>'
  })[lang] || this.en || '<p>Hello, I am Uhamiaji Chatbot.</p>';
}

// ========== FALLBACK ==========
function fallback(q, lang) {
  return ({
    en:'<p>I need a little more context. Are you asking about <strong>visa</strong>, <strong>citizenship</strong>, <strong>passport</strong>, or <strong>residence permit</strong>?</p>',
    sw:'<p>Ninahitaji muktadha zaidi. Je, unauliza kuhusu <strong>visa</strong>, <strong>uraia</strong>, <strong>pasipoti</strong>, au <strong>kibali cha kuishi</strong>?</p>',
    zh:'<p>我需要更多背景。您是在询问 <strong>签证</strong>、<strong>国籍</strong>、<strong>护照</strong>，还是 <strong>居留许可</strong>？</p>',
    ar:'<p>أحتاج إلى مزيد من السياق. هل تسأل عن <strong>التأشيرة</strong>، <strong>الجنسية</strong>، <strong>جواز السفر</strong>، أو <strong>تصريح الإقامة</strong>؟</p>',
    hi:'<p>कृपया थोड़ा और बताएं। <strong>वीज़ा</strong>, <strong>नागरिकता</strong>, <strong>पासपोर्ट</strong> या <strong>निवास परमिट</strong>?</p>',
    ur:'<p>مزید وضاحت کریں۔ <strong>ویزا</strong>، <strong>شہریت</strong>، <strong>پاسپورٹ</strong>، یا <strong>رہائشی اجازت</strong>؟</p>',
    fr:'<p>Pouvez-vous préciser ? <strong>Visa</strong>, <strong>citoyenneté</strong>, <strong>passeport</strong>, ou <strong>permis de séjour</strong> ?</p>',
    es:'<p>¿Más contexto? <strong>Visa</strong>, <strong>ciudadanía</strong>, <strong>pasaporte</strong>, o <strong>permiso de residencia</strong>?</p>',
    de:'<p>Bitte etwas mehr Kontext. <strong>Visum</strong>, <strong>Staatsbürgerschaft</strong>, <strong>Reisepass</strong>, oder <strong>Aufenthaltserlaubnis</strong>?</p>'
  })[lang] || '<p>Please provide more context.</p>';
}

// ========== MAIN API ==========
function ask(q) {
  if (!q) return { answer: intro('en'), suggestions: defaultSug('en') };
  var lang = detectLang(q);
  var chit = smallTalk(q, lang);
  if (chit) return { answer: chit.answer, suggestions: defaultSug(lang) };
  var topic = detectTopic(q);
  if (!topic) return { answer: fallback(q, lang), suggestions: defaultSug(lang) };
  var intent = detectIntent(q);
  var html = buildAnswer(topic, intent, lang);
  if (!html) return { answer: fallback(q, lang), suggestions: defaultSug(lang) };
  return { answer: html, suggestions: defaultSug(lang) };
}

global.UhamiajiChatbot = {
  ask: ask,
  intro: function (lang) { return { answer: intro(lang || 'en'), suggestions: defaultSug(lang || 'en') }; },
  detectLang: detectLang
};
})(window);
