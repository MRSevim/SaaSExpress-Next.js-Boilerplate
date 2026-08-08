import {
  resetPasswordSuccessMessage,
  signUpSuccessMessage,
} from "../constants";
import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  signInWithEmailAndPassword,
  signOut,
  signUp,
  getSession,
} from "../apiCalls";
import { env } from "@/utils/env";
import { headers } from "next/headers";

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

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
};

describe("auth apiCalls utilities", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedRedirect.mockImplementation(() => undefined as never);
  });

  describe("getSession", () => {
    it("returns user when session exists", async () => {
      const mockUser = { id: "user-1", email: "user@example.com" };
      mockedAuth.api.getSession.mockResolvedValueOnce({ user: mockUser });

      const user = await getSession();

      expect(user).toEqual(mockUser);
      expect(mockedAuth.api.getSession).toHaveBeenCalledTimes(1);
    });

    it("returns undefined when session is null or undefined", async () => {
      mockedAuth.api.getSession.mockResolvedValueOnce(null);

      const user = await getSession();

      expect(user).toBeUndefined();
    });
  });

  describe("signInWithEmailAndPassword", () => {
    it("signs in with valid credentials and redirects home", async () => {
      mockedAuth.api.signInEmail.mockResolvedValueOnce(undefined);

      const email = "  User@example.com";
      const password = "password123";
      const formData = createFormData({
        email,
        password,
      });

      const result = await signInWithEmailAndPassword(formData);

      expect(result).toBeUndefined();
      expect(mockedAuth.api.signInEmail).toHaveBeenCalledWith({
        body: { email: email.trim().toLowerCase(), password },
      });
      expect(mockedAuth.api.signInEmail).toHaveBeenCalledTimes(1);
      expect(mockedRedirect).toHaveBeenCalledWith(routes.home);
      expect(mockedRedirect).toHaveBeenCalledTimes(1);
    });

    it("returns a validation error for invalid email", async () => {
      const formData = createFormData({
        email: "not-an-email",
        password: "password123",
      });
      const result = await signInWithEmailAndPassword(formData);
      expect(result).toEqual({ error: "Invalid email address" });
      expect(mockedAuth.api.signInEmail).not.toHaveBeenCalled();
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it("returns a validation error for missing password", async () => {
      const formData = createFormData({
        email: "user@example.com",
        password: "",
      });
      const result = await signInWithEmailAndPassword(formData);
      expect(result).toEqual({ error: "Password is required" });
      expect(mockedAuth.api.signInEmail).not.toHaveBeenCalled();
      expect(mockedRedirect).not.toHaveBeenCalled();
    });

    it("returns error when api throws an exception", async () => {
      const errorMessage = "Invalid credentials";
      mockedAuth.api.signInEmail.mockRejectedValueOnce(new Error(errorMessage));

      const formData = createFormData({
        email: "user@example.com",
        password: "wrongpassword",
      });

      const result = await signInWithEmailAndPassword(formData);

      expect(result).toEqual({ error: errorMessage });
      expect(mockedRedirect).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    it("signs up successfully and returns the success message", async () => {
      mockedAuth.api.signUpEmail.mockResolvedValueOnce(undefined);

      const name = "   Jane Doe";
      const email = "jane@example.com";
      const password = "password123";

      const formData = createFormData({
        name,
        email,
        password,
        "confirm-password": password,
      });

      const result = await signUp(formData);

      expect(result).toEqual({
        error: "",
        successMessage: signUpSuccessMessage,
      });
      expect(mockedAuth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      });
      expect(mockedAuth.api.signUpEmail).toHaveBeenCalledTimes(1);
    });

    it("returns validation errors for invalid sign-up input", async () => {
      const formData = createFormData({
        name: "A",
        email: "bad-email",
        password: "short",
        "confirm-password": "different",
      });

      const result = await signUp(formData);

      expect(result).toEqual({
        error: "",
        errors: {
          name: "Name must be at least 2 characters",
          email: "Invalid email address",
          password: "Password must be at least 8 characters",
          confirmPassword: "Passwords do not match",
        },
        successMessage: "",
      });
      expect(mockedAuth.api.signUpEmail).not.toHaveBeenCalled();
    });

    it("returns an error when api throws an exception", async () => {
      const errorMessage = "User already exists";
      mockedAuth.api.signUpEmail.mockRejectedValueOnce(new Error(errorMessage));

      const formData = createFormData({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        "confirm-password": "password123",
      });

      const result = await signUp(formData);

      expect(result).toEqual({ error: errorMessage });
    });
  });

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

  describe("requestPasswordReset", () => {
    it("requests a password reset with the correct redirect URL", async () => {
      const email = "   USER@example.com";

      mockedAuth.api.requestPasswordReset.mockResolvedValueOnce(undefined);

      const result = await requestPasswordReset(email);

      expect(result).toEqual({ error: "", email: "" });
      expect(mockedAuth.api.requestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: email.trim().toLowerCase(),
          redirectTo: env.BASE_URL + routes.passwordReset,
        },
      });
      expect(mockedAuth.api.requestPasswordReset).toHaveBeenCalledTimes(1);
    });

    it("returns an error for invalid request password reset input", async () => {
      const result = await requestPasswordReset("bad-email");

      expect(result).toEqual({
        email: "bad-email",
        error: "Invalid email address",
      });
      expect(mockedAuth.api.requestPasswordReset).not.toHaveBeenCalled();
    });

    it("returns an error when api throws an exception", async () => {
      const error = "Network error";
      const email = "user@example.com";

      mockedAuth.api.requestPasswordReset.mockRejectedValueOnce(
        new Error(error),
      );

      const result = await requestPasswordReset(email);

      expect(result).toEqual({ email, error });
    });
  });

  describe("resetPassword", () => {
    it("resets the password successfully", async () => {
      mockedAuth.api.resetPassword.mockResolvedValueOnce(undefined);

      const password = "newpassword123";
      const formData = createFormData({
        password,
        "confirm-password": password,
      });

      const result = await resetPassword(formData, "token-123");

      expect(result).toEqual({
        error: "",
        successMessage: resetPasswordSuccessMessage,
      });
      expect(mockedAuth.api.resetPassword).toHaveBeenCalledWith({
        body: { newPassword: password, token: "token-123" },
      });
      expect(mockedAuth.api.resetPassword).toHaveBeenCalledTimes(1);
    });

    it("returns validation errors for invalid password reset input", async () => {
      const formData = createFormData({
        password: "short",
        "confirm-password": "different",
      });

      const result = await resetPassword(formData, "token-123");

      expect(result).toEqual({
        error: "",
        errors: {
          password: "Password must be at least 8 characters",
          confirmPassword: "Passwords do not match",
        },
        successMessage: "",
      });
      expect(mockedAuth.api.resetPassword).not.toHaveBeenCalled();
    });

    it("returns an error when api throws an exception", async () => {
      const error = "Network error";
      const password = "mypassword";

      mockedAuth.api.resetPassword.mockRejectedValueOnce(new Error(error));

      const formData = createFormData({
        password,
        "confirm-password": password,
      });

      const result = await resetPassword(formData, "token-123");

      expect(result).toEqual({ successMessage: "", error });
    });
  });

  describe("checkCredentialsProvider", () => {
    it.each(["credential", "google"])(
      "reports whether the credentials provider is available",
      async (providerId) => {
        mockedAuth.api.listUserAccounts.mockResolvedValueOnce([
          { providerId },
        ] as never);
        const isTrue = providerId === "credential";
        const result = await checkCredentialsProvider();

        expect(result).toEqual({ isTrue, error: "" });
        expect(mockedAuth.api.listUserAccounts).toHaveBeenCalledTimes(1);
      },
    );

    it("gives error with isTrue equal to false if api throws error", async () => {
      const error = "Check error";
      mockedAuth.api.listUserAccounts.mockRejectedValueOnce(new Error(error));

      const result = await checkCredentialsProvider();

      expect(result).toEqual({ isTrue: false, error });
    });
  });

  describe("deleteUser", () => {
    it("deletes the user", async () => {
      mockedAuth.api.deleteUser.mockResolvedValueOnce(undefined);

      const result = await deleteUser();

      expect(result).toEqual({ error: "" });
      expect(mockedAuth.api.deleteUser).toHaveBeenCalledWith({
        headers: await headers(),
        body: { callbackURL: routes.home },
      });
      expect(mockedAuth.api.deleteUser).toHaveBeenCalledTimes(1);
    });

    it("returns an error when deleting a user fails", async () => {
      const error = "Delete Failed";
      mockedAuth.api.deleteUser.mockRejectedValueOnce(new Error(error));

      const result = await deleteUser();

      expect(result).toEqual({ error });
    });
  });
});
