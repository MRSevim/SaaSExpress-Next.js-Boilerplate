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
    jest.clearAllMocks();
    mockedUseSearchParams.mockReturnValue({
      get: mockGet,
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  it("shows error when token is missing", async () => {
    mockGet.mockReturnValue(null);

    const { user } = renderWithProviders(<PasswordResetComponent />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(screen.getByRole("button", { name }));

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

    const { user } = renderWithProviders(<PasswordResetComponent />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(screen.getByRole("button", { name }));

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
    });
  });

  it("shows api error", async () => {
    mockGet.mockReturnValue(token);

    const errorMessage = "Invalid token";

    mockedResetPassword.mockResolvedValueOnce({
      error: errorMessage,
      successMessage: "",
    });

    const { user } = renderWithProviders(<PasswordResetComponent />);

    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockedResetPassword).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByText(resetPasswordSuccessMessage),
      ).not.toBeInTheDocument();
    });
  });
});
