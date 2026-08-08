import "@testing-library/jest-dom";

jest.mock("@/features/auth/lib/authClient");
jest.mock("@/features/auth/lib/auth");

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
