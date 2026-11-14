export const after = jest.fn((task: unknown) =>
  typeof task === "function" ? task() : task,
);
