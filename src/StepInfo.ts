import type { Node } from "acorn";

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
  ) {}

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
