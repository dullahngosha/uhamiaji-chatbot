// Uhamiaji Chatbot — knowledge base (all 9 languages embedded).
window.UHAMIAJI_KB = {
  visa: {
    en: {
      def: "A visa is an official authorisation issued by the United Republic of Tanzania that allows a foreign national to enter, transit through, or remain in the country for a specified purpose and period. It is issued under the Immigration Act (CAP. 54) and the Immigration (Visa) Regulations.",
      types: [
        ["Ordinary Visa","for general visitors — tourism, family visits, short meetings."],
        ["Business Visa","for lawful business, investment or short-term professional work."],
        ["Transit Visa","for travellers passing through Tanzania to another country."],
        ["Gratis Visa","free visa granted to diplomats, officials and government guests."]
      ],
      application:"Submit applications to the Tanzania Immigration Department — at a diplomatic mission abroad, a port of entry, or the online e-Visa system. You need a valid passport (six months remaining), photos, proof of purpose of travel, proof of funds, and the fee.",
      validity:"Single-entry ordinary visa: typically 90 days. Multiple-entry: 6-12 months. Transit: up to 7 days.",
      authority:"Every visa is issued under the authority of the Commissioner General of Immigration.",
      fees_default:[["Ordinary single entry","50"],["Ordinary multiple","100"],["Business","250"],["Transit","30"],["Gratis","0"]],
      follow:"Would you like more detail on types, fees, application, or validity?"
    },
    sw: {
      def:"Visa ni idhini rasmi inayotolewa na Jamhuri ya Muungano wa Tanzania, ikimruhusu raia wa nchi nyingine kuingia, kupitia, au kukaa nchini kwa kipindi na madhumuni yaliyotajwa. Inatolewa chini ya Sheria ya Uhamiaji (CAP. 54) na Immigration (Visa) Regulations.",
      types:[["Ordinary Visa","kwa wageni wa kawaida — utalii, ziara za familia, mikutano mifupi."],["Business Visa","kwa shughuli halali za biashara, uwekezaji au kazi ya muda mfupi."],["Transit Visa","kwa wasafiri wanaopita Tanzania kuelekea nchi nyingine."],["Gratis Visa","visa ya bure kwa wanadiplomasia, maafisa na wageni wa Serikali."]],
      application:"Maombi yanawasilishwa kwenye Idara ya Uhamiaji — kupitia ubalozi, kituo cha kuingilia, au e-Visa mtandaoni. Unahitaji pasipoti halali (miezi 6), picha, uthibitisho wa madhumuni, uthibitisho wa fedha, na ada.",
      validity:"Ordinary single-entry: siku 90. Multiple-entry: miezi 6-12. Transit: hadi siku 7.",
      authority:"Kila visa inatolewa chini ya Kamishna Jenerali wa Uhamiaji.",
      fees_default:[["Ordinary kuingia mara moja","50"],["Ordinary mara nyingi","100"],["Business","250"],["Transit","30"],["Gratis","0"]],
      follow:"Ungependa maelezo zaidi kuhusu aina, ada, kuomba, au muda?"
    },
    zh: {
      def:"签证是坦桑尼亚联合共和国签发的正式许可，允许外国公民在规定的期限和目的内进入、过境或停留该国。依据《移民法》（第54章）及《移民（签证）条例》签发。",
      types:[["普通签证","面向普通访客 — 旅游、探亲、短期会议。"],["商务签证","用于合法的商业、投资或短期专业工作。"],["过境签证","面向经坦桑尼亚前往其他国家的旅客。"],["礼遇签证","免费签证，颁发给外交官、政府官员和客人。"]],
      application:"申请可通过坦桑尼亚驻外使馆、入境口岸或电子签证系统提交。需要有效护照（至少六个月有效期）、照片、旅行目的证明、资金证明以及费用。",
      validity:"单次入境普通签证：90天。多次入境：6-12个月。过境签证：最多7天。",
      authority:"所有签证均由移民总署署长授权签发。",
      fees_default:[["普通单次入境","50"],["普通多次入境","100"],["商务","250"],["过境","30"],["礼遇","0"]],
      follow:"您想了解类型、费用、申请还是有效期？"
    },
    ar: {
      def:"التأشيرة إذن رسمي تصدره جمهورية تنزانيا المتحدة يسمح للأجنبي بالدخول أو العبور أو الإقامة لغرض ومدة محددين. تصدر بموجب قانون الهجرة (الفصل 54) ولوائح التأشيرات.",
      types:[["التأشيرة العادية","للزوار العاديين."],["تأشيرة الأعمال","للأعمال المشروعة أو الاستثمار."],["تأشيرة العبور","للعابرين إلى بلد آخر."],["التأشيرة المجانية","للدبلوماسيين وضيوف الحكومة."]],
      application:"تُقدَّم الطلبات عبر البعثة الدبلوماسية، منفذ الدخول، أو التأشيرة الإلكترونية. يُطلب جواز ساري (6 أشهر)، صور، إثبات الغرض، إثبات الأموال، والرسوم.",
      validity:"الدخول الواحد: 90 يومًا. متعددة الدخول: 6-12 شهرًا. العبور: حتى 7 أيام.",
      authority:"تُصدر جميع التأشيرات بتفويض من المفوض العام للهجرة.",
      fees_default:[["عادية دخول واحد","50"],["عادية متعددة","100"],["أعمال","250"],["عبور","30"],["مجانية","0"]],
      follow:"هل ترغب في تفاصيل عن الأنواع، الرسوم، التقديم، أو الصلاحية؟"
    },
    hi: {
      def:"वीज़ा संयुक्त गणराज्य तंज़ानिया द्वारा जारी आधिकारिक प्राधिकरण है जो विदेशी नागरिक को निर्धारित उद्देश्य और अवधि के लिए प्रवेश, पारगमन या निवास की अनुमति देता है। इमिग्रेशन एक्ट (CAP. 54) के तहत।",
      types:[["साधारण वीज़ा","सामान्य आगंतुकों के लिए।"],["व्यावसायिक वीज़ा","व्यवसाय, निवेश के लिए।"],["ट्रांज़िट वीज़ा","दूसरे देश जाने के लिए।"],["निःशुल्क वीज़ा","राजनयिकों और सरकारी अतिथियों के लिए।"]],
      application:"आवेदन तंज़ानिया इमिग्रेशन विभाग को राजनयिक मिशन, प्रवेश बंदरगाह, या e-Visa प्रणाली के माध्यम से जमा करें। पासपोर्ट (6 माह वैध), फोटो, उद्देश्य प्रमाण, फंड प्रमाण, शुल्क चाहिए।",
      validity:"एकल प्रवेश: 90 दिन। बहु प्रवेश: 6-12 माह। ट्रांज़िट: 7 दिन तक।",
      authority:"प्रत्येक वीज़ा इमिग्रेशन के कमिश्नर जनरल के अधिकार के तहत जारी किया जाता है।",
      fees_default:[["एकल प्रवेश","50"],["बहु प्रवेश","100"],["व्यावसायिक","250"],["ट्रांज़िट","30"],["निःशुल्क","0"]],
      follow:"क्या आप प्रकार, शुल्क, आवेदन, या वैधता के बारे में अधिक चाहते हैं?"
    },
    ur: {
      def:"ویزا متحدہ جمہوریہ تنزانیہ کی طرف سے جاری سرکاری اجازت نامہ ہے جو غیر ملکی کو مخصوص مقصد اور مدت کے لیے داخلے، گزرنے، یا قیام کی اجازت دیتا ہے۔ امیگریشن ایکٹ (CAP. 54) کے تحت۔",
      types:[["عمومی ویزا","عام مہمانوں کے لیے۔"],["کاروباری ویزا","قانونی کاروبار کے لیے۔"],["ٹرانزٹ ویزا","دوسرے ملک جانے کے لیے۔"],["مفت ویزا","سفارتکاروں اور حکومتی مہمانوں کے لیے۔"]],
      application:"درخواستیں تنزانیہ کے امیگریشن ڈیپارٹمنٹ کو سفارت خانوں، داخلے کے مقامات یا e-Visa نظام کے ذریعے جمع کرائیں۔",
      validity:"سنگل انٹری: 90 دن۔ ملٹیپل انٹری: 6-12 ماہ۔ ٹرانزٹ: زیادہ سے زیادہ 7 دن۔",
      authority:"ہر ویزا کمشنر جنرل آف امیگریشن کے اختیار کے تحت جاری ہوتا ہے۔",
      fees_default:[["سنگل انٹری","50"],["ملٹیپل انٹری","100"],["کاروباری","250"],["ٹرانزٹ","30"],["مفت","0"]],
      follow:"کیا آپ اقسام، فیس، درخواست یا میعاد کے بارے میں مزید جاننا چاہیں گے؟"
    },
    fr: {
      def:"Un visa est une autorisation officielle délivrée par la République-Unie de Tanzanie qui permet à un ressortissant étranger d'entrer, de transiter ou de séjourner pour un but et une durée précis. Délivré en vertu de la loi sur l'immigration (CAP. 54).",
      types:[["Visa ordinaire","pour les visiteurs ordinaires."],["Visa d'affaires","pour affaires ou investissement."],["Visa de transit","pour les voyageurs en transit."],["Visa gratuit","pour diplomates et invités."]],
      application:"Les demandes sont soumises au Département de l'immigration via une mission diplomatique, un poste frontière ou le système e-Visa en ligne.",
      validity:"Entrée unique : 90 jours. Entrées multiples : 6-12 mois. Transit : jusqu'à 7 jours.",
      authority:"Chaque visa est délivré sous l'autorité du Commissaire général à l'immigration.",
      fees_default:[["Ordinaire entrée unique","50"],["Ordinaire multiple","100"],["Affaires","250"],["Transit","30"],["Gratuit","0"]],
      follow:"Souhaitez-vous plus de détails sur les types, frais, demande ou validité ?"
    },
    es: {
      def:"Un visado es una autorización oficial expedida por la República Unida de Tanzania que permite a un extranjero entrar, transitar o permanecer por un propósito y período determinados. Expedido bajo la Ley de Inmigración (CAP. 54).",
      types:[["Visa ordinaria","para visitantes generales."],["Visa de negocios","para negocios o inversión."],["Visa de tránsito","para pasar a otro país."],["Visa gratuita","para diplomáticos y invitados del Gobierno."]],
      application:"Las solicitudes se presentan al Departamento de Inmigración a través de una misión diplomática, puerto de entrada o sistema e-Visa.",
      validity:"Entrada única: 90 días. Múltiple: 6-12 meses. Tránsito: hasta 7 días.",
      authority:"Cada visa se expide bajo la autoridad del Comisionado General de Inmigración.",
      fees_default:[["Ordinaria entrada única","50"],["Ordinaria múltiple","100"],["Negocios","250"],["Tránsito","30"],["Gratuita","0"]],
      follow:"¿Desea más detalles sobre tipos, tarifas, solicitud o validez?"
    },
    de: {
      def:"Ein Visum ist eine offizielle Erlaubnis der Vereinigten Republik Tansania, die einem Ausländer das Einreisen, Durchreisen oder Verbleiben für einen bestimmten Zweck und Zeitraum gestattet. Nach dem Einwanderungsgesetz (CAP. 54).",
      types:[["Ordentliches Visum","für allgemeine Besucher."],["Geschäftsvisum","für Geschäft oder Investition."],["Transitvisum","für Reisende in ein anderes Land."],["Gratisvisum","für Diplomaten und Regierungsgäste."]],
      application:"Anträge werden beim Einwanderungsdepartement über Auslandsvertretungen, Einreiseorte oder das e-Visa-System gestellt.",
      validity:"Einmalige Einreise: 90 Tage. Mehrfach: 6-12 Monate. Transit: bis zu 7 Tage.",
      authority:"Jedes Visum wird unter der Autorität des Kommissargenerals der Einwanderung erteilt.",
      fees_default:[["Ordentlich einmalig","50"],["Ordentlich mehrfach","100"],["Geschäft","250"],["Transit","30"],["Gratis","0"]],
      follow:"Möchten Sie mehr über Arten, Gebühren, Antrag oder Gültigkeit erfahren?"
    }
  },
  citizenship: {
    en:{def:"Tanzanian citizenship is the legal status of belonging to the United Republic of Tanzania, regulated by the Tanzania Citizenship Act (CAP. 357). Acquired by birth, descent, registration (e.g., marriage) or naturalisation.", follow:"Would you like the naturalisation procedure or the position on dual citizenship?"},
    sw:{def:"Uraia wa Tanzania ni hadhi ya kisheria ya kuwa mwenyeji wa Jamhuri ya Muungano wa Tanzania, unaosimamiwa na Sheria ya Uraia (CAP. 357). Unapatikana kwa kuzaliwa, asili, usajili au kujinyakulia.", follow:"Ungependa utaratibu wa kujinyakulia au msimamo wa uraia wa nchi mbili?"},
    zh:{def:"坦桑尼亚国籍是归属于坦桑尼亚联合共和国的法律身份，由《国籍法》（第357章）管辖。可通过出生、血统、登记或归化获得。", follow:"您想了解归化程序或双重国籍的规定吗？"},
    ar:{def:"الجنسية التنزانية هي الوضع القانوني للانتماء إلى جمهورية تنزانيا المتحدة، ينظمها قانون الجنسية (الفصل 357). تُكتسب بالميلاد، النسب، التسجيل أو التجنس.", follow:"هل ترغب في إجراءات التجنس أو الجنسية المزدوجة؟"},
    hi:{def:"तंज़ानियाई नागरिकता तंज़ानिया की कानूनी स्थिति है, नागरिकता अधिनियम (CAP. 357) द्वारा नियंत्रित। जन्म, वंश, पंजीकरण या नैचुरलाइज़ेशन द्वारा।", follow:"क्या आप नैचुरलाइज़ेशन या दोहरी नागरिकता के बारे में जानना चाहेंगे?"},
    ur:{def:"تنزانیہ کی شہریت متحدہ جمہوریہ کی قانونی حیثیت ہے، شہریت ایکٹ (CAP. 357) کے تحت۔ پیدائش، نسب، اندراج یا نیچرلائزیشن سے۔", follow:"کیا آپ نیچرلائزیشن یا دوہری شہریت کے بارے میں جاننا چاہیں گے؟"},
    fr:{def:"La citoyenneté tanzanienne est le statut juridique d'appartenance à la Tanzanie, régi par la loi sur la citoyenneté (CAP. 357). Par naissance, descendance, enregistrement ou naturalisation.", follow:"Voulez-vous la naturalisation ou la double nationalité ?"},
    es:{def:"La ciudadanía tanzana es el estado legal de pertenecer a Tanzania, regulada por la Ley de Ciudadanía (CAP. 357). Por nacimiento, descendencia, registro o naturalización.", follow:"¿Desea la naturalización o la doble ciudadanía?"},
    de:{def:"Die tansanische Staatsbürgerschaft ist der rechtliche Status der Zugehörigkeit zu Tansania, geregelt durch das Staatsbürgerschaftsgesetz (CAP. 357). Durch Geburt, Abstammung, Registrierung oder Einbürgerung.", follow:"Möchten Sie Einbürgerung oder doppelte Staatsbürgerschaft?"}
  },
  passport: {
    en:{def:"A Tanzanian passport is the official travel document issued to citizens for international travel, under the Tanzania Passports and Travel Documents Act. Types: Ordinary, Diplomatic, Service, Emergency.", follow:"Would you like application procedure or validity?"},
    sw:{def:"Pasipoti ya Tanzania ni hati rasmi ya kusafiria kwa raia, chini ya Tanzania Passports Act. Aina: Kawaida, Diplomasia, Huduma, Dharura.", follow:"Ungependa utaratibu wa kuomba au muda wa uhalali?"},
    zh:{def:"坦桑尼亚护照是颁发给公民的国际旅行证件，根据《护照法》。类型：普通、外交、公务、应急。", follow:"您想了解申请流程还是有效期？"},
    ar:{def:"جواز السفر التنزاني وثيقة رسمية للمواطنين للسفر الدولي، بموجب قانون جوازات السفر. الأنواع: عادي، دبلوماسي، خدمة، طارئ.", follow:"هل ترغب في إجراءات التقديم أو الصلاحية؟"},
    hi:{def:"तंज़ानियाई पासपोर्ट नागरिकों को अंतरराष्ट्रीय यात्रा के लिए जारी दस्तावेज़ है। प्रकार: साधारण, कूटनीतिक, सेवा, आपातकालीन।", follow:"आवेदन या वैधता?"},
    ur:{def:"تنزانیہ پاسپورٹ شہریوں کو بین الاقوامی سفر کے لیے سرکاری دستاویز ہے۔ اقسام: عمومی، سفارتی، سروس، ہنگامی۔", follow:"درخواست یا میعاد؟"},
    fr:{def:"Le passeport tanzanien est le document de voyage officiel pour citoyens. Types : ordinaire, diplomatique, de service, urgence.", follow:"Procédure ou validité ?"},
    es:{def:"El pasaporte tanzano es el documento de viaje oficial para ciudadanos. Tipos: ordinario, diplomático, de servicio, emergencia.", follow:"¿Procedimiento o validez?"},
    de:{def:"Der tansanische Reisepass ist das offizielle Reisedokument für Bürger. Arten: ordentlich, diplomatisch, Dienst, Not.", follow:"Antrag oder Gültigkeit?"}
  },
  permit: {
    en:{def:"A residence permit authorises a foreign national to reside in Tanzania. Classes: A (investor/self-employed), B (specified employment), C (students, researchers, missionaries, retirees).", follow:"Details on a specific class, application, or renewal?"},
    sw:{def:"Kibali cha kuishi kinamruhusu mgeni kuishi Tanzania. Madarasa: A (mwekezaji), B (ajira maalum), C (wanafunzi, watafiti, wamisionari, wastaafu).", follow:"Maelezo ya darasa, maombi, au upya?"},
    zh:{def:"居留许可授权外国公民在坦桑尼亚居住。类别：A（投资者）、B（指定就业）、C（学生、研究员、退休人员）。", follow:"特定类别、申请或续签的详情？"},
    ar:{def:"تصريح الإقامة يسمح للأجنبي بالإقامة في تنزانيا. الفئات: A (مستثمر)، B (توظيف محدد)، C (طلاب، متقاعدون).", follow:"تفاصيل عن فئة، تقديم أو تجديد؟"},
    hi:{def:"निवास परमिट विदेशी को तंज़ानिया में रहने की अनुमति देता है। वर्ग: A (निवेशक), B (रोज़गार), C (छात्र, सेवानिवृत्त)।", follow:"विशिष्ट वर्ग, आवेदन, या नवीनीकरण?"},
    ur:{def:"رہائشی اجازت غیر ملکی کو تنزانیہ میں رہنے کی اجازت دیتی ہے۔ کلاسیں: A (سرمایہ کار)، B (ملازمت)، C (طلباء، ریٹائرڈ)۔", follow:"کلاس، درخواست یا تجدید؟"},
    fr:{def:"Un permis de séjour autorise un ressortissant étranger à résider en Tanzanie. Classes : A (investisseur), B (emploi), C (étudiants, retraités).", follow:"Classe, demande ou renouvellement ?"},
    es:{def:"Un permiso de residencia autoriza a un extranjero a residir en Tanzania. Clases: A (inversor), B (empleo), C (estudiantes, jubilados).", follow:"¿Clase, solicitud o renovación?"},
    de:{def:"Eine Aufenthaltserlaubnis erlaubt einem Ausländer, sich in Tansania aufzuhalten. Klassen: A (Investor), B (Beschäftigung), C (Studenten, Rentner).", follow:"Klasse, Antrag oder Verlängerung?"}
  },
  immigration: {
    en:{def:"The Immigration Act (CAP. 54) is the principal law regulating entry, residence and departure from Tanzania. It sets out who may enter, officers' powers, visa and permit categories, and rules on prohibited immigrants.", follow:"Visas, permits, citizenship, or officers' powers?"},
    sw:{def:"Immigration Act (CAP. 54) ni sheria kuu inayosimamia kuingia, kuishi, na kuondoka Tanzania. Inaeleza nani anayeweza kuingia, mamlaka ya maafisa, aina za visa na vibali, na prohibited immigrants.", follow:"Visa, vibali, uraia, au mamlaka ya maafisa?"},
    zh:{def:"《移民法》（第54章）是关于入境、居留和离境的基本法律。规定入境资格、官员权力、签证类别和被禁止移民规则。", follow:"签证、许可、国籍或官员权力？"},
    ar:{def:"قانون الهجرة (الفصل 54) هو القانون الرئيسي للدخول والإقامة والمغادرة. يحدد من يحق له الدخول، صلاحيات الموظفين، فئات التأشيرات.", follow:"التأشيرات، التصاريح، الجنسية، أو صلاحيات؟"},
    hi:{def:"इमिग्रेशन एक्ट (CAP. 54) प्रवेश, निवास और प्रस्थान का मुख्य कानून है। प्रवेश पात्रता, अधिकारी शक्तियाँ, वीज़ा श्रेणियाँ।", follow:"वीज़ा, परमिट, नागरिकता या अधिकारी शक्तियाँ?"},
    ur:{def:"امیگریشن ایکٹ (CAP. 54) داخلے، رہائش اور روانگی کا بنیادی قانون ہے۔ داخلے کی اہلیت، افسران کے اختیارات، ویزا اقسام۔", follow:"ویزا، پرمٹ، شہریت یا اختیارات؟"},
    fr:{def:"La loi sur l'immigration (CAP. 54) régit l'entrée, la résidence et le départ. Elle précise qui peut entrer, les pouvoirs des agents, les catégories de visas.", follow:"Visas, permis, citoyenneté, ou pouvoirs ?"},
    es:{def:"La Ley de Inmigración (CAP. 54) regula entrada, residencia y salida. Establece quién puede entrar, facultades, categorías de visas.", follow:"¿Visas, permisos, ciudadanía o facultades?"},
    de:{def:"Das Einwanderungsgesetz (CAP. 54) regelt Einreise, Aufenthalt und Ausreise. Wer einreisen darf, Beamtenbefugnisse, Visa-Kategorien.", follow:"Visa, Genehmigungen, Staatsbürgerschaft oder Befugnisse?"}
  }
};
