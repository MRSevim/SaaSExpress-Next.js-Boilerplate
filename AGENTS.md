<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Testing

When writing or reviewing component tests (React Testing Library + Jest), follow
`docs/ai/testing-guide.md` — covers mock typing conventions, loading-state test patterns,
and required TypeScript type guards. Read it before writing any new `*.test.tsx` file.
