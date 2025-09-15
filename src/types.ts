import { StepInfo } from "./StepInfo";
import { Direction } from "./index";

/**
 * Options for the `walk` function.
 * - `preserveParents`: Whether to maintain parent references (default: true).
 * - `start`: Start position for node traversal (default: undefined).
 * - `end`: End position for node traversal (default: undefined).
 * - `state`: An optional state object to be passed through the traversal (default: {}).
 */
export interface WalkOptions {
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
 * These options extend `WalkOptions`.
 * @see WalkOptions
 */
export interface BidirectionalWalkOptions extends WalkOptions {
  topDownPrefix?: string;
  bottomUpPrefix?: string;
}

/**
 * Callback function type for the `freeWalk` function.
 *
 * The `step` parameter has a mutable `node` property,
 * and any change to the node (even if it's replaced entirely with a new object) will affect the tree traversing accordingly
 * (unless the change is made to a node that has already been traversed — on the bottom-up step).
 *
 * @param direction {Direction} The direction of the traversal step (top-down or bottom-up).
 * @param step {StepInfo} An object containing information about the current node and its ancestors (if `preserveParents` is true).
 * @param state {Object} A state object that is passed through the traversal, allowing you to maintain context or accumulate results.
 */
export type FreeWalkCallback = (
  direction: Direction,
  step: StepInfo,
  state: Object,
) => void;

/**
 * Callback function type for directional walks (bidirectional, top-down, or bottom-up).
 *
 * @param step {StepInfo} An object containing information about the current node and its ancestors (if `preserveParents` is true).
 * @param state {Object} A state object that is passed through the traversal, allowing you to maintain context or accumulate results.
 */
export type DirectionalWalkCallback = (step: StepInfo, state: Object) => void;
