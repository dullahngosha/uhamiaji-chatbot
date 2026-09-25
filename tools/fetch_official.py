#!/usr/bin/env python3
"""
fetch_official.py — Pakua nyaraka rasmi kutoka tovuti ya Idara ya Uhamiaji (immigration.go.tz).

Inapakua:
  * Sheria (Citizenship Act, Passports Act, Refugees Act, Non-Citizens Employment Act)
  * Miongozo ya Pasipoti na Visa, na brochures (Uraia, e-Passport, Residence Permit, ...)
  * Kurasa za maelezo ya huduma za tovuti (aina za visa, ada, madaraja ya vibali, uraia, ...)
  * Maswali na majibu rasmi ya tovuti (yanaongezwa kwenye data/knowledge.json)

Matokeo yanawekwa kwenye folda (chaguo-msingi: rasmi/), kisha build_kb.py huyageuza kuwa data/sheria.json:
    python tools/fetch_official.py
    python tools/build_kb.py rasmi "C:\\Users\\...\\Desktop\\SHERIA ZA UHAMIAJI"
"""
import argparse
import html
import json
import os
import re
import sys
import urllib.request
from datetime import date

API = "https://www.immigration.go.tz/websiteportal/cms/info/by-category"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Makundi ya tovuti yenye PDF za maana (fomu za kujaza — kundi 11 — zinarukwa).
PDF_CATEGORIES = {
    22: "Sheria",        # Acts
    54: "Mwongozo",      # Miongozo ya Pasipoti / Visa
    53: "Brochure",      # Brochures
}
PDF_TITLES = {  # majina mazuri ya kuonyesha
    "Passport": "Mwongozo wa Huduma ya Pasipoti na Hati za Safari",
    "Visa": "Visa Guidelines",
}
PAGE_CATEGORY = 8   # kurasa za maelezo ya huduma
QA_CATEGORY = 17    # maswali na majibu rasmi
SKIP_PAGES = {"uhamiaji", "BUSNESS LINK", "Privacy Statement – KaribuPass"}


def post(category):
    req = urllib.request.Request(API, data=json.dumps({"CategoryId": category}).encode(),
                                 headers={"Content-Type": "application/json", "User-Agent": "HamaHama-KB/2"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    return [x for x in (data.get("data") or []) if x.get("IsPublished") and not x.get("IsDeleted")]


def html_to_text(raw):
    s = html.unescape(html.unescape(raw or ""))
    s = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</h\d>|</tr>", "\n", s)
    s = re.sub(r"(?i)<li[^>]*>", "\n- ", s)
    s = re.sub(r"(?i)</t[dh]>", " | ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    return "\n".join(l.strip(" |") for l in s.splitlines() if l.strip(" |"))


def safe(name):
    return re.sub(r"[^\w .,()'-]+", "", name).strip()[:90]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=os.path.join(ROOT, "rasmi"))
    ap.add_argument("--no-faq", action="store_true", help="Usiongeze maswali rasmi kwenye knowledge.json")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    # 1. PDF
    for cat, kind in PDF_CATEGORIES.items():
        for item in post(cat):
            link = item.get("Link") or ""
            if not link.lower().endswith(".pdf"):
                continue
            title = PDF_TITLES.get(item["Title"].strip(), item["Title"].strip())
            path = os.path.join(args.out, safe(title) + ".pdf")
            try:
                urllib.request.urlretrieve(link, path)
                print(f"  PDF  {kind}: {title}")
            except Exception as exc:
                print(f"  KOSA kupakua {link}: {exc}")

    # 2. Kurasa za huduma -> faili moja la maandishi, kila ukurasa chini ya kichwa chake
    parts = []
    for item in sorted(post(PAGE_CATEGORY), key=lambda x: x.get("InfoId", 0)):
        title = (item.get("Title") or "").strip()
        body = html_to_text(item.get("Description"))
        if title in SKIP_PAGES or len(body) < 40:
            continue
        parts.append(f"## {title}\n{body}\n")
    with open(os.path.join(args.out, "Tovuti ya Uhamiaji - Maelezo ya Huduma.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(parts))
    print(f"  WEB  kurasa {len(parts)} za maelezo ya huduma")

    # 3. Maswali na majibu rasmi -> knowledge.json
    if not args.no_faq:
        items = post(QA_CATEGORY)
        answers = {x["ParentId"]: x for x in items if x.get("ParentId")}
        kb_path = os.path.join(ROOT, "data", "knowledge.json")
        with open(kb_path, encoding="utf-8") as fh:
            kb = json.load(fh)
        existing = {f["id"] for f in kb["faqs"]}
        added = 0
        for q in items:
            if q.get("ParentId") or q["InfoId"] not in answers:
                continue
            question = html_to_text(q.get("Description")).strip().rstrip("?") + "?"
            answer = html_to_text(answers[q["InfoId"]].get("Description")).strip()
            fid = f"official.{q['InfoId']}"
            if fid in existing or not answer:
                continue
            answer = answer[0].upper() + answer[1:]
            if not answer.endswith("."):
                answer += "."
            question = question[0].upper() + question[1:]
            kb["faqs"].append({
                "id": fid,
                "topic": "passport" if re.search(r"(?i)passport|pasipoti|\betd\b", question) else "general",
                "q": {"sw": question, "en": question},
                "aliases": [q.get("SubTitle") or ""],
                "answer": {"sw": {"text": answer}, "en": {"text": answer}},
                "related": [],
                "source": {"document": "immigration.go.tz — Maswali yanayoulizwa mara kwa mara", "pages": []},
            })
            added += 1
        kb["version"] = date.today().isoformat()
        with open(kb_path, "w", encoding="utf-8") as fh:
            json.dump(kb, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"  FAQ  {added} mpya kutoka tovuti -> data/knowledge.json")

    print(f"\nImekamilika -> {args.out}\nSasa endesha: python tools/build_kb.py \"{args.out}\"")


if __name__ == "__main__":
    sys.exit(main())
