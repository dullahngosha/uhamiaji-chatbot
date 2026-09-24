<?php
declare(strict_types=1);

function faq_words(string $text): array
{
    $text = strtolower($text);
    foreach (['viza'=>'visa','passports'=>'passport','pasipoti'=>'passport','ninataka'=>'nataka','nahitaji'=>'nataka','naomba'=>'nataka'] as $a=>$b) {
        $text = preg_replace('/\b'.preg_quote($a, '/').'\b/', $b, $text);
    }
    preg_match_all('/[a-z]+/', $text, $matches);
    return array_values(array_diff(array_unique($matches[0]), ['i','a','the','my','do','can','please','ya','za','vya','yangu','na','how','for','to']));
}

function faq_language(string $text): string
{
    return preg_match('/\b(pasipoti|nataka|nahitaji|naomba|jinsi|gani|viza|kufuatilia|mtoto|watoto|nalipaje|naombaje|nimepoteza|imepotea|imeharibika|imeibiwa|kibali|vibali|kuishi|nyaraka|alama|vidole|kabla|gharama|ada|bei|yake|masharti|viambato|habari|hujambo|mambo|ninataka|kwa)\b/i', $text) ? 'sw' : 'en';
}

function faq_topic(string $text): ?string
{
    foreach (['passport'=>'passport|passports|pasipoti','visa'=>'visa|viza|visas','residence'=>'residence|kibali|vibali','citizenship'=>'citizenship|uraia'] as $topic=>$words) {
        if (preg_match('/\b('.$words.')\b/i', $text)) return $topic;
    }
    return null;
}

function faq_match(string $question, array $entries, string $language): ?array
{
    $query = faq_words($question);
    if (array_intersect($query, ['ada','gharama','bei','fee','fees','cost','price'])) return null;
    $ranked = [];
    foreach ($entries as $entry) {
        if (($entry['status'] ?? '') !== 'source_checked') continue;
        $best = 0.0;
        foreach ($entry['questions'] as $alias) {
            $candidate = faq_words($alias);
            $overlap = count(array_intersect($query, $candidate));
            if ($overlap >= 2) $best = max($best, 2*$overlap / max(1,count($query)+count($candidate)));
        }
        $ranked[] = ['score'=>$best,'entry'=>$entry];
    }
    usort($ranked, fn($a,$b)=>$b['score'] <=> $a['score']);
    if (!$ranked || $ranked[0]['score'] < .78 ||
        (isset($ranked[1]) && $ranked[0]['score']-$ranked[1]['score'] < .12)) return null;
    $entry=$ranked[0]['entry'];
    return ['answer'=>$entry['answers'][$language], 'language'=>$language, 'topic'=>$entry['topic']];
}

function faq_answer(string $question, array $history, array $entries): array
{
    $lang=faq_language($question);
    $reply=fn(string $sw,string $en,string $topic='general')=>['answer'=>$lang==='sw'?$sw:$en,'language'=>$lang,'topic'=>$topic];
    if (preg_match('/^(hello|hi|hey|habari|hujambo|mambo)[!. ]*$/i',$question)) {
        return $reply('Karibu! Mimi ni Mr. HamaHama, msaidizi wako wa kidijitali. Nikusaidie kuhusu huduma gani ya Uhamiaji?', 'Welcome! I am Mr. HamaHama, your digital assistant. Which immigration service can I help you with?');
    }
    $match=faq_match($question,$entries,$lang);
    if ($match) return $match;
    $topic=faq_topic($question);
    $follow=(bool)preg_match('/\b(yake|its|it|masharti|requirements|viambato|gharama|ada|fee|cost|price)\b/i',$question);
    if (!$topic && $follow) {
        foreach (array_reverse($history) as $turn) {
            if ($turn['role']==='user' && ($prior=faq_topic($turn['content']))) { $topic=$prior; break; }
        }
    }
    if ($topic && $follow) {
        $match=faq_match($topic.' '.$question,$entries,$lang);
        if ($match) return $match;
    }
    if (preg_match('/\b(ada|gharama|bei|fee|fees|cost|price)\b/i',$question)) {
        return $reply('Ada zinahitaji uthibitisho wa sasa. Tafadhali wasiliana na info@immigration.go.tz na utaje aina ya huduma unayoomba.', 'Fees need current confirmation. Please contact info@immigration.go.tz and specify the service you are applying for.',$topic??'general');
    }
    if ($topic==='visa') return $reply('Unaulizia kuomba visa, kufuatilia ombi au masharti gani? Nieleze kidogo zaidi. Kwa msaada zaidi: info@immigration.go.tz.', 'Are you asking about applying, tracking an application or specific visa requirements? Please tell me more. Further help: info@immigration.go.tz.','visa');
    return $reply('Sina FAQ inayojibu swali hilo kwa uhakika bado. Jaribu kueleza swali kwa maneno mengine au wasiliana na Idara ya Uhamiaji kupitia info@immigration.go.tz.', 'I do not yet have a reliable FAQ answer for that question. Please rephrase it or contact the Tanzania Immigration Department at info@immigration.go.tz.',$topic??'general');
}
