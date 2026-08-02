import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import PasswordResetComponent, { invalidText } from "../PasswordResetComponent";
import { renderWithProviders } from "@/utils/test-utils";
import { auth } from "../../lib/auth";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      resetPassword: jest.fn(),
    },
  },
}));

const mockGet = jest.fn();

describe("Password Reset Component", () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
  });

  it("shows error when token is missing", async () => {
    mockGet.mockReturnValue(null);

    const { user } = renderWithProviders(<PasswordResetComponent />);

    const password = "newpassword123";

    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(screen.getByText(invalidText)).toBeInTheDocument();
    });

    expect(auth.api.resetPassword).not.toHaveBeenCalled();
  });

  it("resets password correctly", async () => {
    mockGet.mockReturnValue("mytoken");

    const { user } = renderWithProviders(<PasswordResetComponent />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    // First, submit invalid passwords to check validation errors
    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "different");

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    // Then, reset with valid passwords
    (auth.api.resetPassword as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        // Artificial delay to ensure loading state is rendered
        return new Promise((resolve) => {
          setTimeout(() => resolve({}), 50);
        });
      },
    );

    const password = "newpassword123";

    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(screen.getByRole("button", { name: "Reset" }));

    const resettingButton = await screen.findByRole("button", {
      name: /resetting.../i,
    });

    expect(resettingButton).toBeDisabled();

    const resetButton = await screen.findByRole("button", { name: "Reset" });

    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(
        screen.getByText("Your password have been successfully reset"),
      ).toBeInTheDocument();
    });

    expect(auth.api.resetPassword).toHaveBeenCalledWith({
      body: { newPassword: password, token: "mytoken" },
    });
  });

  it("shows api error", async () => {
    mockGet.mockReturnValue("mytoken");

    const errorMessage = "Invalid token";
    (auth.api.resetPassword as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.reject(new Error(errorMessage));
      },
    );

    const { user } = renderWithProviders(<PasswordResetComponent />);

    const password = "newpassword123";
    await user.type(screen.getByLabelText("New Password"), password);
    await user.type(screen.getByLabelText("Confirm New Password"), password);

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
