# `type FreeWalkCallback`

**Used for:** [`freeWalk`](./FREE_WALK.md)

While [`freeWalk`](./FREE_WALK.md) is traversing the AST, it will call this callback at each node, providing the
current `direction` of traversal (top-down or bottom-up), the `step` information about the current node and its
ancestors, and a mutable `state` object that you can use to accumulate information or share context between nodes.

[`freeWalk`](./FREE_WALK.md) does not care about the return value of this callback; any state changes should be made
directly to the `state` object.

## Signature

```typescript
type FreeWalkCallback = (
    direction: Direction,
    step: StepInfo,
    state: Object
) => void;
```

## Parameters

- `direction`: [`Direction`](./ENUMS.md) — Indicates whether the current node is being visited in a
  top-down (`Direction.TOP_DOWN`) or bottom-up (`Direction.BOTTOM_UP`) manner.
- `step`: [`StepInfo`](./STEP_INFO.md) — An object containing information about the current node, its ancestors.
- `state`: `Object` — A mutable state object that is passed through the entire traversal. You can use it to accumulate
  information or share context between nodes.

## Returns

- `void`: The callback does not return any value. Any state changes should be made directly to the `state` object.

---

# `type BidirectionalWalkCallback`

**Used for:** [`bidirectionalWalk`](./BIDIRECTIONAL_WALK.md), [`topDownWalk`](./TOP_DOWN_WALK.md),
and [`bottomUpWalk`](./BOTTOM_UP_WALK.md)

While [`bidirectionalWalk`](./BIDIRECTIONAL_WALK.md), [`topDownWalk`](./TOP_DOWN_WALK.md),
and [`bottomUpWalk`](./BOTTOM_UP_WALK.md)
are considering a separate callback function for each node type, so no need for a direction parameter,
while it's already pre-determined by the specific walker being used, and its configuration.

When the walker visits a node of a type that has a corresponding callback in the provided object, it will call that
callback, providing the `step` information about the current node and its ancestors, and a mutable `state` object that
you can use to accumulate information or share context between nodes.

[`bidirectionalWalk`](./BIDIRECTIONAL_WALK.md), [`topDownWalk`](./TOP_DOWN_WALK.md),
and [`bottomUpWalk`](./BOTTOM_UP_WALK.md) do not care about the return value of this callback;
any state changes should be made directly to the `state` object.

## Signature

```typescript
type BidirectionalWalkCallback = (
    step: StepInfo,
    state: Object
) => void;
```

## Parameters

- `step`: [`StepInfo`](./STEP_INFO.md) — An object containing information about the current node, its ancestors.
- `state`: `Object` — A mutable state object that is passed through the entire traversal. You can use it to accumulate
  information or share context between nodes.

## Returns

- `void`: The callback does not return any value. Any state changes should be made directly to the `state` object.
