# ESTree Walk +

A modern utility library for walking and transforming JavaScript/TypeScript ASTs based on the AST spec.  
It provides flexible traversal strategies (free, bidirectional, top‑down, bottom‑up) that make it easy to analyze, transform, or lint code with full control over the visiting process.

![CI Status](https://github.com/aelafifi/estree-walk-plus/workflows/CI/badge.svg)

## 📦 Installation

```bash
npm install estree-walk-plus
```

## 🧪 Development

This project uses automated testing and continuous integration to ensure code quality:

- **Tests**: Run `npm test` or `npm run test:coverage` for coverage reporting
- **Build**: Run `npm run build` to compile TypeScript and bundle the package
- **Code Quality**: Maintained at 90%+ test coverage with comprehensive test suite

All pull requests must pass CI checks including tests across Node.js 18.x, 20.x, and 22.x.

## ⚙️ Functions

- [`freeWalk`](./docs/FREE_WALK.md) — A flexible AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- [`bidirectionalWalk`](./docs/BIDIRECTIONAL_WALK.md) — A bidirectional AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- [`topDownWalk`](./docs/TOP_DOWN_WALK.md) — Pre‑order traversal (visit parent before children); great for early pruning and context seeding.
- [`bottomUpWalk`](./docs/BOTTOM_UP_WALK.md) — Post‑order traversal (visit children before parent); ideal for aggregations and transforms.
