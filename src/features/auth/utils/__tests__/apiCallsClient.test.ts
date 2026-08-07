import { signInWithGoogle } from "../apiCallsClient";
import { authClient } from "@/features/auth/lib/authClient";

jest.mock("@/features/auth/lib/authClient", () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
}));

const mockedAuthClient = authClient as unknown as {
  signIn: {
    social: jest.Mock;
  };
};

describe("auth client apiCalls utilities", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe("signInWithGoogle", () => {
    it("returns success when google sign-in succeeds", async () => {
      mockedAuthClient.signIn.social.mockResolvedValueOnce({ error: null });

      const result = await signInWithGoogle();

      expect(result).toEqual({ error: "" });
      expect(mockedAuthClient.signIn.social).toHaveBeenCalledWith({
        provider: "google",
      });
    });

    it("returns an error when google sign-in returns an auth error", async () => {
      const error = "Google auth failed";

      mockedAuthClient.signIn.social.mockResolvedValueOnce({
        error: { message: error },
      });

      const result = await signInWithGoogle();

      expect(result).toEqual({ error });
    });

    it("returns the thrown error message when google sign-in throws", async () => {
      const error = "boom";

      mockedAuthClient.signIn.social.mockRejectedValueOnce(new Error(error));

      const result = await signInWithGoogle();

      expect(result).toEqual({ error });
    });
  });
});
