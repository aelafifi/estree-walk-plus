# `enum Direction`

An enumeration representing the direction of traversal in the AST walker.

This enum is passed to the [`freeWalk`](./FREE_WALK.md) callback to indicate whether the current node is being visited
in a top-down or bottom-up manner.

## Members

- `TOP_DOWN` — Indicates that the traversal is happening in a top-down manner, meaning the parent node is visited before
  its children.
  > **It means** that the callback is invoked when first encountering a node, before its children are processed.
  >
  > **Useful for** scenarios where you want to set up context or make decisions before diving into child nodes.
  >
  > Also, you can replace the current node with a different node, or play with its children before they are visited.
- `BOTTOM_UP` — Indicates that the traversal is happening in a bottom-up manner, meaning the children nodes are visited
  before their parent.
  > **It means** that the callback is invoked after all children of a node have been processed.
  >
  > **Useful for** scenarios where you want to aggregate information from child nodes or perform transformations
  > that depend on the state of the children.
  >
  > In this step, changing the current node will have no effect (from the walk function perspective),
  > as its children have already been processed.
  >
  > Any changes to the node are still possible,
  > and will reflect in the final AST structure, but they won't affect the traversal.

## Example

```typescript
import {freeWalk, Direction} from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
freeWalk(ast, (direction, step, state) => {
    if (step.node.type === "ForStatement" && direction === Direction.TOP_DOWN) {
        // This will happen when first encountering a ForStatement node (before its children are processed)
    }

    if (step.node.type === "CallExpression" && direction === Direction.BOTTOM_UP) {
        // This will happen after all children of a CallExpression node have been processed
    }
});
```
