import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import SignUpComponent from "../SignUpComponent";
import { renderWithProviders } from "@/utils/test-utils";
import { auth } from "../../lib/auth";

jest.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: jest.fn(),
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

describe("Sign Up Component", () => {
  it("signs up user correctly", async () => {
    const { user } = renderWithProviders(<SignUpComponent />);

    const nameInput = screen.getByLabelText("Username");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // First, submit invalid data to check validation errors
    await user.type(nameInput, "A");
    await user.type(emailInput, "myemail@g");
    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "different");

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    // Then, sign up with valid data
    (auth.api.signUpEmail as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        // Artificial delay to ensure loading state is rendered
        return new Promise((resolve) => {
          setTimeout(() => resolve({}), 50);
        });
      },
    );

    await user.clear(nameInput);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);

    const name = "myname";
    const email = "myemail@gmail.com";
    const password = "mypassword";

    await user.type(nameInput, name);
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    const signingUpButton = await screen.findByRole("button", {
      name: /signing up.../i,
    });

    expect(signingUpButton).toBeDisabled();

    const resetSignUpButton = await screen.findByRole("button", {
      name: /sign up/i,
    });

    expect(resetSignUpButton).toBeEnabled();

    await waitFor(() => {
      expect(
        screen.getByText("A verification email has been sent to your adress"),
      ).toBeInTheDocument();
    });

    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name,
        email,
        password,
      },
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Email already exists";
    (auth.api.signUpEmail as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.reject(new Error(errorMessage));
      },
    );

    const { user } = renderWithProviders(<SignUpComponent />);

    await user.type(screen.getByLabelText("Username"), "myname");
    await user.type(screen.getByLabelText("Email"), "myemail@gmail.com");
    await user.type(screen.getByLabelText("Password"), "mypassword");
    await user.type(screen.getByLabelText("Confirm password"), "mypassword");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(
      screen.queryByText("A verification email has been sent to your adress"),
    ).not.toBeInTheDocument();
  });
});
