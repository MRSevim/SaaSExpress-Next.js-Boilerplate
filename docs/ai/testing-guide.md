# Component Test Writing Guide (React Testing Library + Jest + TypeScript)

This guide encodes the conventions used across this project's auth-flow component tests
(`ContinueWithGoogleButton`, `ForgotPasswordComponent`). Follow this structure for any new
component test involving an async action, a loading/disabled state, and a success/error outcome.

---

## 1. File Structure Template

```tsx
import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import SomeComponent, {
  buttonText,
  loadingText,
  // any other exported UI-text constants
} from "../SomeComponent";
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

  it("does the happy path", async () => {
    /* ... */
  });
  it("shows api error", async () => {
    /* ... */
  });
  it("disables the button while pending and re-enables after", async () => {
    /* ... */
  });
});
```

---

## 2. Core Rules (in priority order)

### 2.1 Mock setup always comes before render/interaction

```tsx
mockedSomeApiCall.mockResolvedValueOnce(noError); // ARRANGE first
const { user } = renderWithProviders(<SomeComponent />); // then render
await user.click(...); // then act
```

Never set up a mock's return value after the component has already rendered/been interacted with,
even if it happens to work due to call timing. Consistent ordering prevents subtle bugs when a
component's behavior changes (e.g., if a future version calls the mocked function during mount).

### 2.2 Reset mocks between tests

```tsx
beforeEach(() => {
  jest.clearAllMocks();
});
```

This clears call history and mock implementations so tests can't leak state into each other and so
`toHaveBeenCalledTimes(n)` assertions are meaningful.

### 2.3 Never hardcode UI text or use ad hoc regexes in tests

Component files export their own text constants:

```tsx
export const buttonText = "Sign in With Google";
export const loadingText = "Redirecting...";
```

Tests import and reference these constants — never re-type the string. This guarantees the test
can't drift out of sync with the actual rendered UI, and a copy change only needs to happen in one
place (the component).

### 2.4 Use the shared `getLowercase` helper for role-name matching

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

### 2.5 Prefer `findByRole` over `getByRole` for any state that results from user interaction

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

### 2.6 Testing a pending/loading state requires a manually-controlled promise

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

### 2.7 Do not click a disabled button "to prove it's a no-op"

Once `toBeDisabled()` passes, a second `user.click()` on that element is guaranteed to be a no-op
by RTL/DOM semantics (disabled elements don't dispatch click handlers) — a second click doesn't add
coverage and should be omitted. One click, then assert disabled, is sufficient.

### 2.8 Assert both call count and call arguments where relevant

Don't stop at "was the mock called" — for anything that takes user input, assert what it was called
**with**, so a bug like a wrong `formData.get(...)` key or an off-by-one wiring mistake gets caught:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledWith(expectedValue);
});
```

### 2.9 Test the negative case for the happy path too

Don't just assert the mock was called on success — also assert the error UI is absent:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
});
```

Use `queryByText` (not `getByText`) when asserting **absence** — `getByText` throws immediately if
not found, which would break a negative assertion; `queryByText` returns `null` instead.

---

## 3. TypeScript Type Safety — Required Patterns

This is the part most likely to be skipped by an AI agent working quickly. Do not skip it.

### 3.1 Every mocked async function must have an explicit exported type

Define the function's type once, next to (or exported from) the module that implements it:

```ts
export type SomeApiCallType = (arg: string) => Promise<{ error: string }>;

export const someApiCall: SomeApiCallType = async (arg) => {
  // implementation
};
```

Shared types used by multiple test files should live in a common types module
(e.g. `utils/types.ts`), imported by both the implementation and every test file that mocks it.

### 3.2 Never cast a jest mock with a bare `as jest.Mock`

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

### 3.3 Deriving the resolved-value type for manual promise resolution

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

### 3.4 Type-check reminder for an AI agent generating these tests

Before finalizing a test file, verify:

- [ ] Is there an exported `type` for every mocked async function, and is it imported into the test?
- [ ] Is the mock cast with `jest.MockedFunction<T>`, not `as jest.Mock` or `any`?
- [ ] Does every `mockResolvedValueOnce` / `mockImplementationOnce` argument match `T`'s real return
      shape (let the compiler tell you — do not assume)?
- [ ] Does any manual promise-resolver variable use `Awaited<ReturnType<T>>` rather than a
      hand-written duplicate of the shape?
- [ ] Are UI text assertions using the component's exported constants (`buttonText`, `loadingText`,
      etc.) and the shared `getLowercase` helper — never inline strings/regexes?

---

## 4. Anti-Patterns to Avoid

| Anti-pattern                                                                                  | Why it's wrong                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setting up a mock's return value _after_ rendering/clicking                                   | Works today only by coincidence of timing; breaks the "arrange before act" convention and can silently pass even when the mock isn't actually consumed when expected |
| `as jest.Mock` instead of `jest.MockedFunction<T>`                                            | No compile-time shape checking; wrong mock shapes fail at runtime instead of at compile time                                                                         |
| Hand-written type for a promise resolver instead of `Awaited<ReturnType<T>>`                  | Creates a second source of truth that can drift from the real function signature                                                                                     |
| `mockResolvedValueOnce` to test a loading/pending state                                       | Resolves too fast to observe the intermediate state — the assertion becomes untestable or unreliable                                                                 |
| Real `setTimeout` delay to simulate a pending promise                                         | Introduces real wall-clock time and a theoretical (if small) flakiness risk; a manually-resolved promise is deterministic and just as easy to write                  |
| Clicking a disabled button a second time "to be sure"                                         | Provides no additional coverage — disabled elements don't fire handlers; the `toBeDisabled()` assertion already proves this                                          |
| Inline `new RegExp(text.toLowerCase(), "i")` repeated per test                                | Should go through the single shared `getLowercase` helper                                                                                                            |
| Hardcoded button/loading text strings in the test                                             | Should always reference the component's own exported text constants                                                                                                  |
| `getByRole` for a state driven by `useActionState`/`useTransition`/any async scheduling       | Can fire before the update has flushed, causing flaky failures; use `findByRole`                                                                                     |
| Missing `toHaveBeenCalledWith(...)` when the component forwards user input to the mocked call | Leaves argument-forwarding bugs (e.g. wrong form field key) undetected                                                                                               |

---

## 5. Minimal Worked Example

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
