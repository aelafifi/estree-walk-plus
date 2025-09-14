# `bidirectionalWalk(tree, callbacks, options?)`

A bidirectional AST walker that allows custom callbacks for both top-down and bottom-up traversal.

The callbacks are specified in a single object, with keys prefixed to indicate the direction (which can be customized via options, default prefixes are "enter_" for top-down and "leave_" for bottom-up).

The rest of the key is the node type (e.g., "enter_FunctionDeclaration", "leave_VariableDeclaration").

## Parameters

- `tree`: `acorn.Node` — The root AST node to start the traversal from.
- `callbacks`: `Record<string, DirectionalWalkCallback>` — An object mapping node types (with prefixes) to callback functions.
- `options`: [`DirectionalWalkOptions`](./WALK_OPTIONS.md) — Options to configure the walker behavior, including prefix customization.

## Returns

Updated `state` object that was passed through the traversal.

An empty object is used by default, or you can provide your own initial state through `options.state`.

## Example

```typescript
import { bidirectionalWalk } from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
bidirectionalWalk(ast, {
    enter_FunctionDeclaration(step, state) {
        console.log("Entering function:", step.node.id?.name);
    },
    leave_FunctionDeclaration(step, state) {
        console.log("Leaving function:", step.node.id?.name);
    },
    enter_VariableDeclaration(step, state) {
        console.log("Variable declaration encountered");
    }
});
```

## Custom Prefixes

You can customize the prefixes used for top-down and bottom-up callbacks:

```typescript
import { bidirectionalWalk } from "estree-walk-plus";

bidirectionalWalk(ast, {
    beforeFunctionDeclaration(step, state) {
        console.log("Before function:", step.node.id?.name);
    },
    afterFunctionDeclaration(step, state) {
        console.log("After function:", step.node.id?.name);
    }
}, {
    topDownPrefix: "before",
    bottomUpPrefix: "after"
});
```