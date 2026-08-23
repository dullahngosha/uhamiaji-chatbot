"""Create a normalized multilingual vector index using local Ollama."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OLLAMA = "http://127.0.0.1:11434/api/embed"
MODEL = "qwen3-embedding:0.6b"
BATCH_SIZE = 24


def embed(texts: list[str]) -> np.ndarray:
    response = requests.post(
        OLLAMA,
        json={"model": MODEL, "input": texts, "truncate": True},
        timeout=300,
    )
    response.raise_for_status()
    vectors = np.asarray(response.json()["embeddings"], dtype=np.float32)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / np.maximum(norms, 1e-12)


def main() -> None:
    chunks = json.loads((DATA / "knowledge-base.json").read_text(encoding="utf-8"))
    vectors = []
    total = len(chunks)
    for start in range(0, total, BATCH_SIZE):
        batch = chunks[start : start + BATCH_SIZE]
        inputs = [f"search_document: {item['category']}\n{item['text']}" for item in batch]
        vectors.append(embed(inputs))
        print(f"Embedded {min(start + len(batch), total)}/{total}", flush=True)
    matrix = np.vstack(vectors)
    np.save(DATA / "embeddings.npy", matrix)
    metadata = {"model": MODEL, "chunks": total, "dimensions": int(matrix.shape[1])}
    (DATA / "index-metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Saved {matrix.shape[0]} x {matrix.shape[1]} normalized vectors")


if __name__ == "__main__":
    main()
