"""Build browser-readable chunks from the official PDF document folder."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "documents"
DATA = ROOT / "data"


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def category(name: str) -> str:
    n = name.lower()
    if "visa" in n or "entry" in n or "business pass" in n or "special pass" in n:
        return "Visa na kuingia"
    if "passport" in n or "pasipoti" in n or "travel document" in n:
        return "Pasipoti"
    if "residence" in n or "dependent" in n or "dependant" in n or "employment" in n or "exemption" in n:
        return "Vibali"
    if "citizen" in n or "uraia" in n or "natural" in n:
        return "Uraia"
    if "refugee" in n or "wahamiaji" in n:
        return "Sheria na ulinzi"
    return "Huduma nyingine"


def main() -> None:
    DATA.mkdir(exist_ok=True)
    registry_path = DATA / "document-registry.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {}
    documents, chunks = [], []
    for path in sorted(DOCS.glob("*.pdf")):
        settings = registry.setdefault(path.name, {"active": True, "expires_on": ""})
        expired = bool(settings.get("expires_on") and settings["expires_on"] < date.today().isoformat())
        item = {"id": path.stem.lower().replace(" ", "-")[:80], "title": path.name, "category": category(path.name), "pages": 0, "size": path.stat().st_size, "active": bool(settings.get("active", True)), "expires_on": settings.get("expires_on", ""), "expired": expired}
        if not item["active"] or expired:
            documents.append(item)
            continue
        try:
            reader = PdfReader(str(path))
            item["pages"] = len(reader.pages)
            for page_number, page in enumerate(reader.pages, 1):
                text = clean(page.extract_text())
                if not text:
                    continue
                for start in range(0, len(text), 1200):
                    part = text[start:start + 1500]
                    if len(part) >= 80:
                        chunks.append({"document": path.name, "page": page_number, "category": item["category"], "text": part})
        except Exception as exc:
            # Some government form PDFs have damaged cross-reference tables.
            # PyMuPDF is more tolerant, so keep the document searchable.
            try:
                import fitz
                with fitz.open(path) as fallback:
                    item["pages"] = len(fallback)
                    for page_number, page in enumerate(fallback, 1):
                        text = clean(page.get_text())
                        for start in range(0, len(text), 1200):
                            part = text[start:start + 1500]
                            if len(part) >= 80:
                                chunks.append({"document": path.name, "page": page_number, "category": item["category"], "text": part})
                item["reader"] = "pymupdf-fallback"
            except Exception as fallback_exc:
                item["error"] = f"pypdf: {exc}; pymupdf: {fallback_exc}"
        documents.append(item)
    (DATA / "documents.json").write_text(json.dumps(documents, ensure_ascii=False, indent=2), encoding="utf-8")
    (DATA / "knowledge-base.json").write_text(json.dumps(chunks, ensure_ascii=False), encoding="utf-8")
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Indexed {len(documents)} documents into {len(chunks)} searchable chunks")


if __name__ == "__main__":
    main()
