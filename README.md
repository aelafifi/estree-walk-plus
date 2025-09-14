# ESTree Walk +

A modern utility library for walking and transforming JavaScript/TypeScript ASTs based on the ESTree spec.  
It provides flexible traversal strategies (free, bidirectional, top‑down, bottom‑up) that make it easy to analyze, transform, or lint code with full control over the visiting process.

## 📦 Installation

```bash
npm install estree-walk-plus
```

## ⚙️ Functions

- `freeWalk` — A flexible ESTree walker that allows custom callbacks for both top-down and bottom-up traversal.
- `bidirectionalWalk` — A bidirectional ESTree walker that allows custom callbacks for both top-down and bottom-up traversal.
- `topDownWalk` — Pre‑order traversal (visit parent before children); great for early pruning and context seeding.
- `bottomUpWalk` — Post‑order traversal (visit children before parent); ideal for aggregations and transforms.
