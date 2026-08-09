import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { signOut } from "../apiCalls";

const mockedAuth = auth as unknown as {
  api: {
    signInEmail: jest.Mock;
    signUpEmail: jest.Mock;
    requestPasswordReset: jest.Mock;
    resetPassword: jest.Mock;
    listUserAccounts: jest.Mock;
    deleteUser: jest.Mock;
    signOut: jest.Mock;
    getSession: jest.Mock;
  };
};

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe("auth apiCalls utilities", () => {
  describe("signOut", () => {
    it("signs out and redirects to the sign-in page", async () => {
      mockedAuth.api.signOut.mockResolvedValueOnce(undefined);

      const result = await signOut();

      expect(result).toBeUndefined();
      expect(mockedAuth.api.signOut).toHaveBeenCalledTimes(1);
      expect(mockedRedirect).toHaveBeenCalledWith(routes.signIn);
    });

    it("returns an error when sign out fails", async () => {
      const error = "Sign out failed";
      mockedAuth.api.signOut.mockRejectedValueOnce(new Error(error));

      const result = await signOut();

      expect(result).toEqual({ error });
      expect(mockedRedirect).not.toHaveBeenCalled();
    });
  });
});
