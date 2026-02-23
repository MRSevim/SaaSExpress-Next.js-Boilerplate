import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { auth } from "../../lib/auth";
import ForgotPasswordComponent from "../ForgotPasswordComponent";

jest.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      requestPasswordReset: jest.fn(),
    },
  },
}));

const name = /request password reset link/i;

describe("ForgotPassword Component", () => {
  it("correctly requests password reset", async () => {
    const { user } = renderWithProviders(<ForgotPasswordComponent />);

    (
      auth.api.requestPasswordReset as unknown as jest.Mock
    ).mockImplementationOnce(async () => {
      // Artificial delay to ensure loading state is rendered
      return new Promise((resolve) => {
        setTimeout(() => resolve(""), 50);
      });
    });

    //first check invalid email error
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
    await user.type(emailInput, "invalidemail@x");

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });

    //then check valid email succcess
    await user.clear(emailInput);
    await user.type(emailInput, "myemail@gmail.com");
    await user.click(screen.getByRole("button", { name }));

    const loadingSignInButton = await screen.findByRole("button", {
      name: /requesting.../i,
    });

    expect(loadingSignInButton).toBeDisabled();

    const resetSignInButton = await screen.findByRole("button", {
      name,
    });

    expect(resetSignInButton).toBeEnabled();

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password reset email has been sent to your email adress",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Something went wrong";
    (
      auth.api.requestPasswordReset as unknown as jest.Mock
    ).mockImplementationOnce(async () => {
      return Promise.reject(new Error(errorMessage));
    });

    const { user } = renderWithProviders(<ForgotPasswordComponent />);

    const email = "email@gmail.com";
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
    await user.type(emailInput, email);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
