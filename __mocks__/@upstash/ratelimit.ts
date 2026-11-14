export const Ratelimit = Object.assign(
  jest.fn(() => ({ limit: jest.fn() })),
  { slidingWindow: jest.fn() },
);
