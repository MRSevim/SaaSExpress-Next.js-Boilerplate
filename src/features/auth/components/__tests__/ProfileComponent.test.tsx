import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  getInsensitiveExp,
} from "@/utils/test-utils/jest-utils";
import ProfileComponent from "../ProfileComponent";
import { useUser } from "@/features/auth/utils/contexts/UserPromiseContext";
import {
  accountDeletionEmailSuccessMessage,
  passwordResetEmailSuccessMessage,
  requestPasswordResetButtonText,
  deleteAccountButtonText,
} from "../../utils/constants";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { routes } from "@/utils/routes";
import { env } from "@/utils/env";

const mockedListUserAccounts = auth.api
  .listUserAccounts as unknown as jest.Mock;

const mockedDeleteUser = auth.api.deleteUser as unknown as jest.Mock;

const mockedRequestPasswordReset = auth.api
  .requestPasswordReset as unknown as jest.Mock;

const mockedGetSession = auth.api.getSession as unknown as jest.Mock;

const mockedUseUser = useUser as jest.MockedFunction<typeof useUser>;

const user: { email: string; name: string } = {
  email: "myemail@gmail.com",
  name: "Myname",
};

const deleteName = getInsensitiveExp(deleteAccountButtonText);
const resetPasswordName = getInsensitiveExp(requestPasswordResetButtonText);

describe("Profile Component", () => {
  beforeAll(() => {
    mockedUseUser.mockReturnValue(user);
    mockedListUserAccounts.mockResolvedValue([{ providerId: "credential" }]);
    mockedGetSession.mockResolvedValue({
      user: { name: user.name, email: user.email },
    });
  });

  const renderProfile = () => {
    const { user, container } = renderWithProviders(<ProfileComponent />);
    return {
      container,
      user,
      deleteAccountButton: screen.getByRole("button", { name: deleteName }),
    };
  };

  it("renders profile and credential actions", async () => {
    const { deleteAccountButton } = renderProfile();

    expect(await screen.findByText(user.name[0])).toBeInTheDocument();

    expect(deleteAccountButton).toBeInTheDocument();

    expect(mockedListUserAccounts).toHaveBeenCalledTimes(1);
    expect(mockedListUserAccounts).toHaveBeenCalledWith({
      headers: await headers(),
    });
    // Reset password only appears once checkCredentialsProvider resolves
    expect(
      await screen.findByRole("button", { name: resetPasswordName }),
    ).toBeInTheDocument();
  });

  it("renders nothing if user is not there", () => {
    mockedUseUser.mockReturnValueOnce(undefined);

    const { container } = renderWithProviders(<ProfileComponent />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hides reset button for non-credential providers", async () => {
    mockedListUserAccounts.mockResolvedValueOnce([{ providerId: "google" }]);

    renderProfile();

    // Wait for the provider check to finish (spinner unmounts), then assert
    // the reset button never rendered
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(mockedListUserAccounts).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByRole("button", { name: resetPasswordName }),
    ).not.toBeInTheDocument();
  });

  it("shows check error", async () => {
    const errorMessage = "Something went wrong";

    mockedListUserAccounts.mockRejectedValueOnce(new Error(errorMessage));

    renderProfile();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: resetPasswordName }),
    ).not.toBeInTheDocument();
  });

  it("deletes account and toasts success", async () => {
    const name = deleteName;
    let resolveDeleteUser;

    mockedDeleteUser.mockImplementationOnce(async () => {
      return new Promise((resolve) => {
        resolveDeleteUser = resolve;
      });
    });

    const { user, deleteAccountButton } = renderProfile();

    await user.click(deleteAccountButton);

    const loadingButton = await screen.findByRole("button", {
      name,
    });
    expect(loadingButton).toBeDisabled();

    resolveDeleteUser!();

    await waitFor(async () => {
      expect(
        screen.queryByText(accountDeletionEmailSuccessMessage),
      ).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(loadingButton).not.toBeDisabled();
      expect(mockedDeleteUser).toHaveBeenCalledTimes(1);
      expect(mockedDeleteUser).toHaveBeenCalledWith({
        headers: await headers(),
        body: { callbackURL: routes.home },
      });
    });
  });

  it("toasts error when clicking delete account", async () => {
    const errorMessage = "Deletion failed";

    mockedDeleteUser.mockRejectedValueOnce(new Error(errorMessage));

    const { user, deleteAccountButton } = renderProfile();

    await user.click(deleteAccountButton);

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();

      expect(screen.queryByText(/successful/i)).not.toBeInTheDocument();
    });
  });

  it("requests password reset and toasts success", async () => {
    const name = resetPasswordName;
    let resolveRequestPasswordReset;

    mockedRequestPasswordReset.mockImplementationOnce(async () => {
      return new Promise((resolve) => {
        resolveRequestPasswordReset = resolve;
      });
    });

    const { user: userEvent } = renderProfile();

    await userEvent.click(await screen.findByRole("button", { name }));

    const loadingButton = await screen.findByRole("button", {
      name,
    });
    expect(loadingButton).toBeDisabled();

    resolveRequestPasswordReset!();

    await waitFor(() => {
      expect(loadingButton).not.toBeDisabled();
      expect(mockedRequestPasswordReset).toHaveBeenCalledTimes(1);
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: user.email,
          redirectTo: env.BASE_URL + routes.passwordReset,
        },
      });
      expect(
        screen.queryByText(passwordResetEmailSuccessMessage),
      ).toBeInTheDocument();

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("toasts error when clicking request password reset", async () => {
    const errorMessage = "Reset failed";

    mockedRequestPasswordReset.mockRejectedValueOnce(new Error(errorMessage));

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: resetPasswordName }),
    );

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText(/successful/i)).not.toBeInTheDocument();
    });
  });
});
