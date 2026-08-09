# Test Writing Guide (React Testing Library + Jest + TypeScript)

These rules describe how you should write tests in this project.

## Core Rules (in priority order)

### Apply the do not repeat yourself (DRY) principle

Whenever you see same thing repeated in more than one place, make it a variable with explicit name and apply the variable instead. It can be in same test folder or in the test itself.

### Import text constants separately

Success and error messages, button texts, and loading texts must use named variables in the same file or in a separate `constants.ts` file. Use those created variables instead of hardcoding your texts inside the tests. If no variable was defined by the user, you can then create your own. Generally there is no need to create variables for simple text like "email", "username" etc.

```ts
// utils/constants.ts
export const signUpSuccessMessage =
  "A verification email has been sent to your address";
```

```tsx
import { signUpSuccessMessage } from "@/features/auth/utils/constants";
```
