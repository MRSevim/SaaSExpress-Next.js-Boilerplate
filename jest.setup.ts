import "@testing-library/jest-dom";

jest.mock("@/features/auth/lib/authClient");
jest.mock("@/features/auth/lib/auth");
jest.mock("@/features/auth/utils/contexts/UserPromiseContext");

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
