import type { Node } from "acorn";

/**
 * Check if a node is entirely out of the specified bounds.
 *
 * **Note:** Intersecting nodes are not considered out of bounds.
 *
 * Out-of-bounds nodes won't be traversed by the walker.
 * None of their children will be visited, because they are guaranteed to be out of bounds as well.
 *
 * Intersecting nodes won't trigger callbacks (because they are not fully in bounds),
 * but will be traversed, because some of their children may be in bounds.
 *
 * @param node
 * @param start
 * @param end
 */
export function outOfBounds(node: Node, start?: number, end?: number) {
  return (
    (start !== undefined && node.end <= start) ||
    (end !== undefined && node.start >= end)
  );
}

/**
 * Check if a node is entirely within the specified bounds.
 *
 * **Note:** Intersecting nodes are not considered in bounds.
 *
 * Only in-bounds nodes will trigger callbacks in the walker.
 *
 * @param node
 * @param start
 * @param end
 */
export function inBounds(node: Node, start?: number, end?: number) {
  return (
    (start === undefined || node.start >= start) &&
    (end === undefined || node.end <= end)
  );
}
