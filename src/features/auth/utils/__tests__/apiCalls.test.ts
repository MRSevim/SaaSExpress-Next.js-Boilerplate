import { signUpSuccessMessage } from "../constants";
import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { signInWithEmailAndPassword, signOut, signUp } from "../apiCalls";

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
});
