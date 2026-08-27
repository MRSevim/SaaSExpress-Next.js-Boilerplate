import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  getInsensitiveExp,
} from "@/utils/test-utils/jest-utils";
import ProfileComponent from "../ProfileComponent";

import { User } from "../../utils/types";
import { toast } from "sonner";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";
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

const deleteName = getInsensitiveExp(deleteAccountButtonText);
const resetPasswordName = getInsensitiveExp(requestPasswordResetButtonText);

describe("Profile Component", () => {
  beforeEach(() => {
    mockedUseUserPromiseContext.mockReturnValue(fulfilledUser);
    mockedListUserAccounts.mockResolvedValue([{ providerId: "credential" }]);
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

    // Reset password only appears once checkCredentialsProvider resolves
    expect(
      await screen.findByRole("button", { name: resetPasswordName }),
    ).toBeInTheDocument();

    expect(mockedListUserAccounts).toHaveBeenCalledTimes(1);
    expect(mockedListUserAccounts).toHaveBeenCalledWith({
      headers: await headers(),
    });
  });

  it("renders nothing if user is not there", () => {
    mockedUseUserPromiseContext.mockReturnValueOnce({
      status: "fulfilled" as const,
      value: undefined,
      then: () => {},
    } as unknown as Promise<User | undefined>);

    const { container } = renderWithProviders(<ProfileComponent />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hides reset button for non-credential providers", async () => {
    mockedListUserAccounts.mockResolvedValue([{ providerId: "google" }]);

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

    mockedListUserAccounts.mockRejectedValue(new Error(errorMessage));

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
      expect(toast.success).toHaveBeenCalledWith(
        accountDeletionEmailSuccessMessage,
      );
      expect(toast.error).not.toHaveBeenCalled();
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
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
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
      expect(toast.success).toHaveBeenCalledWith(
        passwordResetEmailSuccessMessage,
      );
      expect(toast.error).not.toHaveBeenCalled();
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
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
