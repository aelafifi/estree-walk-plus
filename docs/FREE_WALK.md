# `freeWalk(tree, callback, options?)`

## Parameters

- `tree`: `acorn.Node` — The root AST node to start the traversal from.
- `callback`: [`FreeWalkCallback`](./WALK_CALLBACKS.md) — A function to be called at each node during traversal.
- `options`: [`WalkOptions`](./WALK_OPTIONS.md) — Options to configure the walker behavior.

## Returns

Updated `state` object that was passed through the traversal.

An empty object is used by default, or you can provide your own initial state through `options.state`.

## Example

```typescript
import {freeWalk, Direction} from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
freeWalk(ast, (direction, step, state) => {
    if (step.node.type === "ForStatement" && direction === Direction.TOP_DOWN) {
        console.log("Entering a for loop");
    }

    if (step.node.type === "CallExpression" && direction === Direction.BOTTOM_UP) {
        console.log("Exiting a function call");
    }
});
```
