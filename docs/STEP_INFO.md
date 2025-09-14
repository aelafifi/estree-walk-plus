# `class StepInfo`

## Source Code

```typescript
/**
 * StepInfo represents a step in the traversal of an AST.
 * It contains the current node, its ancestor property name,
 * its index in the ancestor property (if property is an array),
 * and a reference to its ancestor StepInfo.
 *
 * - `ancestorProp` is null for the root node, or if walker configured not to preserve parents.
 * - `ancestorIndex` is undefined if the ancestor property is not an array (or ancestor is the root node),
 *     or if walker configured not to preserve parents.
 * - `ancestor` is undefined for the root node, or if walker configured not to preserve parents.
 *
 * It provides methods to navigate the tree, find nearest ancestors of a specific type (`nearestOfType`),
 * and replace the current node entirely in its ancestor (`replaceWith`).
 *
 * It also provides `descending` and `ascending` properties to get the list of ancestors
 * from the current node to the root, and from the root to the current node, respectively.
 */
export class StepInfo {
    constructor(
        public node: Node,
        public ancestorProp: string | null,
        public ancestorIndex?: number,
        public ancestor?: StepInfo,
    ) {
    }

    get descending() {
        const ancestors: StepInfo[] = [];
        let current: StepInfo | undefined = this;
        while (current) {
            ancestors.push(current);
            current = current.ancestor;
        }
        return ancestors;
    }

    get ascending() {
        return this.descending.reverse();
    }

    nearestOfType(type: string): StepInfo | null {
        let current: StepInfo | undefined = this;
        while (current) {
            if (current.node.type === type) {
                return current;
            }
            current = current.ancestor;
        }
        return null;
    }

    replaceWith(node: Node) {
        if (this.ancestor && this.ancestorProp !== null) {
            if (this.ancestorIndex !== undefined) {
                this.ancestor.node[this.ancestorProp][this.ancestorIndex] = node;
            } else {
                this.ancestor.node[this.ancestorProp] = node;
            }
            this.node = node;
        } else {
            throw new Error("Cannot replace the root node");
        }
    }
}
```

`StepInfo` represents a step in the traversal of an AST.

It contains the current node, its ancestor property name, its index in the ancestor property (if property is an array),
and a reference to its ancestor `StepInfo`.

So,..

- `step.node === step.ancestor?.node[step.ancestorProp]` (if `step.ancestorIndex` is undefined)
- `step.node === step.ancestor?.node[step.ancestorProp][step.ancestorIndex]` (if `step.ancestorIndex` is defined)

## Properties

- `node`: `acorn.Node` — The current AST node being visited.
- `ancestorProp`: `string | null` — The property name in the ancestor node that contains this node. \
    - `ancestorProp` is `null` for the root node, or if walker configured not to preserve parents.
      Otherwise, it's guaranteed to be a valid property name of the ancestor node as a `string`.
- `ancestorIndex`: `number | undefined` — The index of this node in the ancestor property if it's an array. \
    - `ancestorIndex` is `undefined` if the ancestor property is not an array (or ancestor is the root node), or if
      walker
      configured not to preserve parents.
      Otherwise, it's guaranteed to be a valid index as a `number`.
- `ancestor`: `StepInfo | undefined` — A reference to the `StepInfo` of the ancestor node.
    - `ancestor` is `undefined` for the root node, or if walker configured not to preserve parents.
      Otherwise, it's guaranteed to be a valid `StepInfo` object.

## Getters

- `get descending(): StepInfo[]` — Returns an array of `StepInfo` objects from the current node up to the root.
- `get ascending(): StepInfo[]` — Returns an array of `StepInfo` objects from the root down to the current node.

## Methods

- `nearestOfType(type: string): StepInfo | null` — Finds the nearest ancestor (including the current node) of the
  specified type.
  Returns the corresponding `StepInfo` or `null` if not found.
- `replaceWith(node: acorn.Node): void` — Replaces the current node in its ancestor with the provided node.
  Throws an error if attempting to replace the root node.

## ⚠️ Warning

Using `replaceWith` must be done with caution, as it modifies the AST in place.
Ensure that the new node is compatible with the structure of the AST to avoid inconsistencies.

From the walk functions perspective, replacing a node is useless if done in a bottom-up walker,
because by the time you replace a node, all its children have already been visited.
But you still can do it, for example, to replace an entire subtree with a new node for later processing.

If you use `replaceWith` in a top-down walker, be aware that the walker will adapt to the new node structure.
So, the children of the new node will be visited, and they will respect the boundries set by `options.start`
and/or `options.end`.

In general, using `replaceWith` is a bad idea, unless you really know what you are exactly doing.

## Example

```typescript
import {bottomUpWalk} from "estree-walk-plus";

// Assuming you already have an ESTree-compatible AST
bottomUpWalk(ast, {
    Identifier(step, state) {
        if (step.ancestor!.node.type === "VariableDeclarator") {
            console.log("New variable declared:", step.node.name);
        }
    }
});
```

[//]: # (TODO: add some examples)
