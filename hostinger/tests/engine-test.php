<?php
declare(strict_types=1);
require dirname(__DIR__).'/hamahama-private/engine.php';
$entries=array_merge(require dirname(__DIR__).'/hamahama-private/faqs.php',require dirname(__DIR__).'/hamahama-private/residence-faqs.php');
$count=0;
foreach($entries as $entry){
 foreach($entry['questions'] as $q){
  $result=faq_match($q,$entries,'en');
  if(!$result || $result['answer']!==$entry['answers']['en']) throw new RuntimeException('Wrong FAQ: '.$q);
  $count++;
 }
}
$r=faq_answer('viambato vyake',[['role'=>'user','content'=>'nataka pasipoti']],$entries);
if(!str_contains($r['answer'],'NIDA'))throw new RuntimeException('Followup failed');
if(faq_match('nataka pasipoti ada',$entries,'sw')!==null)throw new RuntimeException('Wrong fee answer');
$r=faq_answer('passport requirements',[],$entries);
if($r['language']!=='en')throw new RuntimeException('English failed');
$r=faq_answer('nataka pasipoti',[],$entries);
if($r['language']!=='sw')throw new RuntimeException('Swahili failed');
echo "PASS: $count FAQ phrasings, followup, fee guard and bilingual answers\n";
