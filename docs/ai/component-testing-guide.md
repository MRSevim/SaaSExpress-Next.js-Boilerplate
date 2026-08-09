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
let resolveSomeApiCall;

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

### Test the negative case for the error paths when relevant

Some error paths do not call api, for example zod validation errors return before api is called. Test that api was not called on those type of cases. Check the relevant code pieces in the project to see if not calling the function is expected. Example

```tsx
it("returns an error for invalid request password reset input", async () => {
  const { user, emailInput, button } = renderComponent();

  await user.type(emailInput, "bad-email@d");
  await user.click(button);

  await waitFor(() => {
    expect(
      document.getElementById(forgotPasswordResetErrorId),
    ).toHaveTextContent(invalidEmail);
    expect(mockedRequestPasswordReset).not.toHaveBeenCalled();
  });
});
```

Here, mockedRequestPasswordReset should not be called because zod returns before actually calling the function if it has validation errors. You would check the function requestPasswordReset by seeing "srx/app/features/auth/utils/apiCalls.ts" and indeed see it returns early for validation errors. That is what I mean by check the code and apply the negative checks when relevant.
