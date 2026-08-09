import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import PasswordResetComponent, {
  invalidText,
  buttonText,
  loadingText,
  passwordErrorId,
  confirmPasswordErrorId,
  passwordResetErrorId,
  passwordResetSuccessId,
} from "../PasswordResetComponent";
import {
  notMatchingPassword,
  resetPasswordSuccessMessage,
  shortPassword,
} from "@/features/auth/utils/constants";
import { useSearchParams } from "next/navigation";
import { auth } from "../../lib/auth";

const mockGet = jest.fn();

(
  useSearchParams as jest.MockedFunction<typeof useSearchParams>
).mockReturnValue({
  get: mockGet,
} as unknown as ReturnType<typeof useSearchParams>);

const mockedResetPassword = auth.api.resetPassword as unknown as jest.Mock;

const name = getLowercase(buttonText);

const password = "newpassword123";
const token = "mytoken";

describe("Password Reset Component", () => {
  const renderComponent = () => {
    const { user } = renderWithProviders(<PasswordResetComponent />);
    return {
      user,
      button: screen.getByRole("button", { name }),
      passwordInput: screen.getByLabelText("New Password"),
      confirmPasswordInput: screen.getByLabelText("Confirm New Password"),
    };
  };

  it("resets password correctly", async () => {
    mockGet.mockReturnValue(token);

    let resolveResetPassword;

    mockedResetPassword.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResetPassword = resolve;
        }),
    );

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    // check if each element is actually wired to its own error via aria-describedby
    expect(passwordInput.getAttribute("aria-describedby")).toContain(
      passwordErrorId,
    );
    expect(confirmPasswordInput.getAttribute("aria-describedby")).toContain(
      confirmPasswordErrorId,
    );
    expect(button.getAttribute("aria-describedby")).toContain(
      passwordResetSuccessId,
    );
    expect(button.getAttribute("aria-describedby")).toContain(
      passwordResetErrorId,
    );

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(button);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveResetPassword!();

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(document.getElementById(passwordResetSuccessId)).toHaveTextContent(
        resetPasswordSuccessMessage,
      );
      expect(mockedResetPassword).toHaveBeenCalledTimes(1);
      expect(mockedResetPassword).toHaveBeenCalledWith({
        body: { newPassword: password, token },
      });
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("shows error when token is missing", async () => {
    mockGet.mockReturnValue(null);

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(button);

    await waitFor(() => {
      expect(document.getElementById(passwordResetErrorId)).toHaveTextContent(
        invalidText,
      );
      expect(mockedResetPassword).not.toHaveBeenCalled();
    });
  });

  it("shows api error", async () => {
    mockGet.mockReturnValue(token);

    const errorMessage = "Invalid token";

    mockedResetPassword.mockRejectedValueOnce(new Error(errorMessage));

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(button);

    await waitFor(() => {
      expect(document.getElementById(passwordResetErrorId)).toHaveTextContent(
        errorMessage,
      );
      expect(mockedResetPassword).toHaveBeenCalledTimes(1);
      expect(mockedResetPassword).toHaveBeenCalledWith({
        body: { newPassword: password, token },
      });
    });
  });

  it("returns validation errors for invalid password reset input", async () => {
    mockGet.mockReturnValue(token);

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "different");

    await user.click(button);

    await waitFor(() => {
      expect(mockedResetPassword).not.toHaveBeenCalled();
    });
    expect(document.getElementById(passwordErrorId)).toHaveTextContent(
      shortPassword,
    );
    expect(document.getElementById(confirmPasswordErrorId)).toHaveTextContent(
      notMatchingPassword,
    );
  });
});
