import { screen, waitFor } from "@testing-library/react";
import SignInComponent from "../SignInComponent";
import { renderWithProviders } from "@/utils/test-utils";
import { auth } from "../../lib/auth";
import { routes } from "@/utils/routes";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: pushMock,
  })),
}));

// signInEmail has to be mocked like so to avoid error
jest.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      signInEmail: jest.fn(),
    },
  },
}));

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

describe("Sign In Component", () => {
  it("logs in user correctly", async () => {
    const mockUserReturned = (email: string) => ({
      user: {
        id: "123",
        email,
        emailVerified: true,
        name: "myname",
        image: undefined,
      },
    });

    const { store, user } = renderWithProviders(<SignInComponent />);

    const invalidEmail = "myemail@g";
    const email = "myemail@gmail.com";

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();

    (auth.api.signInEmail as unknown as jest.Mock).mockImplementationOnce(
      async ({ body: { email } }) => {
        // Artificial delay to ensure loading state is rendered
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockUserReturned(email)), 50);
        });
      },
    );

    const password = "mypassword";
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeRequired();

    // First, sign in with wrong email
    await user.type(passwordInput, password);
    await user.type(emailInput, invalidEmail);

    const name = /sign in/i;

    await user.click(screen.getByRole("button", { name }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.clear(passwordInput);

    // Then, sign in with correct email
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.click(screen.getByRole("button", { name }));

    const loadingSignInButton = await screen.findByRole("button", {
      name: /signing in.../i,
    });

    expect(loadingSignInButton).toBeDisabled();

    const resetSignInButton = await screen.findByRole("button", {
      name,
    });

    expect(resetSignInButton).toBeEnabled();

    expect(store.getState().user.value).toEqual(mockUserReturned(email).user);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(routes.home);
    });
  });

  it("shows invalid credentials error", async () => {
    const errorMessage = "Invalid credentials";
    (auth.api.signInEmail as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.reject(new Error(errorMessage));
      },
    );

    const { store, user } = renderWithProviders(<SignInComponent />);

    const email = "wrongemail@gmail.com";
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();

    await user.type(emailInput, email);

    const password = "mypassword";
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeRequired();

    await user.type(passwordInput, password);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(store.getState().user.value).toEqual(undefined);
  });
});
