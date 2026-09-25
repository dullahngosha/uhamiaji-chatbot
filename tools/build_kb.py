#!/usr/bin/env python3
"""
build_kb.py — Geuza sheria, kanuni na miongozo ya Uhamiaji kuwa data ya chatbot.

Inasoma folda moja au zaidi (PDF, DOCX, TXT, MD), inaruka faili zinazojirudia au
zinazofanana, inagawa kila sheria katika vifungu, kisha inaandika data/sheria.json.
Mr. HamaHama anaonyesha vifungu hivyo neno kwa neno — hakuna kubuni.

Mfano (Windows, PowerShell):
    pip install pypdf python-docx
    python tools\\build_kb.py "C:\\Users\\ABDALLAH MAJID NASSOR\\Desktop\\hamahama" ^
                              "C:\\Users\\ABDALLAH MAJID NASSOR\\Desktop\\SHERIA ZA UHAMIAJI"

Chaguo:
    --out data/sheria.json   faili la matokeo (chaguo-msingi)
    --similar 0.85           kiwango cha kufanana (0-1) cha kuhesabu faili kuwa nakala
    --faq maswali.csv        pia unganisha FAQ kutoka CSV/Excel-CSV kwenye data/knowledge.json
"""
import argparse
import csv
import hashlib
import json
import os
import re
import sys
import unicodedata
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EXTS = {".pdf", ".docx", ".txt", ".md"}


# ---------------------------------------------------------------- extraction
def read_pdf(path):
    try:
        from pypdf import PdfReader
    except ImportError:
        sys.exit("Sakinisha kwanza:  pip install pypdf python-docx")
    reader = PdfReader(path)
    return [(i + 1, page.extract_text() or "") for i, page in enumerate(reader.pages)]


def read_docx(path):
    try:
        import docx
    except ImportError:
        sys.exit("Sakinisha kwanza:  pip install pypdf python-docx")
    d = docx.Document(path)
    lines = [p.text for p in d.paragraphs]
    for table in d.tables:
        for row in table.rows:
            lines.append(" | ".join(c.text.strip() for c in row.cells))
    return [(None, "\n".join(lines))]


def read_text(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        return [(None, fh.read())]


def extract(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return read_pdf(path)
    if ext == ".docx":
        return read_docx(path)
    return read_text(path)


def clean(text):
    text = unicodedata.normalize("NFC", text).replace("\u00ad", "").replace("\t", " ")
    text = re.sub(r"[ \u00a0]{2,}", " ", text)
    text = re.sub(r"-\n(?=[a-z])", "", text)  # neno lililokatwa mwishoni mwa mstari
    return text


# ---------------------------------------------------------------- de-duplication
def fingerprint(text):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {" ".join(words[i:i + 5]) for i in range(0, max(len(words) - 4, 1), 3)}


def similarity(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / min(len(a), len(b))  # kufanana kwa sehemu ndogo: nakala fupi ndani ya ndefu = 1.0


# ---------------------------------------------------------------- sectioning
SEC_RE = re.compile(
    r"^\s*(?:(?:Section|Sect\.|Kifungu(?: cha)?)\s+)?(\d{1,3}[A-Z]?)\s*[.:]\s*(?:[-\u2013\u2014]\s*)?(\(1\)\s*)?(.*)$"
)
PART_RE = re.compile(r"^\s*(PART|SEHEMU(?: YA)?)\s+([IVXLC]+|[A-Z]+|\d+)\b.*$", re.I)
HEADING_RE = re.compile(r"^[A-Z0-9][A-Z0-9 ,'&()/\-]{4,80}$")


def split_sections(pages):
    """Rudisha orodha ya vifungu [{no,title,text,page,part}]."""
    lines = []
    for page_no, text in pages:
        for line in clean(text).splitlines():
            if line.strip():
                lines.append((page_no, line.strip()))

    sections, cur, last_no, part = [], None, 0, ""
    prev_short, part_title_next = "", False
    for page_no, line in lines:
        pm = PART_RE.match(line)
        if pm and len(line) < 90:
            part, prev_short, part_title_next = line, "", True
            continue
        if part_title_next:
            part_title_next = False
            if HEADING_RE.match(line):  # jina la Sehemu, mf. "PRELIMINARY PROVISIONS"
                part += " - " + line
                continue
        m = SEC_RE.match(line)
        if m:
            num = int(re.match(r"\d+", m.group(1)).group())
            # Kubali tu nambari zinazofuatana (epuka orodha za ndani ya kifungu)
            if last_no < num <= last_no + 4 or (num == last_no and m.group(1)[-1:].isalpha()):
                if cur:
                    # kichwa cha kifungu kipya kisibaki mwishoni mwa kifungu kilichopita
                    if prev_short and cur["text"].endswith(prev_short):
                        cur["text"] = cur["text"][: -len(prev_short)].rstrip()
                    sections.append(cur)
                title = prev_short or m.group(3)[:90]
                cur = {"no": m.group(1), "title": title.strip(" .-"), "text": ((m.group(2) or "") + m.group(3)).strip(),
                       "page": page_no, "part": part}
                last_no = num
                prev_short = ""
                continue
        if cur:
            cur["text"] += "\n" + line
        # Kichwa cha pembeni (marginal note) huwa mstari mfupi usio na nukta mwishoni
        prev_short = line if (len(line) <= 70 and not line.endswith((".", ";", ",", ":")) and not line[0].isdigit()) else ""
    if cur:
        sections.append(cur)

    if len(sections) >= 3:
        return sections
    return split_by_headings(lines)


def split_by_headings(lines, size=1200):
    """Kwa miongozo isiyo na vifungu vya nambari: gawa kwa vichwa vya herufi kubwa au kwa urefu."""
    sections, cur = [], None
    for page_no, line in lines:
        is_head = HEADING_RE.match(line) and len(line.split()) <= 10
        if cur is None or is_head or len(cur["text"]) > size:
            if cur and cur["text"].strip():
                sections.append(cur)
            cur = {"no": "", "title": line[:90] if is_head else (cur["title"] + " (endelea)" if cur else line[:90]),
                   "text": "" if is_head else line, "page": page_no, "part": ""}
            continue
        cur["text"] += ("\n" if cur["text"] else "") + line
    if cur and cur["text"].strip():
        sections.append(cur)
    return sections


def title_of(path, pages):
    name = os.path.splitext(os.path.basename(path))[0]
    name = re.sub(r"[_]+", " ", name).strip()
    return re.sub(r"\s{2,}", " ", name)


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


# ---------------------------------------------------------------- FAQ CSV import
def import_faq_csv(csv_path, kb_path):
    """CSV yenye safu: id, topic, swali_sw, question_en, jibu_sw, answer_en,
    hatua_sw, steps_en (hatua zitenganishwe kwa |), aliases (|), document, pages (mf. 3|4)."""
    with open(kb_path, encoding="utf-8") as fh:
        kb = json.load(fh)
    existing = {f["id"]: f for f in kb["faqs"]}
    added = updated = 0
    with open(csv_path, encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh):
            row = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}
            if not row.get("id") or not row.get("topic"):
                continue
            split = lambda v: [x.strip() for x in v.split("|") if x.strip()]
            entry = {
                "id": row["id"], "topic": row["topic"],
                "q": {"sw": row.get("swali_sw", ""), "en": row.get("question_en", "") or row.get("swali_sw", "")},
                "aliases": split(row.get("aliases", "")),
                "answer": {
                    "sw": {"text": row.get("jibu_sw", ""), "steps": split(row.get("hatua_sw", ""))},
                    "en": {"text": row.get("answer_en", "") or row.get("jibu_sw", ""), "steps": split(row.get("steps_en", ""))},
                },
                "related": split(row.get("related", "")),
                "source": {"document": row["document"], "pages": [int(p) for p in split(row.get("pages", "")) if p.isdigit()]}
                if row.get("document") else None,
            }
            if row["id"] in existing:
                existing[row["id"]].update(entry)
                updated += 1
            else:
                kb["faqs"].append(entry)
                added += 1
    kb["version"] = date.today().isoformat()
    with open(kb_path, "w", encoding="utf-8") as fh:
        json.dump(kb, fh, ensure_ascii=False, indent=2)
    print(f"FAQ: {added} mpya, {updated} zimesasishwa -> {kb_path}")


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folders", nargs="*", help="Folda (au faili) zenye sheria na miongozo")
    ap.add_argument("--out", default=os.path.join(ROOT, "data", "sheria.json"))
    ap.add_argument("--similar", type=float, default=0.85)
    ap.add_argument("--faq", help="CSV ya maswali na majibu ya kuunganisha kwenye knowledge.json")
    args = ap.parse_args()

    if args.faq:
        import_faq_csv(args.faq, os.path.join(ROOT, "data", "knowledge.json"))
    if not args.folders:
        if not args.faq:
            ap.print_help()
        return

    files = []
    for target in args.folders:
        if os.path.isfile(target):
            files.append(target)
            continue
        for dirpath, _, names in os.walk(target):
            for n in sorted(names):
                if os.path.splitext(n)[1].lower() in EXTS and not n.startswith("~$"):
                    files.append(os.path.join(dirpath, n))

    docs, seen_hash = [], {}
    for path in files:
        with open(path, "rb") as fh:
            digest = hashlib.sha1(fh.read()).hexdigest()
        if digest in seen_hash:
            print(f"  RUKA (nakala halisi ya {os.path.basename(seen_hash[digest])}): {path}")
            continue
        seen_hash[digest] = path
        try:
            pages = extract(path)
        except Exception as exc:  # faili bovu au limefungwa
            print(f"  KOSA kusoma {path}: {exc}")
            continue
        full = "\n".join(t for _, t in pages)
        if len(full.strip()) < 200:
            print(f"  RUKA (halina maandishi — huenda ni PDF ya picha, inahitaji OCR): {path}")
            continue
        docs.append({"path": path, "pages": pages, "text": full, "fp": fingerprint(full)})

    # Ondoa zinazofanana: weka toleo refu zaidi (kwa kawaida ndilo kamili/jipya)
    docs.sort(key=lambda d: len(d["text"]), reverse=True)
    kept = []
    for d in docs:
        dup = next((k for k in kept if similarity(d["fp"], k["fp"]) >= args.similar), None)
        if dup:
            print(f"  RUKA (inafanana {similarity(d['fp'], dup['fp']):.0%} na {os.path.basename(dup['path'])}): {d['path']}")
            continue
        kept.append(d)

    laws, ids = [], set()
    for d in sorted(kept, key=lambda d: os.path.basename(d["path"]).lower()):
        title = title_of(d["path"], d["pages"])
        sections = split_sections(d["pages"])
        for s in sections:
            s["text"] = re.sub(r"\n{3,}", "\n\n", s["text"]).strip()
        sections = [s for s in sections if len(s["text"]) > 20 or s["title"]]
        lid = slug(title) or "sheria"
        while lid in ids:
            lid += "-2"
        ids.add(lid)
        laws.append({"id": lid, "title": title, "file": os.path.basename(d["path"]), "sections": sections})
        print(f"  OK  {title}: vifungu {len(sections)}")

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump({"generated": date.today().isoformat(), "laws": laws}, fh, ensure_ascii=False, indent=1)
    size = os.path.getsize(args.out) / 1024
    print(f"\nSheria {len(laws)} (kati ya faili {len(files)}) -> {args.out} ({size:.0f} KB)")
    print("Kagua data/sheria.json, kisha fanya commit na push ili GitHub Pages isasishe chatbot.")


if __name__ == "__main__":
    main()
