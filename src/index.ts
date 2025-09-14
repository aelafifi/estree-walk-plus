import type { Node } from "acorn";
import { VISIT_PROPS } from "./VisitProps";
import { StepInfo } from "./stepInfo";
import { inBounds, outOfBounds } from "./helpers";

/**
 * Direction of the traversal step.
 * - `TOP_DOWN`: Indicates a top-down traversal step (pre-order).
 * - `BOTTOM_UP`: Indicates a bottom-up traversal step (post-order).
 */
export enum Direction {
  TOP_DOWN = "TOP_DOWN",
  BOTTOM_UP = "BOTTOM_UP",
}

/**
 * Options for the `walk` function.
 * - `preserveParents`: Whether to maintain parent references (default: true).
 * - `start`: Start position for node traversal (default: undefined).
 * - `end`: End position for node traversal (default: undefined).
 * - `state`: An optional state object to be passed through the traversal (default: {}).
 */
export interface AcornWalkOptions {
  preserveParents?: boolean;
  start?: number;
  end?: number;
  state?: Object;
}

/**
 * Options for the `bidirectionalWalk` function.
 * - `topDownPrefix`: Prefix for top-down callback keys (default: "enter_").
 * - `bottomUpPrefix`: Prefix for bottom-up callback keys (default: "leave_").
 *
 * These options extend `AcornWalkOptions`.
 * @see AcornWalkOptions
 */
export interface BidirectionalAcornWalkOptions extends AcornWalkOptions {
  topDownPrefix?: string;
  bottomUpPrefix?: string;
}

/**
 * Callback function type for the `freeWalk` function.
 *
 * Any change to the node (even if it's replaced entirely with a new object) will affect the tree,
 * TODO: BTW...
 *
 * @param algo {Direction} The direction of the traversal step (top-down or bottom-up).
 * @param step {StepInfo} An object containing information about the current node and its ancestors (if `preserveParents` is true).
 * @param state {Object} A state object that is passed through the traversal, allowing you to maintain context or accumulate results.
 */
export type FreeWalkCallback = (
  algo: Direction,
  step: StepInfo,
  state: any,
) => void;

/**
 * A flexible ESTree walker that allows custom callbacks for both top-down and bottom-up traversal.
 *
 * @param tree {Node} The root ESTree node to start the traversal from.
 * @param callback {FreeWalkCallback} A function to be called at each node during traversal.
 * @param options {AcornWalkOptions} Options to configure the walker behavior.
 */
export function freeWalk(
  tree: Node,
  callback: FreeWalkCallback,
  options: AcornWalkOptions = {},
): Object {
  options = {
    ...options,
    preserveParents: options.preserveParents ?? true,
    start: options.start ?? undefined,
    end: options.end ?? undefined,
    state: options.state ?? {},
  };

  (function w(
    node: Node,
    prop: string | null,
    index?: number,
    ancestor?: StepInfo,
  ) {
    // If not a valid node, pass
    if (!node || typeof node !== "object" || !node.type) {
      return;
    }

    // If out of bounds, pass
    if (outOfBounds(node, options.start, options.end)) {
      return;
    }

    // Construct step info (to be used in callbacks if preserveParents is true)
    const stepInfo = new StepInfo(
      node,
      options.preserveParents ? prop : null,
      options.preserveParents ? index : undefined,
      options.preserveParents ? ancestor : undefined,
    );

    // Top-down callback
    if (inBounds(stepInfo.node, options.start, options.end)) {
      callback(Direction.TOP_DOWN, stepInfo, options.state);
    }

    // Visit children
    for (const propName of VISIT_PROPS[stepInfo.node.type] ?? []) {
      const childNode = stepInfo.node[propName];
      if (Array.isArray(childNode)) {
        for (let i = 0; i < childNode.length; i++) {
          w(childNode[i], propName, i, stepInfo);
        }
      } else if (childNode) {
        w(childNode, propName, undefined, stepInfo);
      }
    }

    // Bottom-up callback
    if (inBounds(stepInfo.node, options.start, options.end)) {
      callback(Direction.BOTTOM_UP, stepInfo, options.state);
    }
  })(tree, null, undefined, undefined);

  return options.state as Object;
}

/**
 * Callback function type for directional walks (bidirectional, top-down, or bottom-up).
 *
 * @param step {StepInfo} An object containing information about the current node and its ancestors (if `preserveParents` is true).
 * @param state {Object} A state object that is passed through the traversal, allowing you to maintain context or accumulate results.
 */
export type DirectionalWalkCallback = (step: StepInfo, state: any) => void;

/**
 * A bidirectional ESTree walker that allows custom callbacks for both top-down and bottom-up traversal.
 * - The callbacks are specified in a single object, with keys prefixed to indicate the direction
 *     (which  can be customized via options, default prefixes are "enter_" for top-down and "leave_" for bottom-up).
 * - The rest of the key is the node type (e.g., "enter_FunctionDeclaration", "leave_VariableDeclaration").
 *
 * @param tree {Node} The root ESTree node to start the traversal from.
 * @param callbacks {Record<string, DirectionalWalkCallback>} An object mapping node types (with prefixes) to callback functions.
 * @param options {BidirectionalAcornWalkOptions} Options to configure the walker behavior, including prefix customization.
 */
export function bidirectionalWalk(
  tree: Node,
  callbacks: Record<string, DirectionalWalkCallback>,
  options: BidirectionalAcornWalkOptions = {},
): Object {
  options = {
    ...options,
    topDownPrefix: options.topDownPrefix ?? "enter_",
    bottomUpPrefix: options.bottomUpPrefix ?? "leave_",
  };

  return freeWalk(
    tree,
    (algo: Direction, step: StepInfo, state: any) => {
      let fn;
      switch (algo) {
        case Direction.TOP_DOWN:
          fn = callbacks[`${options.topDownPrefix}${step.node.type}`];
          if (fn) {
            fn(step, state);
          }
          break;
        case Direction.BOTTOM_UP:
          fn = callbacks[`${options.bottomUpPrefix}${step.node.type}`];
          if (fn) {
            fn(step, state);
          }
          break;
      }
    },
    options,
  );
}

/**
 * Pre‑order traversal (visit parent before children); great for early pruning and context seeding.
 *
 * A top-down ESTree walker that allows custom callbacks for node types.
 *
 * In the `callbacks` object, keys should be the node types (e.g., "FunctionDeclaration", "VariableDeclaration"),
 *
 * @param tree {Node} The root ESTree node to start the traversal from.
 * @param callbacks {Record<string, DirectionalWalkCallback>} An object mapping node types to callback functions.
 * @param options {AcornWalkOptions} Options to configure the walker behavior.
 */
export function topDownWalk(
  tree: Node,
  callbacks: Record<string, DirectionalWalkCallback>,
  options: AcornWalkOptions = {},
): Object {
  return freeWalk(
    tree,
    (algo: Direction, step: StepInfo, state: any) => {
      if (algo === Direction.TOP_DOWN) {
        const fn = callbacks[step.node.type];
        if (fn) {
          fn(step, state);
        }
      }
    },
    options,
  );
}

/**
 * Post‑order traversal (visit children before parent); ideal for aggregations and transforms.
 *
 * A bottom-up ESTree walker that allows custom callbacks for node types.
 *
 * In the `callbacks` object, keys should be the node types (e.g., "FunctionDeclaration", "VariableDeclaration"),
 *
 * @param tree {Node} The root ESTree node to start the traversal from.
 * @param callbacks {Record<string, DirectionalWalkCallback>} An object mapping node types to callback functions.
 * @param options {AcornWalkOptions} Options to configure the walker behavior.
 */
export function bottomUpWalk(
  tree: Node,
  callbacks: Record<string, DirectionalWalkCallback>,
  options: AcornWalkOptions = {},
): Object {
  return freeWalk(
    tree,
    (algo: Direction, step: StepInfo, state: any) => {
      if (algo === Direction.BOTTOM_UP) {
        const fn = callbacks[step.node.type];
        if (fn) {
          fn(step, state);
        }
      }
    },
    options,
  );
}
