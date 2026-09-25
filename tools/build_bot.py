#!/usr/bin/env python3
"""Tengeneza bot/worker.js kutoka bot/worker.src.js.

Injini ya utafutaji (sehemu ya "Search" ya embed.js) inanakiliwa ndani ya
worker, ili bot ya Messenger/Instagram na widget ya blogu zijibu sawasawa.
Endesha tena kila unapobadilisha embed.js au worker.src.js:

    python3 tools/build_bot.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
START = '/* ---------- Search (Kiswahili + English) ---------- */'
END = '/* ---------- Vipengele vya UI ---------- */'


def engine_source():
    js = (ROOT / 'embed.js').read_text(encoding='utf-8')
    i, j = js.find(START), js.find(END)
    if i < 0 or j < 0:
        sys.exit('Sikupata sehemu ya injini ya utafutaji ndani ya embed.js')
    block = js[i:j].rstrip()
    # embed.js iko ndani ya function (ndani ya nafasi 2); ondoa nafasi hizo
    return re.sub(r'(?m)^  ', '', block)


def main():
    src = (ROOT / 'bot' / 'worker.src.js').read_text(encoding='utf-8')
    if '/*@@ENGINE@@*/' not in src:
        sys.exit('worker.src.js haina alama /*@@ENGINE@@*/')
    out = src.replace('/*@@ENGINE@@*/', '/* Imenakiliwa kutoka embed.js na tools/build_bot.py — usihariri hapa */\n' + engine_source())
    out = out.replace('USIHARIRI bot/worker.js', 'USIHARIRI faili hili (bot/worker.js)')
    (ROOT / 'bot' / 'worker.js').write_text(out, encoding='utf-8')
    print('bot/worker.js imetengenezwa (%d KB)' % (len(out.encode()) // 1024))


if __name__ == '__main__':
    main()
