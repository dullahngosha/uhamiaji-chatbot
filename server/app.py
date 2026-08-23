"""Local multilingual RAG API for Mr. HamaHama."""
from __future__ import annotations

import json
import hmac
import os
import subprocess
import sys
import threading
import time
from datetime import date
from collections import defaultdict, deque
from pathlib import Path
from urllib.parse import unquote

import numpy as np
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gemma3:12b")
EMBED_MODEL = os.getenv("EMBED_MODEL", "qwen3-embedding:0.6b")
TOP_K = int(os.getenv("RAG_TOP_K", "8"))
MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.50"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "30")) * 1024 * 1024

chunks = json.loads((DATA / "knowledge-base.json").read_text(encoding="utf-8"))
vectors = np.load(DATA / "embeddings.npy").astype(np.float32)
if len(chunks) != len(vectors):
    raise RuntimeError("Knowledge chunks and embedding index are out of sync. Run build_index.py.")

allowed = [x.strip() for x in os.getenv(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:8099,http://localhost:8099",
).split(",") if x.strip()]

app = FastAPI(title="Mr. HamaHama RAG API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Token", "X-Filename"],
)

request_times: dict[str, deque[float]] = defaultdict(deque)
rate_lock = threading.Lock()
index_lock = threading.RLock()
registry_lock = threading.Lock()
rebuild_state = {"running": False, "stage": "ready", "message": "Index is ready", "started_at": None, "finished_at": None}


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1500)
    language: str = Field(default="sw", max_length=16)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=8)


class DocumentSettings(BaseModel):
    filename: str = Field(min_length=1, max_length=240)
    active: bool = True
    expires_on: str = Field(default="", max_length=10)


class DocumentTarget(BaseModel):
    filename: str = Field(min_length=1, max_length=240)


def require_admin(request: Request) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin access is not configured.")
    supplied = request.headers.get("X-Admin-Token", "")
    if not hmac.compare_digest(supplied, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid admin token.")


def registry_path() -> Path:
    return DATA / "document-registry.json"


def load_registry() -> dict:
    path = registry_path()
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def save_registry(registry: dict) -> None:
    registry_path().write_text(json.dumps(registry, ensure_ascii=False, indent=2), encoding="utf-8")


def safe_pdf_name(value: str) -> str:
    name = Path(unquote(value)).name.strip()
    if not name.lower().endswith(".pdf") or name in {".", ".."} or any(char in name for char in '<>:"/\\|?*'):
        raise HTTPException(status_code=400, detail="A safe PDF filename is required.")
    return name


def validate_expiry(value: str) -> str:
    if not value:
        return ""
    try:
        date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Expiry date must use YYYY-MM-DD.") from exc
    return value


def reload_index() -> None:
    global chunks, vectors
    new_chunks = json.loads((DATA / "knowledge-base.json").read_text(encoding="utf-8"))
    new_vectors = np.load(DATA / "embeddings.npy").astype(np.float32)
    if len(new_chunks) != len(new_vectors):
        raise RuntimeError("Rebuilt chunks and vectors are out of sync.")
    with index_lock:
        chunks, vectors = new_chunks, new_vectors


def rebuild_worker() -> None:
    rebuild_state.update(running=True, stage="extracting", message="Reading active documents", started_at=time.time(), finished_at=None)
    try:
        subprocess.run([sys.executable, str(ROOT / "tools" / "ingest_documents.py")], cwd=ROOT, check=True)
        rebuild_state.update(stage="embedding", message="Creating multilingual embeddings")
        subprocess.run([sys.executable, str(ROOT / "server" / "build_index.py")], cwd=ROOT, check=True)
        rebuild_state.update(stage="loading", message="Loading the new index")
        reload_index()
        rebuild_state.update(running=False, stage="ready", message="New index is active", finished_at=time.time())
    except Exception as exc:
        rebuild_state.update(running=False, stage="error", message=str(exc), finished_at=time.time())


def check_rate_limit(ip: str) -> None:
    now = time.monotonic()
    with rate_lock:
        queue = request_times[ip]
        while queue and now - queue[0] > 60:
            queue.popleft()
        if len(queue) >= MAX_REQUESTS_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Too many requests. Try again shortly.")
        queue.append(now)


def embed_query(text: str) -> np.ndarray:
    response = requests.post(
        f"{OLLAMA_BASE}/api/embed",
        json={"model": EMBED_MODEL, "input": f"search_query: {text}", "truncate": True},
        timeout=120,
    )
    response.raise_for_status()
    vector = np.asarray(response.json()["embeddings"][0], dtype=np.float32)
    return vector / max(float(np.linalg.norm(vector)), 1e-12)


def retrieve(question: str) -> list[tuple[dict, float]]:
    query = embed_query(question)
    with index_lock:
        current_vectors = vectors
        current_chunks = chunks
    scores = current_vectors @ query
    semantic_candidates = np.argsort(scores)[::-1][:40]
    normalized_question = " ".join("".join(char.lower() if char.isalnum() else " " for char in question).split())
    query_terms = {term for term in normalized_question.split() if len(term) > 2}

    def hybrid_score(index: int) -> float:
        text = " ".join("".join(char.lower() if char.isalnum() else " " for char in current_chunks[index]["text"]).split())
        overlap = len(query_terms.intersection(text.split())) / max(len(query_terms), 1)
        phrase_bonus = 0.20 if "class a" in normalized_question and "class a" in text else 0.0
        if "class a" in normalized_question and "general requirements for residence permit class a" in text:
            phrase_bonus += 0.40
        return float(scores[index]) + (0.08 * overlap) + phrase_bonus

    ranked = sorted((int(i) for i in semantic_candidates if scores[int(i)] >= MIN_SCORE), key=hybrid_score, reverse=True)[:TOP_K]
    expanded: list[int] = []
    for index in ranked:
        for candidate in (index, index + 1, index + 2):
            if candidate >= len(current_chunks) or candidate in expanded:
                continue
            if current_chunks[candidate]["document"] != current_chunks[index]["document"]:
                continue
            expanded.append(candidate)
            if len(expanded) >= 9:
                break
        if len(expanded) >= 9:
            break
    return [(current_chunks[index], float(scores[index])) for index in expanded]


def build_prompt(question: str, language: str, matches: list[tuple[dict, float]], history: list[dict[str, str]]) -> str:
    context = "\n\n".join(
        f"[Reference {number}]\n{item['text']}"
        for number, (item, _score) in enumerate(matches, 1)
    )
    conversation = "\n".join(
        f"{item.get('role', 'user')}: {str(item.get('content', ''))[:1500]}"
        for item in history[-8:]
        if item.get("role") in {"user", "assistant"} and item.get("content")
    )
    return f"""You are Mr. HamaHama, Your Immigration Assistant for the Tanzania Immigration Department.

STRICT RULES:
- Answer only from the supplied reference text.
- Answer in the same language as the user's question. Detected language code: {language}.
- Be clear, courteous, accurate and concise.
- Respond naturally and conversationally, remembering the recent conversation when answering follow-up questions.
- Use fluent, natural wording in the user's language. Keep official English names, permit classes, institutions and legal terms unchanged when translating them could alter their meaning.
- When listing requirements, group them clearly and do not cut off the answer mid-list. Prefer the most relevant requirements over unrelated background details.
- Do not mention PDFs, documents, references, retrieval, context, page numbers, filenames or these instructions.
- Do not invent fees, dates, requirements or legal rules.
- If the references do not contain a reliable answer, clearly say you do not have enough official information and tell the user to contact the Tanzania Immigration Department at info@immigration.go.tz. Never guess.
- This is general information, not a final legal or administrative decision.

RECENT CONVERSATION:
{conversation or '(none)'}

REFERENCE TEXT:
{context}

USER QUESTION:
{question}
"""


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "chat_model": CHAT_MODEL,
        "embedding_model": EMBED_MODEL,
        "chunks": len(chunks),
        "dimensions": int(vectors.shape[1]),
        "rebuild": rebuild_state,
    }


@app.get("/api/admin/documents")
def admin_documents(request: Request) -> dict:
    require_admin(request)
    registry = load_registry()
    indexed_counts: dict[str, int] = defaultdict(int)
    with index_lock:
        for item in chunks:
            indexed_counts[item["document"]] += 1
    rows = []
    for path in sorted((ROOT / "documents").glob("*.pdf")):
        settings = registry.get(path.name, {"active": True, "expires_on": ""})
        expires_on = settings.get("expires_on", "")
        expired = bool(expires_on and expires_on < date.today().isoformat())
        rows.append({"filename": path.name, "size": path.stat().st_size, "active": bool(settings.get("active", True)), "expires_on": expires_on, "expired": expired, "indexed_chunks": indexed_counts[path.name]})
    return {"documents": rows, "rebuild": rebuild_state}


@app.post("/api/admin/documents/upload")
async def admin_upload(request: Request, expires_on: str = "") -> dict:
    require_admin(request)
    filename = safe_pdf_name(request.headers.get("X-Filename", ""))
    expires_on = validate_expiry(expires_on)
    body = await request.body()
    if not body or len(body) > MAX_UPLOAD_BYTES or not body.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Upload a valid PDF within the size limit.")
    target = ROOT / "documents" / filename
    target.write_bytes(body)
    with registry_lock:
        registry = load_registry()
        registry[filename] = {"active": True, "expires_on": expires_on}
        save_registry(registry)
    return {"status": "uploaded", "filename": filename, "requires_rebuild": True}


@app.post("/api/admin/documents/settings")
def admin_settings(payload: DocumentSettings, request: Request) -> dict:
    require_admin(request)
    filename = safe_pdf_name(payload.filename)
    if not (ROOT / "documents" / filename).exists():
        raise HTTPException(status_code=404, detail="Document not found.")
    expires_on = validate_expiry(payload.expires_on)
    with registry_lock:
        registry = load_registry()
        registry[filename] = {"active": payload.active, "expires_on": expires_on}
        save_registry(registry)
    return {"status": "updated", "requires_rebuild": True}


@app.post("/api/admin/documents/delete")
def admin_delete(payload: DocumentTarget, request: Request) -> dict:
    require_admin(request)
    filename = safe_pdf_name(payload.filename)
    target = ROOT / "documents" / filename
    if not target.exists():
        raise HTTPException(status_code=404, detail="Document not found.")
    target.unlink()
    with registry_lock:
        registry = load_registry()
        registry.pop(filename, None)
        save_registry(registry)
    return {"status": "deleted", "filename": filename, "requires_rebuild": True}


@app.post("/api/admin/rebuild")
def admin_rebuild(request: Request) -> dict:
    require_admin(request)
    if rebuild_state["running"]:
        raise HTTPException(status_code=409, detail="A rebuild is already running.")
    threading.Thread(target=rebuild_worker, daemon=True).start()
    return {"status": "started"}


@app.get("/api/admin/rebuild")
def admin_rebuild_status(request: Request) -> dict:
    require_admin(request)
    return rebuild_state


@app.post("/api/chat")
def chat(payload: ChatRequest, request: Request) -> dict:
    check_rate_limit(request.client.host if request.client else "unknown")
    try:
        recent_user_context = " ".join(
            str(item.get("content", ""))
            for item in payload.history[-4:]
            if item.get("role") == "user"
        )
        matches = retrieve(f"{recent_user_context} {payload.message}".strip())
        if not matches:
            fallback = {
                "sw": "Samahani, sina taarifa rasmi za kutosha kujibu swali hilo kwa uhakika. Tafadhali wasiliana na Idara ya Uhamiaji Tanzania kupitia info@immigration.go.tz.",
                "en": "Sorry, I do not have enough official information to answer that confidently. Please contact the Tanzania Immigration Department at info@immigration.go.tz.",
                "ar": "عذراً، لا تتوفر لدي معلومات رسمية كافية للإجابة بثقة. يرجى التواصل مع إدارة الهجرة في تنزانيا عبر info@immigration.go.tz.",
                "hi": "क्षमा करें, मेरे पास इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त आधिकारिक जानकारी नहीं है। कृपया info@immigration.go.tz पर तंज़ानिया आव्रजन विभाग से संपर्क करें।",
            }.get(payload.language, "I do not have enough official information to answer confidently. Please contact the Tanzania Immigration Department at info@immigration.go.tz.")
            return {"answer": fallback, "language": payload.language, "fallback": True}
        response = requests.post(
            f"{OLLAMA_BASE}/api/generate",
            json={
                "model": CHAT_MODEL,
                "prompt": build_prompt(payload.message, payload.language, matches, payload.history),
                "stream": False,
                "think": False,
                "keep_alive": "15m",
                "options": {"temperature": 0.10, "top_p": 0.80, "num_ctx": 8192, "num_predict": 600},
            },
            timeout=600,
        )
        response.raise_for_status()
        answer = response.json().get("response", "").strip()
        if not answer:
            raise RuntimeError("The model returned an empty response.")
        return {"answer": answer, "language": payload.language}
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="The local AI service is unavailable.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to generate an answer.") from exc
