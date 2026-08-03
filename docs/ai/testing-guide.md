# Component Test Writing Guide (React Testing Library + Jest + TypeScript)

This guide encodes the conventions used across this project's component tests.

## 1. Core Rules (in priority order)

### 1.1 Mock setup always comes before render/interaction

```tsx
mockedSomeApiCall.mockResolvedValueOnce(noError); // ARRANGE first
const { user } = renderWithProviders(<SomeComponent />); // then render
await user.click(...); // then act
```

Never set up a mock's return value after the component has already rendered/been interacted with,
even if it happens to work due to call timing. Consistent ordering prevents subtle bugs when a
component's behavior changes (e.g., if a future version calls the mocked function during mount).

### 1.2 Reset mocks between tests

```tsx
beforeEach(() => {
  jest.clearAllMocks();
});
```

This clears call history and mock implementations so tests can't leak state into each other and so
`toHaveBeenCalledTimes(n)` assertions are meaningful.

### 1.3 Never hardcode UI text or use ad hoc regexes in tests

Component files export their own text constants:

```tsx
export const buttonText = "Sign in With Google";
export const loadingText = "Redirecting...";
```

Tests import and reference these constants — never re-type the string. This guarantees the test
can't drift out of sync with the actual rendered UI, and a copy change only needs to happen in one
place (the component).

### 1.4 Use the shared `getLowercase` helper for role-name matching

```ts
// utils/test-utils.ts
export const getLowercase = (str: string) => new RegExp(str.toLowerCase(), "i");
```

```tsx
const name = getLowercase(buttonText);
screen.getByRole("button", { name });
```

Do not write `new RegExp(x.toLowerCase(), "i")` inline repeatedly — always route through the shared
helper so the matching behavior (case-insensitive) stays centralized and consistent project-wide.

### 1.5 Prefer `findByRole` over `getByRole` for any state that results from user interaction

- `getByRole`/`getByText` — synchronous, use only for state that's **already true** (initial render,
  or immediately after a `waitFor`/`findBy*` already confirmed the state landed).
- `findByRole`/`findByText` — asynchronous (`waitFor` + `getBy*` combined), use for state that
  **becomes true as a result of an action** — loading flags, `useActionState`/`useTransition`
  pending states, anything not guaranteed to be flushed synchronously within an awaited
  `user-event` call.

Cost/benefit: if the element is already present, `findByRole` resolves on its first check —
negligible overhead. If it's not yet present, `getByRole` would throw immediately and flakily;
`findByRole` polls (~50ms intervals, 1000ms default timeout) and only pays real time on a genuine
failure. **Default to `findByRole` for any post-interaction assertion** — it's strictly safer with
effectively no cost on the passing path.

```tsx
await user.click(button);

const loadingButton = await screen.findByRole("button", {
  name: getLowercase(loadingText),
});
expect(loadingButton).toBeDisabled();
```

### 1.6 Testing a pending/loading state requires a manually-controlled promise

`mockResolvedValueOnce` resolves on the next microtick — too fast to observe an intermediate
loading state, since `user.click()` awaits all pending microtasks before returning. Use a promise
you resolve yourself:

```tsx
let resolveSomeApiCall: (value: Awaited<ReturnType<SomeApiCallType>>) => void;

mockedSomeApiCall.mockImplementationOnce(
  () =>
    new Promise((resolve) => {
      resolveSomeApiCall = resolve;
    }),
);

const { user } = renderWithProviders(<SomeComponent />);
const button = screen.getByRole("button", { name });

await user.click(button);

const loadingButton = await screen.findByRole("button", {
  name: getLowercase(loadingText),
});
expect(loadingButton).toBeDisabled();

resolveSomeApiCall!(noError);

const resetButton = await screen.findByRole("button", { name });
expect(resetButton).toBeEnabled();

await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
});
```

Never use a real `setTimeout` delay to simulate a pending promise (e.g.
`new Promise((r) => setTimeout(() => r(x), 50))`). It "works" but:

- introduces real wall-clock time into the test (slower, and a magic-number delay unrelated to any
  actual input/output),
- carries a small theoretical flakiness risk if a slow CI runner lets the real timer elapse before
  the intervening assertions run.

The manually-resolved promise pattern above is fully deterministic and has none of these risks.

### 1.7 Do not click a disabled button "to prove it's a no-op"

Once `toBeDisabled()` passes, a second `user.click()` on that element is guaranteed to be a no-op
by RTL/DOM semantics (disabled elements don't dispatch click handlers) — a second click doesn't add
coverage and should be omitted. One click, then assert disabled, is sufficient.

### 1.8 Assert both call count and call arguments where relevant

Don't stop at "was the mock called" — for anything that takes user input, assert what it was called
**with**, so a bug like a wrong `formData.get(...)` key or an off-by-one wiring mistake gets caught:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledWith(expectedValue);
});
```

### 1.9 Test the negative case for the happy path too

Don't just assert the mock was called on success — also assert the error UI is absent:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
});
```

Use `queryByText` (not `getByText`) when asserting **absence** — `getByText` throws immediately if
not found, which would break a negative assertion; `queryByText` returns `null` instead.

### 1.10 Assert the mock's call behavior in every applicable test case, not just the happy path

Whatever mock assertion is relevant for a given scenario — call count, call arguments, or how the
resolved value flowed into the UI — should be checked in **every** test for that mock, not left out
of some branches just because another assertion in that test happens to imply it.

For example, in an error-path test, the fact that `screen.getByText(error)` renders already implies
the mock was called and resolved — but that implication isn't the same as an explicit assertion, and
it doesn't rule out a bug where the mock is accidentally invoked more than once on that branch. Add
the explicit check anyway:

```tsx
it("shows an error", async () => {
  const error = "Something went wrong";
  mockedSomeApiCall.mockResolvedValueOnce({ error });
  const { user } = renderWithProviders(<SomeComponent />);

  await user.click(screen.getByRole("button", { name }));

  await waitFor(() => {
    expect(screen.getByText(error)).toBeInTheDocument();
    expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
  });
});
```

The exact check depends on the scenario — it doesn't have to always be `toHaveBeenCalledTimes`:

- **Happy path** — call count, and/or `toHaveBeenCalledWith(...)` if the call takes input.
- **Error path** — call count (guards against an accidental double-call that only happens on the
  error branch), and `toHaveBeenCalledWith(...)` if relevant — the fact that the error rendered
  doesn't prove the mock wasn't also called with the wrong arguments.
- **Loading/pending path** — call count once the promise resolves, same as the other branches.

Applying the same category of assertion consistently across every test for a given mock — rather
than only in the branch where it's most obviously needed — closes gaps where a regression could
slip through on whichever branch was left unchecked.

### 1.11 Apply the do not repeat yourself (DRY) principle

Whenever you see same thing repeated in more than one place, make it a variable with explicit name and apply the variable instead. It can be in same test folder or in the test itself.

### 1.12 Only test the functions called inside components and mock them

If a component calls for example resetPassword, mock that function with proper typing and check the calls to that function. Any api called inside that function will be tested and mocked in separate unit tests. Component tests should only test outermost function mocks' calls.

---

## 2. TypeScript Type Safety — Required Patterns

This is the part most likely to be skipped by an AI agent working quickly. Do not skip it.

### 2.1 Every mocked async function must have an explicit exported type

Define the function's type once, next to (or exported from) the module that implements it:

```ts
export type SomeApiCallType = (arg: string) => Promise<{ error: string }>;

export const someApiCall: SomeApiCallType = async (arg) => {
  // implementation
};
```

Shared types used by multiple test files should live in a common types module
(e.g. `utils/types.ts`), imported by both the implementation and every test file that mocks it.

### 2.2 Never cast a jest mock with a bare `as jest.Mock`

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

### 2.3 Deriving the resolved-value type for manual promise resolution

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

## Minimal Worked Example

```tsx
import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import SomeComponent, { buttonText, loadingText } from "../SomeComponent";
import { someApiCall } from "@/features/x/utils/apiCalls";
import { SomeApiCallType } from "../../utils/types";
import { getLowercase } from "../../utils/testHelpers";

jest.mock("@/features/x/utils/apiCalls", () => ({
  someApiCall: jest.fn(),
}));

const mockedSomeApiCall = someApiCall as jest.MockedFunction<SomeApiCallType>;
const name = getLowercase(buttonText);
const noError = { error: "" };

describe("SomeComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("succeeds", async () => {
    mockedSomeApiCall.mockResolvedValueOnce(noError);
    const { user } = renderWithProviders(<SomeComponent />);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("shows an error", async () => {
    const error = "Something went wrong";
    mockedSomeApiCall.mockResolvedValueOnce({ error });
    const { user } = renderWithProviders(<SomeComponent />);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
      expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
    });
  });

  it("disables the button while pending and re-enables after", async () => {
    let resolveSomeApiCall: (
      value: Awaited<ReturnType<SomeApiCallType>>,
    ) => void;

    mockedSomeApiCall.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSomeApiCall = resolve;
        }),
    );

    const { user } = renderWithProviders(<SomeComponent />);
    await user.click(screen.getByRole("button", { name }));

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });
    expect(loadingButton).toBeDisabled();

    resolveSomeApiCall!(noError);

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
    });
  });
});
```
