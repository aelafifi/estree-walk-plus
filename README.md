# ESTree Walk +

A modern utility library for walking and transforming JavaScript/TypeScript ASTs based on the AST spec.  
It provides flexible traversal strategies (free, bidirectional, top‑down, bottom‑up) that make it easy to analyze, transform, or lint code with full control over the visiting process.

## 📦 Installation

```bash
npm install estree-walk-plus
```

## ⚙️ Functions

- `freeWalk` — A flexible AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- `bidirectionalWalk` — A bidirectional AST walker that allows custom callbacks for both top-down and bottom-up traversal.
- `topDownWalk` — Pre‑order traversal (visit parent before children); great for early pruning and context seeding.
- `bottomUpWalk` — Post‑order traversal (visit children before parent); ideal for aggregations and transforms.

### `freeWalk(tree, callback, options?)`

> ### Parameters
> - `tree`: `acorn.Node` — The root AST node to start the traversal from.
> - `callback`: `FreeWalkCallback` — A function to be called at each node during traversal.
> - `options`: `WalkOptions` — Options to configure the walker behavior.

> ### Returns
> Updated `state` object that was passed through the traversal.
> 
> An empty object is used by default, or you can provide your own initial state through `options.state`.

> ### Example
> 
> ```typescript
> import { freeWalk, Direction } from "estree-walk-plus";
> 
> // Assuming you already have an ESTree-compatible AST parsed with acorn
> freeWalk(ast, (direction, step, state) => {
>   if (step.node.type === "ForStatement" && direction === Direction.TOP_DOWN) {
>     console.log("Entering a for loop");
>   }
> 
>   if (step.node.type === "CallExpression" && direction === Direction.BOTTOM_UP) {
>     console.log("Exiting a function call");
>   }
> });
> ```