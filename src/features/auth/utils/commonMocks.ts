jest.mock("better-auth/api", () => ({
  isAPIError: jest.fn(() => true),
}));
