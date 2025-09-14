# ESTree Walk +

A modern utility library for walking and transforming JavaScript/TypeScript ASTs based on the AST spec.  
It provides flexible traversal strategies (free, bidirectional, top‑down, bottom‑up) that make it easy to analyze, transform, or lint code with full control over the visiting process.

## 📦 Installation

```bash
npm install estree-walk-plus
```

## ⚙️ Functions

- [`freeWalk`](./docs/FREE_WALK.md) — A flexible AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- [`bidirectionalWalk`](./docs/BIDIRECTIONAL_WALK.md) — A bidirectional AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- [`topDownWalk`](./docs/TOP_DOWN_WALK.md) — Pre‑order traversal (visit parent before children); great for early pruning and context seeding.
- [`bottomUpWalk`](./docs/BOTTOM_UP_WALK.md) — Post‑order traversal (visit children before parent); ideal for aggregations and transforms.
