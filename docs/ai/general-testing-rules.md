# Test Writing Guide (React Testing Library + Jest + TypeScript)

These rules describe how you should write tests in this project.

## Core Rules (in priority order)

### Apply the do not repeat yourself (DRY) principle

Whenever you see same thing repeated in more than one place, make it a variable with explicit name and apply the variable instead. It can be in same test folder or in the test itself.

### Import text constants separately

A success/error messages, button/loading texts have their own variables either inside the same file or separate constants.ts file. Use those created variables instead of hardcoding your texts inside the tests. For mocked functions. If no variable was defined by the user, you can then hardcode them.

```ts
// utils/constants.ts
export const signUpSuccessMessage =
  "A verification email has been sent to your address";
```

```tsx
import { signUpSuccessMessage } from "@/features/auth/utils/constants";
```

### Reset mocks between tests

```tsx
beforeEach(() => {
  jest.resetAllMocks();
});
```

This clears call history and mock implementations so tests can't leak state into each other and so
`toHaveBeenCalledTimes(n)` assertions are meaningful. Only do this when there is at least one mock to reset.

## TypeScript Type Safety — Required Patterns

This is the part most likely to be skipped by an AI agent working quickly. Do not skip it.

### Every mocked async function must have an explicit exported type

Define the function's type once, next to (or exported from) the module that implements it:

```ts
export type SomeApiCallType = (arg: string) => Promise<{ error: string }>;

export const someApiCall: SomeApiCallType = async (arg) => {
  // implementation
};
```

Shared types used by multiple test files should live in a common types module
(e.g. `utils/types.ts`), imported by both the implementation and every test file that mocks it.

### Never cast a jest mock with a bare `as jest.Mock`

```ts
// ❌ Wrong — untyped, no shape checking on mockResolvedValueOnce / mockImplementationOnce args
(someApiCall as jest.Mock).mockResolvedValueOnce({ wrong: "shape" }); // silently allowed

// ✅ Correct — TypeScript enforces the real function signature
const mockedSomeApiCall = someApiCall as jest.MockedFunction<SomeApiCallType>;
mockedSomeApiCall.mockResolvedValueOnce({ error: "" }); // shape-checked
mockedSomeApiCall.mockResolvedValueOnce({ wrong: "shape" }); // ❌ compile error, as desired
```

`jest.MockedFunction<T>` makes every mock method (`mockResolvedValueOnce`, `mockImplementationOnce`,
`mockReturnValueOnce`, etc.) type-check its argument against `T`'s real signature. This is the
single most important type-safety upgrade for this test pattern — it converts "wrong mock shape"
from a runtime failure (or worse, a silent pass) into a compile-time error.

### Deriving the resolved-value type for manual promise resolution

When manually controlling a pending promise, the resolver function's parameter type must match the
function's **resolved** value — not the `Promise` wrapper itself:

```ts
let resolveSomeApiCall: (value: Awaited<ReturnType<SomeApiCallType>>) => void;
```

- `ReturnType<SomeApiCallType>` → `Promise<{ error: string }>` (still wrapped)
- `Awaited<ReturnType<SomeApiCallType>>` → `{ error: string }` (unwrapped — this is what you want)

Always derive this from the source type rather than duplicating the shape by hand
(`let resolveSomeApiCall: (value: { error: string }) => void;`). Deriving keeps the test
automatically in sync if the real function's return shape ever changes — duplicating it by hand
creates a second source of truth that can silently drift.
