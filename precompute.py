#!/usr/bin/env python3
"""Embed lines from cats-cradle.txt with all-MiniLM-L6-v2 and project to 2D via t-SNE."""

import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer
import umap

MODEL_NAME = "all-MiniLM-L6-v2"
RANDOM_SEED = 2

def read_lines(path: Path) -> list[str]:
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]

def normalize(coords: np.ndarray) -> np.ndarray:
    min_xy = coords.min(axis=0)
    max_xy = coords.max(axis=0)
    span = np.where((max_xy - min_xy) == 0, 1, max_xy - min_xy)
    return (coords - min_xy) / span

def main() -> None:
    INPUT_PATH = Path("cats-cradle.txt")
    OUTPUT_PATH = Path("points.json")
    lines = read_lines(INPUT_PATH)

    print(f"Loading model {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    print(f"Embedding {len(lines)} lines...")
    embeddings = model.encode(lines, normalize_embeddings=True, show_progress_bar=True)
    n_neighbors = max(2, min(15, len(lines) - 1))
    print(f"Running UMAP (n_neighbors={n_neighbors})...")

    reducer = umap.UMAP(
        n_neighbors=n_neighbors,
        n_components=2,
        metric="cosine",
        random_state=RANDOM_SEED,
        init="random",
        min_dist=0.1,
    )
    coords = reducer.fit_transform(embeddings)
    coords = normalize(coords)

    points = [
        {"index": i, "label": line, "x": float(x), "y": float(y)}
        for i, (line, (x, y)) in enumerate(zip(lines, coords))
    ]

    OUTPUT_PATH.write_text(json.dumps({"points": points}, indent=2), encoding="utf-8")
    print(f"Wrote {len(points)} points to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
