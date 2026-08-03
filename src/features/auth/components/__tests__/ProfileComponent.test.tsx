import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import ProfileComponent, {
  deleteButtonText,
  accountDeletionSuccessMessage,
  passwordResetSuccessMessage,
  resetPasswordButtonText,
} from "../ProfileComponent";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
} from "@/features/auth/utils/apiCalls";
import {
  CheckCredentialsProvider,
  DeleteUser,
  RequestPasswordReset,
  User,
} from "../../utils/types";
import { toast } from "sonner";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";

jest.mock("@/features/auth/utils/apiCalls", () => ({
  checkCredentialsProvider: jest.fn(),
  deleteUser: jest.fn(),
  requestPasswordReset: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/features/auth/utils/contexts/UserPromiseContext", () => ({
  useUserPromiseContext: jest.fn(),
}));

const mockedCheckCredentialsProvider =
  checkCredentialsProvider as jest.MockedFunction<CheckCredentialsProvider>;

const mockedDeleteUser = deleteUser as jest.MockedFunction<DeleteUser>;

const mockedRequestPasswordReset =
  requestPasswordReset as jest.MockedFunction<RequestPasswordReset>;

const mockedUseUserPromiseContext =
  useUserPromiseContext as jest.MockedFunction<typeof useUserPromiseContext>;

const user: User = {
  id: "123",
  email: "myemail@gmail.com",
  emailVerified: true,
  name: "Myname",
};

// React's `use()` reads a pre-settled thenable's `status`/`value` synchronously
// instead of suspending, so the profile renders without a Suspense boundary.
const fulfilledUser = {
  status: "fulfilled" as const,
  value: user,
  then: () => {},
} as unknown as Promise<User | undefined>;

const noError = { error: "" };

const deleteName = getLowercase(deleteButtonText);
const resetPasswordName = getLowercase(resetPasswordButtonText);

const renderProfile = () => renderWithProviders(<ProfileComponent />);

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUserPromiseContext.mockReturnValue(fulfilledUser);
    mockedCheckCredentialsProvider.mockResolvedValue({
      isTrue: true,
      error: "",
    });
  });

  it("renders profile and credential actions", async () => {
    renderProfile();

    expect(await screen.findByText(user.name[0])).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: deleteName }),
    ).toBeInTheDocument();

    // Reset password only appears once checkCredentialsProvider resolves
    expect(
      await screen.findByRole("button", { name: resetPasswordName }),
    ).toBeInTheDocument();

    expect(mockedCheckCredentialsProvider).toHaveBeenCalledTimes(1);
  });

  it("hides reset button for non-credential providers", async () => {
    mockedCheckCredentialsProvider.mockResolvedValue({
      isTrue: false,
      error: "",
    });

    renderProfile();

    expect(
      await screen.findByRole("button", { name: deleteName }),
    ).toBeInTheDocument();

    // Wait for the provider check to finish (spinner unmounts), then assert
    // the reset button never rendered
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: resetPasswordName }),
    ).not.toBeInTheDocument();

    expect(mockedCheckCredentialsProvider).toHaveBeenCalledTimes(1);
  });

  it("shows check error", async () => {
    const errorMessage = "Something went wrong";

    mockedCheckCredentialsProvider.mockResolvedValue({
      isTrue: false,
      error: errorMessage,
    });

    renderProfile();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: resetPasswordName }),
    ).not.toBeInTheDocument();

    expect(mockedCheckCredentialsProvider).toHaveBeenCalledTimes(1);
  });

  it("deletes account and toasts success", async () => {
    mockedDeleteUser.mockResolvedValueOnce(noError);

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: deleteName }),
    );

    await waitFor(() => {
      expect(mockedDeleteUser).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(accountDeletionSuccessMessage);
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deletes account and toasts error", async () => {
    const errorMessage = "Deletion failed";

    mockedDeleteUser.mockResolvedValueOnce({ error: errorMessage });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: deleteName }),
    );

    await waitFor(() => {
      expect(mockedDeleteUser).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("requests password reset and toasts success", async () => {
    mockedRequestPasswordReset.mockResolvedValueOnce({
      error: "",
      email: user.email,
    });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: resetPasswordName }),
    );

    await waitFor(() => {
      expect(mockedRequestPasswordReset).toHaveBeenCalledTimes(1);
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith(user.email);
      expect(toast.success).toHaveBeenCalledWith(passwordResetSuccessMessage);
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("requests password reset and toasts error", async () => {
    const errorMessage = "Reset failed";

    mockedRequestPasswordReset.mockResolvedValueOnce({
      error: errorMessage,
      email: user.email,
    });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: resetPasswordName }),
    );

    await waitFor(() => {
      expect(mockedRequestPasswordReset).toHaveBeenCalledTimes(1);
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith(user.email);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    expect(toast.success).not.toHaveBeenCalled();
  });
});
