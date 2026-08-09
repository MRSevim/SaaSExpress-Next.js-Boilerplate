import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import SignUpComponent, {
  confirmPasswordErrorId,
  emailErrorId,
  nameErrorId,
  passwordErrorId,
  signUpButtonText,
  signUpLoadingButtonText,
  submitButtonErrorId,
  submitButtonSuccessId,
} from "../SignUpComponent";
import {
  invalidEmail,
  notMatchingPassword,
  shortName,
  shortPassword,
  signUpSuccessMessage,
} from "@/features/auth/utils/constants";
import { auth } from "../../lib/auth";

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

const mockedSignUp = auth.api.signUpEmail as unknown as jest.Mock;

const name = getLowercase(signUpButtonText);

const password = "mypassword";

describe("Sign Up Component", () => {
  const renderComponent = () => {
    const { user } = renderWithProviders(<SignUpComponent />);
    return {
      user,
      nameInput: screen.getByLabelText("Username"),
      emailInput: screen.getByLabelText("Email"),
      passwordInput: screen.getByLabelText("Password"),
      confirmPasswordInput: screen.getByLabelText("Confirm password"),
      submitButton: screen.getByRole("button", { name }),
    };
  };

  it("signs user up correctly", async () => {
    let resolveSignUp;

    const username = "  myname";
    const email = "   BIGemail@gmail.com";
    mockedSignUp.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve;
        }),
    );

    const {
      user,
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
    } = renderComponent();

    expect(submitButton.getAttribute("aria-describedby")).toContain(
      submitButtonErrorId,
    );
    expect(submitButton.getAttribute("aria-describedby")).toContain(
      submitButtonSuccessId,
    );
    expect(nameInput.getAttribute("aria-describedby")).toContain(nameErrorId);
    expect(emailInput.getAttribute("aria-describedby")).toContain(emailErrorId);
    expect(passwordInput.getAttribute("aria-describedby")).toContain(
      passwordErrorId,
    );
    expect(confirmPasswordInput.getAttribute("aria-describedby")).toContain(
      confirmPasswordErrorId,
    );

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    await user.type(nameInput, username);
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(submitButton);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(signUpLoadingButtonText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignUp!();

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(document.getElementById(submitButtonSuccessId)).toHaveTextContent(
        signUpSuccessMessage,
      );
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(mockedSignUp).toHaveBeenCalledTimes(1);
      expect(mockedSignUp).toHaveBeenCalledWith({
        body: {
          name: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      });
      expect(nameInput).toHaveValue("");
      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
      expect(confirmPasswordInput).toHaveValue("");
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Email already exists";
    const email = "myemail@gmail.com";
    const name = "myname";

    mockedSignUp.mockRejectedValueOnce(new Error(errorMessage));

    const {
      user,
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
    } = renderComponent();

    await user.type(nameInput, name);
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(submitButtonErrorId)).toHaveTextContent(
        errorMessage,
      );
      expect(nameInput).toHaveValue(name);
      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue("");
      expect(confirmPasswordInput).toHaveValue("");
    });
  });

  it("shows validation errors", async () => {
    const email = "myemail@g";
    const name = "m";
    const password = "short";
    const confirmPassword = "different";

    const {
      user,
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
    } = renderComponent();

    await user.type(nameInput, name);
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, confirmPassword);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(nameErrorId)).toHaveTextContent(shortName);
      expect(document.getElementById(emailErrorId)).toHaveTextContent(
        invalidEmail,
      );
      expect(document.getElementById(passwordErrorId)).toHaveTextContent(
        shortPassword,
      );
      expect(document.getElementById(confirmPasswordErrorId)).toHaveTextContent(
        notMatchingPassword,
      );
      expect(mockedSignUp).not.toHaveBeenCalled();
      expect(nameInput).toHaveValue(name);
      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue("");
      expect(confirmPasswordInput).toHaveValue("");
    });
  });
});
