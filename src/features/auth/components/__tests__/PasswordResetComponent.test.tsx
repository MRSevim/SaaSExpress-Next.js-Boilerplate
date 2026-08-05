import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import PasswordResetComponent, {
  invalidText,
  buttonText,
  loadingText,
} from "../PasswordResetComponent";
import { resetPassword } from "@/features/auth/utils/apiCalls";
import { resetPasswordSuccessMessage } from "@/features/auth/utils/constants";
import { ResetPassword, ResetPasswordState } from "../../utils/types";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/features/auth/utils/apiCalls", () => ({
  resetPassword: jest.fn(),
}));

const mockedResetPassword = resetPassword as jest.MockedFunction<ResetPassword>;

const mockedUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

const mockGet = jest.fn();

const name = getLowercase(buttonText);

const password = "newpassword123";
const token = "mytoken";

const noError: ResetPasswordState = {
  error: "",
  successMessage: resetPasswordSuccessMessage,
};

describe("Password Reset Component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseSearchParams.mockReturnValue({
      get: mockGet,
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  const renderComponent = () => {
    const { user } = renderWithProviders(<PasswordResetComponent />);
    return {
      user,
      button: screen.getByRole("button", { name }),
      passwordInput: screen.getByLabelText("New Password"),
      confirmPasswordInput: screen.getByLabelText("Confirm New Password"),
    };
  };

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
      expect(screen.getByText(invalidText)).toBeInTheDocument();
      expect(mockedResetPassword).not.toHaveBeenCalled();
    });
  });

  it("resets password correctly", async () => {
    mockGet.mockReturnValue(token);

    let resolveResetPassword: (
      value: Awaited<ReturnType<ResetPassword>>,
    ) => void;

    mockedResetPassword.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResetPassword = resolve;
        }),
    );

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(button);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveResetPassword!(noError);

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(screen.getByText(resetPasswordSuccessMessage)).toBeInTheDocument();
      expect(mockedResetPassword).toHaveBeenCalledTimes(1);
      const [formData, resetToken] = mockedResetPassword.mock.calls[0];
      expect(formData.get("password")).toBe(password);
      expect(formData.get("confirm-password")).toBe(password);
      expect(resetToken).toBe(token);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("shows api error", async () => {
    mockGet.mockReturnValue(token);

    const errorMessage = "Invalid token";

    mockedResetPassword.mockResolvedValueOnce({
      error: errorMessage,
      successMessage: "",
    });

    const { user, button, passwordInput, confirmPasswordInput } =
      renderComponent();

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockedResetPassword).toHaveBeenCalledTimes(1);
    });
  });
});
