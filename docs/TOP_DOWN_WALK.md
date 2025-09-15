# `topDownWalk(tree, callbacks, options?)`

Pre‑order traversal (visit parent before children); great for early pruning and context seeding.

A top-down AST walker that allows custom callbacks for node types.

In the `callbacks` object, keys should be the node types (e.g., "FunctionDeclaration", "VariableDeclaration").

## Parameters

- `tree`: `acorn.Node` — The root AST node to start the traversal from.
- `callbacks`: `Record<string, DirectionalWalkCallback>` — An object mapping node types to callback functions.
- `options`: [`WalkOptions`](./WALK_OPTIONS.md) — Options to configure the walker behavior.

## Returns

Updated `state` object that was passed through the traversal.

An empty object is used by default, or you can provide your own initial state through `options.state`.

## Example

```typescript
import { topDownWalk } from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
topDownWalk(ast, {
    FunctionDeclaration(step, state) {
        console.log("Function found:", step.node.id?.name);
        // You can modify the state or even replace the node here
    },
    VariableDeclaration(step, state) {
        console.log("Variable declaration with", step.node.declarations.length, "declarators");
    },
    CallExpression(step, state) {
        // Only called when entering a CallExpression (top-down)
        console.log("Function call encountered");
    }
});
```

## Use Cases

Top-down traversal is particularly useful for:

- **Early pruning**: Skip entire subtrees based on parent node conditions
- **Context seeding**: Set up context or state before processing children
- **Preprocessing**: Modify or annotate nodes before their children are processed
- **Conditional traversal**: Decide whether to visit children based on parent conditions