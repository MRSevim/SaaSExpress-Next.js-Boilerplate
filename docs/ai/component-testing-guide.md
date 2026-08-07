# Component Test Writing Guide (React Testing Library + Jest + TypeScript)

This guide encodes the conventions used across this project's component tests.

## Core Rules (in priority order)

### Dont hardcode UI text or use ad hoc regexes in tests if user has added them as exported variable

Component files can export their own text constants :

```tsx
export const buttonText = "Sign in With Google";
export const loadingText = "Redirecting...";
```

Tests import and reference these constants — never re-type the string if already present as constant somewhere. This guarantees the test
can't drift out of sync with the actual rendered UI, and a copy change only needs to happen in one
place (the component).

### Mock setup always comes before render/interaction

```tsx
mockedSomeApiCall.mockResolvedValueOnce(noError); // ARRANGE first
const { user } = renderWithProviders(<SomeComponent />); // then render
await user.click(...); // then act
```

Never set up a mock's return value after the component has already rendered/been interacted with,
even if it happens to work due to call timing. Consistent ordering prevents subtle bugs when a
component's behavior changes (e.g., if a future version calls the mocked function during mount).

### Use the shared `getLowercase` helper for role-name matching

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

### Prefer `findByRole` over `getByRole` for any state that results from user interaction

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

### Testing a pending/loading state requires a manually-controlled promise

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

### Do not click a disabled button "to prove it's a no-op"

Once `toBeDisabled()` passes, a second `user.click()` on that element is guaranteed to be a no-op
by RTL/DOM semantics (disabled elements don't dispatch click handlers) — a second click doesn't add
coverage and should be omitted. One click, then assert disabled, is sufficient.

### Assert both call count and call arguments where relevant

Don't stop at "was the mock called" — for anything that takes user input, assert what it was called
**with**, so a bug like a wrong `formData.get(...)` key or an off-by-one wiring mistake gets caught:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledWith(expectedValue);
});
```

### Test the negative case for the happy path too

Don't just assert the mock was called on success — also assert the error UI is absent:

```tsx
await waitFor(() => {
  expect(mockedSomeApiCall).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
});
```

Use `queryByText` (not `getByText`) when asserting **absence** — `getByText` throws immediately if
not found, which would break a negative assertion; `queryByText` returns `null` instead.

### Assert the mock's call behavior in every applicable test case, not just the happy path

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
- **Loading/pending path** — call count once the promise resolves and/or `toHaveBeenCalledWith(...)`, same as the other branches.

Applying the same category of assertion consistently across every test for a given mock — rather
than only in the branch where it's most obviously needed — closes gaps where a regression could
slip through on whichever branch was left unchecked.

### Only test the functions called inside components and mock them

If a component calls for example resetPassword, mock that function with proper typing and check the calls to that function. Any api called inside that function will be tested and mocked in separate unit tests. Component tests should only test outermost function mocks' calls.

### Assert `FormData` arguments from `mock.calls`, not `toHaveBeenCalledWith`

Jest _can_ deep-compare `FormData` — it applies `iterableEquality` as a built-in
custom tester whenever a compared object implements `Symbol.iterator` (which
`FormData` does via `entries()`), so `toHaveBeenCalledWith` does walk actual
field values rather than ignoring them.

The catch: `iterableEquality` compares entries as an ordered stream, pairing
entry 0 with entry 0, entry 1 with entry 1, etc. So `expect(mock).toHaveBeenCalledWith(formData)`
passes only if the expected `FormData` was built with fields appended in the
exact same order as the actual call — two `FormData` objects with identical
key/value pairs in different append order will fail the match. That
order-coupling makes the assertion brittle to harmless refactors of field
append order in the component. Capture the call and read the fields instead,
which checks each field independently of order:

```tsx
await waitFor(() => {
  expect(mockedSignUp).toHaveBeenCalledTimes(1);
  const [, formData] = mockedSignUp.mock.calls[0];
  expect(formData.get("name")).toBe(nameValue);
  expect(formData.get("email")).toBe(email);
});
```

Source: Jest's `equals` implementation applies `iterableEquality` as a default
custom tester (see [Jest — Custom Equality Testers](https://jestjs.io/docs/expect#custom-equality-testers),
and the original iterableEquality PR: https://github.com/jestjs/jest/pull/923).

For actions with extra positional args (e.g. `resetPassword(formData, token)`), read them from the
same entry: `const [formData, token] = mockedResetPassword.mock.calls[0];`

### Stub child components that fire their own API calls

When the component under test renders a child with its own (separately-tested) API call, replace
the child with a no-op so the test only exercises the parent's outermost mock (§1.12):

```tsx
jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);
```

---

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
    jest.resetAllMocks();
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
