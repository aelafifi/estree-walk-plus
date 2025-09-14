# `bottomUpWalk(tree, callbacks, options?)`

Post‑order traversal (visit children before parent); ideal for aggregations and transforms.

A bottom-up AST walker that allows custom callbacks for node types.

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
import { bottomUpWalk } from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
bottomUpWalk(ast, {
    FunctionDeclaration(step, state) {
        console.log("Function processed:", step.node.id?.name);
        // All children have already been processed at this point
    },
    VariableDeclaration(step, state) {
        console.log("Variable declaration processed with", step.node.declarations.length, "declarators");
    },
    CallExpression(step, state) {
        // Only called when leaving a CallExpression (bottom-up)
        console.log("Function call processed, all arguments already handled");
    }
});
```

## Use Cases

Bottom-up traversal is particularly useful for:

- **Aggregations**: Collect information from child nodes before processing the parent
- **Transformations**: Modify nodes after their children have been processed
- **Validation**: Check constraints that depend on the state of child nodes
- **Code generation**: Generate code where children must be processed before parents
- **Dependency analysis**: Analyze dependencies where child information is needed first