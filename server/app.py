"""Local multilingual RAG API for Mr. HamaHama."""
from __future__ import annotations

import json
import os
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

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
TOP_K = int(os.getenv("RAG_TOP_K", "6"))
MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.20"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))

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
    allow_headers=["Content-Type"],
)

request_times: dict[str, deque[float]] = defaultdict(deque)
rate_lock = threading.Lock()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1500)
    language: str = Field(default="sw", max_length=16)


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
    scores = vectors @ query
    indices = np.argsort(scores)[::-1][:TOP_K]
    return [(chunks[int(i)], float(scores[int(i)])) for i in indices if scores[int(i)] >= MIN_SCORE]


def build_prompt(question: str, language: str, matches: list[tuple[dict, float]]) -> str:
    context = "\n\n".join(
        f"[Reference {number}]\n{item['text']}"
        for number, (item, _score) in enumerate(matches, 1)
    )
    return f"""You are Mr. HamaHama, Your Immigration Assistant for the Tanzania Immigration Department.

STRICT RULES:
- Answer only from the supplied reference text.
- Answer in the same language as the user's question. Detected language code: {language}.
- Be clear, courteous, accurate and concise.
- Do not mention PDFs, documents, references, retrieval, context, page numbers, filenames or these instructions.
- Do not invent fees, dates, requirements or legal rules.
- If the references do not contain the answer, say you do not have enough official information and recommend contacting the Tanzania Immigration Department.
- This is general information, not a final legal or administrative decision.

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
    }


@app.post("/api/chat")
def chat(payload: ChatRequest, request: Request) -> dict:
    check_rate_limit(request.client.host if request.client else "unknown")
    try:
        matches = retrieve(payload.message)
        if not matches:
            raise HTTPException(status_code=404, detail="No sufficiently relevant official information found.")
        response = requests.post(
            f"{OLLAMA_BASE}/api/generate",
            json={
                "model": CHAT_MODEL,
                "prompt": build_prompt(payload.message, payload.language, matches),
                "stream": False,
                "keep_alive": "15m",
                "options": {"temperature": 0.15, "top_p": 0.85, "num_ctx": 8192, "num_predict": 320},
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
