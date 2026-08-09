import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import SignInComponent, {
  signInButtonText,
  signInErrorId,
  signInLoadingButtonText,
} from "../SignInComponent";
import { auth } from "../../lib/auth";
import { invalidEmail } from "../../utils/constants";
import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";

const mockedSignInWithEmailAndPassword = auth.api
  .signInEmail as unknown as jest.Mock;

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

const name = getLowercase(signInButtonText);

const password = "mypassword";

describe("Sign In Component", () => {
  const renderComponent = () => {
    const { user } = renderWithProviders(<SignInComponent />);
    return {
      user,
      submitButton: screen.getByRole("button", { name }),
      emailInput: screen.getByLabelText(/email/i),
      passwordInput: screen.getByLabelText(/password/i),
    };
  };

  it("logs in user correctly", async () => {
    let resolveSignIn;
    const email = "   MYemail@gmail.com";

    mockedSignInWithEmailAndPassword.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user, emailInput, passwordInput, submitButton } = renderComponent();

    expect(submitButton.getAttribute("aria-describedby")).toContain(
      signInErrorId,
    );
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    await user.click(submitButton);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(signInLoadingButtonText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignIn!();

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledWith({
        body: {
          email: email.trim().toLowerCase(),
          password,
        },
      });
      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });
    expect(mockedRedirect).toHaveBeenCalledWith(routes.home);
    expect(mockedRedirect).toHaveBeenCalledTimes(1);
  });

  it("shows api error", async () => {
    const error = "Invalid credentials";
    const email = "mymail@gmail.com";

    mockedSignInWithEmailAndPassword.mockRejectedValueOnce(new Error(error));

    const { user, emailInput, passwordInput, submitButton } = renderComponent();

    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(signInErrorId)).toHaveTextContent(error);
      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue("");
    });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("shows validation error", async () => {
    const { user, emailInput, passwordInput, submitButton } = renderComponent();

    const email = "invalid@m";

    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(signInErrorId)).toHaveTextContent(
        invalidEmail,
      );
      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue("");
    });
    expect(mockedSignInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
