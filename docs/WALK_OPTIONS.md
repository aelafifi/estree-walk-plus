# `interface WalkOptions`

**Used for:** [`freeWalk`](./FREE_WALK.md)

## Signature

```typescript
interface WalkOptions {
    preserveParents?: boolean;
    start?: number;
    end?: number;
    state?: Object;
}
```

## Properties

- `preserveParents`: `boolean` — Whether to maintain parent references in `StepInfo`.
    - Default: `true`
    - When set to `false`, the `ancestor`, `ancestorProp`, and `ancestorIndex` properties in `StepInfo` will
      be `undefined`, `null`, and `undefined` respectively.
    - This can save memory and improve performance if you don't need parent information during traversal.
- `start`: `number` — The starting index in the source code to begin traversal.
    - Default: `undefined` → (start from the beginning)
    - This allows you to limit the traversal to a specific portion of the AST based on character positions.
- `end`: `number` — The ending index in the source code to stop traversal.
    - Default: `undefined` → (traverse to the end)
    - This allows you to limit the traversal to a specific portion of the AST based on character positions.
- `state`: `Object` — An initial state object to be passed through the traversal.
    - Default: `{}` (an empty object)
    - You can use this to accumulate information or share context between nodes during the walk.
    - It's defaulted to an empty object if not provided.
      Explicitly set a value for this if you need an initial state values.

---

# `interface BidirectionalWalkOptions extends WalkOptions`

**Used for:** [`bidirectionalWalk`](./BIDIRECTIONAL_WALK.md), [`topDownWalk`](./TOP_DOWN_WALK.md),
and [`bottomUpWalk`](./BOTTOM_UP_WALK.md)

## Signature

```typescript
interface BidirectionalWalkOptions extends WalkOptions {
  topDownPrefix?: string;
  bottomUpPrefix?: string;
}
```

## Properties
- `topDownPrefix`: `string` — The prefix to use for top-down callback keys.
    - Default: `"enter_"`
    - This allows you to customize the naming convention for top-down callbacks in the callback object.
      For example, if you set it to `"before"`, then a callback for `FunctionDeclaration` would be
      specified as `beforeFunctionDeclaration`.
- `bottomUpPrefix`: `string` — The prefix to use for bottom-up callback keys.
    - Default: `"leave_"`
    - This allows you to customize the naming convention for bottom-up callbacks in the callback object.
      For example, if you set it to `"after"`, then a callback for `FunctionDeclaration` would be
      specified as `afterFunctionDeclaration`.
