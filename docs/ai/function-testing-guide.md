# Function Test Writing Guide (React Testing Library + Jest + TypeScript)

This guide encodes the conventions used across this project's function tests.

## Core Rules (in priority order)

### Use inner describe blocks to separate each function in a test suite

Even if suite has one function, separate them by describe block. Example:

```tsx
describe("auth apiCalls utilities", () => {
  describe("signInWithEmailAndPassword", () => {
    it("does a", async () => {});

    it("does b", async () => {});
  });
});
```
