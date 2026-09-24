<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header('Referrer-Policy: no-referrer');

function finish(int $code, array $body): never {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
try {
    $private=dirname(__DIR__,2).'/hamahama-private';
    $config=require $private.'/config.php';
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if ($origin!=='' && !in_array($origin,$config['origins'],true)) finish(403,['error'=>'Origin not allowed']);
    if ($origin!=='') { header('Access-Control-Allow-Origin: '.$origin); header('Vary: Origin'); }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if ($_SERVER['REQUEST_METHOD']==='OPTIONS') { http_response_code(204); exit; }
    if ($_SERVER['REQUEST_METHOD']!=='POST') {header('Allow: POST, OPTIONS'); finish(405,['error'=>'Use POST']);}
    if (strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json') finish(415,['error'=>'Use application/json']);
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>32768) finish(413,['error'=>'Request too large']);
    $raw=file_get_contents('php://input',false,null,0,32769);
    if ($raw===false || strlen($raw)>32768) finish(413,['error'=>'Request too large']);
    $input=json_decode($raw,true,16,JSON_THROW_ON_ERROR);
    if (!is_array($input) || !isset($input['message']) || !is_string($input['message'])) finish(422,['error'=>'Message required']);
    $question=trim(preg_replace('/\s+/u',' ', $input['message']));
    if ($question==='' || strlen($question)>2400) finish(422,['error'=>'Message must be 1-2400 bytes']);
    $history=$input['history']??[];
    if (!is_array($history) || !array_is_list($history) || count($history)>8) finish(422,['error'=>'Invalid history']);
    foreach ($history as $turn) {
        if (!is_array($turn) || !in_array($turn['role']??'', ['user','assistant'],true) ||
            !is_string($turn['content']??null) || strlen($turn['content'])>9600) finish(422,['error'=>'Invalid history']);
    }

    // Single locked, bounded state file outside public_html; never trust X-Forwarded-For.
    $file=fopen($private.'/rate-state.json','c+');
    if (!$file || !flock($file,LOCK_EX)) throw new RuntimeException('Rate storage unavailable');
    $now=time();
    $state=json_decode(stream_get_contents($file)?:'{}',true) ?: [];
    foreach ($state as $key=>$value) {if ($now-($value['start']??0)>=60) unset($state[$key]);}
    $ip=hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown');
    $blocked=($state[$ip]['count']??0)>=$config['per_ip_per_minute'] || ($state['global']['count']??0)>=$config['global_per_minute'] || (!isset($state[$ip]) && count($state)>=2048);
    if (!$blocked) {
        foreach ([$ip,'global'] as $key) {
            $state[$key]??=['start'=>$now,'count'=>0];
            $state[$key]['count']++;
        }
        rewind($file); ftruncate($file,0);
        if (fwrite($file,json_encode($state,JSON_THROW_ON_ERROR))===false) throw new RuntimeException('Rate write failed');
        fflush($file);
    }
    flock($file,LOCK_UN); fclose($file);
    if ($blocked) {header('Retry-After: 60');finish(429,['error'=>'Please wait a minute and try again']);}
    require $private.'/engine.php';
    $entries=require $private.'/faqs.php';
    $entries=array_merge($entries, require $private.'/residence-faqs.php');
    finish(200,faq_answer($question,$history,$entries));
} catch (JsonException $e) {
    finish(400,['error'=>'Invalid JSON']);
} catch (Throwable $e) {
    error_log('HamaHama service error: '.get_class($e));
    finish(503,['error'=>'Service unavailable. Contact info@immigration.go.tz.']);
}
