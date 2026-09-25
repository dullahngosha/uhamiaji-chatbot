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
SKIP_DIRS = {"tools", "data", "assets", "node_modules", "__pycache__", "vendor"}


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
# Vichwa vya miongozo/brochures: "2.1 PASIPOTI YA KAWAIDA (ORDINARY PASSPORT)", "UTANGULIZI"
GUIDE_HEAD_RE = re.compile(r"^(\d{1,2}(\.\d{1,2})*\.?\s+)?[A-Z][A-Z0-9 ,'&()/\-.:?]{5,90}$")
FORM_LINE_RE = re.compile(r"[.\u2026_]{6,}")


NOISE_RE = re.compile(
    r"^(\u00a9|Acts?\s+Nos?\.?|Act\s+No\.?|G\.?\s?N\.?\s+No|R\.?\s?L\.?\s+Caps?|Caps?\.\s*\d|Ord\.?\s+No|"
    r"\[\s*\d|\d+\s+of\s+\d{4}\b|s{1,2}\.\s*\d+[A-Z]?(\(\d+\))?\s*$|\d{1,4}\s*$)", re.I)


def page_lines(pages):
    """Mistari safi: ondoa vichwa/miguu inayojirudia kila ukurasa na marejeo ya marekebisho pembeni."""
    per_page = [[l.strip() for l in clean(t).splitlines() if l.strip()] for _, t in pages]
    counts = {}
    for lines in per_page:
        for l in set(re.sub(r"\d+", "#", l) for l in lines):
            counts[l] = counts.get(l, 0) + 1
    limit = max(3, int(len(pages) * 0.4)) if len(pages) >= 4 else 10 ** 9
    out, form_lines, total = [], 0, 0
    for (page_no, _), lines in zip(pages, per_page):
        for l in lines:
            total += 1
            if FORM_LINE_RE.search(l):
                form_lines += 1
                continue
            if counts.get(re.sub(r"\d+", "#", l), 0) >= limit or NOISE_RE.match(l):
                continue
            out.append((page_no, l))
    if total and form_lines / total > 0.15:
        raise FormDocument()
    return out


class FormDocument(Exception):
    """Faili ni fomu ya kujaza (mistari ya ...... mingi) — haina majibu."""


def scan_sections(lines):
    """Pita mistari na kukusanya vifungu. Nambari zikianza upya kutoka 1 (baada ya orodha ya
    vifungu/TOC), anza "mzunguko" mpya. Rudisha orodha ya mizunguko."""
    passes, sections, cur, last_no, part = [], [], None, 0, ""
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
            restart = num == 1 and last_no >= 3
            # Kubali tu nambari zinazofuatana (epuka orodha za ndani ya kifungu)
            if restart or last_no < num <= last_no + 4 or (num == last_no and m.group(1)[-1:].isalpha()):
                if cur:
                    # kichwa cha kifungu kipya kisibaki mwishoni mwa kifungu kilichopita
                    if prev_short and cur["text"].endswith(prev_short):
                        cur["text"] = cur["text"][: -len(prev_short)].rstrip()
                    sections.append(cur)
                if restart:
                    passes.append(sections)
                    sections = []
                title = prev_short or m.group(3)[:90]
                cur = {"no": m.group(1), "title": title.strip(" .-\u2013"), "text": ((m.group(2) or "") + m.group(3)).strip(),
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
    passes.append(sections)
    return [p for p in passes if p]


def split_sections(pages):
    """Rudisha orodha ya vifungu [{no,title,text,page,part}]."""
    lines = page_lines(pages)
    head = " ".join(l for _, l in lines[:80])
    if not re.search(r"\bThis Act may be cited\b|\bAN ACT\b|\bAn Act to\b", head):
        return split_by_headings(lines)  # mwongozo/brochure, si sheria
    passes = scan_sections(lines)
    if not passes or max(len(p) for p in passes) < 3:
        return split_by_headings(lines)
    body = max(passes, key=lambda p: sum(len(s["text"]) for s in p))
    # Orodha ya vifungu (TOC): mzunguko wenye maandishi mafupi — tumia vichwa vyake.
    toc = {}
    for p in passes:
        if p is not body and sum(len(s["text"]) for s in p) / len(p) < 150:
            for s in p:
                t = s["text"].split("\n")[0].strip(" .")
                if 2 < len(t) <= 120:
                    toc.setdefault(s["no"], t)
    key = lambda t: re.sub(r"[^a-z0-9]+", "", t.lower())
    titles = {key(t) for t in toc.values()}
    for s in body:
        if s["no"] in toc:
            s["title"] = toc[s["no"]]
        if titles:
            s["text"] = strip_margin_notes(s["text"].split("\n"), titles, key)
    return body


def strip_margin_notes(lines, titles, key):
    """Ondoa vichwa vya pembeni (marginal notes) vilivyochanganyika na maandishi, hata vikiwa
    vimevunjika katika mistari 2-4 (mf. "Persons born in United Republic on or after" + "Union Day")."""
    out, i = [], 0
    while i < len(lines):
        for n in (4, 3, 2, 1):
            if i + n <= len(lines) and key(" ".join(lines[i:i + n])) in titles:
                i += n
                break
        else:
            out.append(lines[i])
            i += 1
    return "\n".join(out)


# Vichwa vifupi vya huduma kwa herufi ndogo: "Re-Entry Pass", "In Transit Pass", "Student Visa"
SERVICE_HEAD_RE = re.compile(r"^(?:[A-Z][\w'-]*\s+){0,3}(Pass|Visa|Permit|Passport|Certificate|Document)$")
SUBHEAD_RE = re.compile(r"^\d{1,2}\.\d{1,2}(\.\d{1,2})?\.?\s+[A-Z][\w ,'()/&-]{2,70}$")


def split_by_headings(lines, size=1800):
    """Kwa miongozo isiyo na vifungu vya nambari: gawa kwa vichwa vya herufi kubwa au kwa urefu."""
    sections, cur = [], None
    for page_no, line in lines:
        words = line.split()
        if line.startswith("## "):  # kichwa kilichowekwa wazi (mf. kurasa za tovuti kutoka fetch_official.py)
            line = line[3:].strip()
            if cur and cur["text"].strip():
                sections.append(cur)
            cur = {"no": "", "title": line[:90], "base": line[:90], "part_no": 1, "text": "", "page": page_no, "part": ""}
            continue
        is_head = (bool(GUIDE_HEAD_RE.match(line)) and 2 <= len(words) <= 12 and sum(c.isalpha() for c in line) >= 6) \
            or (bool(SUBHEAD_RE.match(line)) and not line.endswith((".", ";", ","))) \
            or bool(SERVICE_HEAD_RE.match(line))
        if cur is None or is_head or len(cur["text"]) > size:
            if cur and cur["text"].strip():
                sections.append(cur)
            if is_head or cur is None:
                base, part_no = line[:90].strip(" .:"), 1
            else:
                base, part_no = cur["base"], cur["part_no"] + 1
            cur = {"no": "", "title": base if part_no == 1 else f"{base} ({part_no})", "base": base, "part_no": part_no,
                   "text": "" if is_head else line, "page": page_no, "part": ""}
            continue
        cur["text"] += ("\n" if cur["text"] else "") + line
    if cur and cur["text"].strip():
        sections.append(cur)
    for s in sections:
        s.pop("base", None)
        s.pop("part_no", None)
    return sections


def reflow(text):
    """Unganisha mistari iliyokatwa na upana wa ukurasa wa PDF; aya mpya huanza kwa (1), (a),
    ufafanuzi wa neno ("...") au baada ya mstari unaoishia kwa . ; : -"""
    out = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        starts_new = re.match(r"^(\(\w{1,5}\)|[\u201c\"]|[-\u2022\u25cf\u2013\u2014*]\s|\d+[.)]\s|[A-Z][A-Z ,'&()/-]{6,}$)", line)
        if out and not starts_new and not re.search(r"[.;:!?\-\u2013\u2014]$", out[-1]):
            joiner = "" if out[-1].endswith("-") else " "
            out[-1] = out[-1] + joiner + line
        else:
            out.append(line)
    return "\n".join(out)


def title_of(path, pages):
    name = os.path.splitext(os.path.basename(path))[0]
    name = re.sub(r"[_]+", " ", name).strip()
    return re.sub(r"\s{2,}", " ", name)


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


# ---------------------------------------------------------------- FAQ CSV import
def import_faq_csv(csv_path, kb_path):
    """CSV yenye safu: id, topic, kikundi_sw, group_en, swali_sw, question_en, jibu_sw, answer_en,
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
                "group": {"sw": row.get("kikundi_sw", ""), "en": row.get("group_en", "") or row.get("kikundi_sw", "")},
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
        for dirpath, dirnames, names in os.walk(target):
            # ruka folda za mfumo (repo yenyewe inaweza kuwa ndani ya folda ya sheria)
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
            for n in sorted(names):
                if os.path.splitext(n)[1].lower() in EXTS and not n.startswith("~$") \
                        and not re.match(r"(?i)^(readme|license|changelog)\b", n):
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
        try:
            sections = split_sections(d["pages"])
        except FormDocument:
            print(f"  RUKA (ni fomu ya kujaza, haina majibu): {d['path']}")
            continue
        for s in sections:
            s["text"] = re.sub(r"\n{3,}", "\n\n", s["text"]).strip()
        for s in sections:
            s["text"] = reflow(s["text"])
        sections = [s for s in sections if len(s["text"]) > 20 or s["title"]]
        lid = slug(title) or "sheria"
        while lid in ids:
            lid += "-2"
        ids.add(lid)
        law = {"id": lid, "title": title, "file": os.path.basename(d["path"]), "sections": sections}
        if os.path.basename(d["path"]).startswith("Tovuti ya Uhamiaji"):
            law["priority"] = 1.3  # kurasa za tovuti rasmi: safi na za sasa (mf. majedwali ya ada)
            law["file"] = "immigration.go.tz"
        laws.append(law)
        print(f"  OK  {title}: vifungu {len(sections)}")

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump({"generated": date.today().isoformat(), "laws": laws}, fh, ensure_ascii=False, indent=1)
    size = os.path.getsize(args.out) / 1024
    print(f"\nSheria {len(laws)} (kati ya faili {len(files)}) -> {args.out} ({size:.0f} KB)")
    print("Kagua data/sheria.json, kisha fanya commit na push ili GitHub Pages isasishe chatbot.")


if __name__ == "__main__":
    main()
