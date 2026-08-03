import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import ProfileComponent from "../ProfileComponent";
import { renderWithProviders } from "@/utils/test-utils";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
} from "../../utils/apiCalls";
import { toast } from "sonner";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";
import type { User } from "../../utils/types";

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

jest.mock("@/utils/contexts/UserPromiseContext", () => ({
  useUserPromiseContext: jest.fn(),
}));

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
};

const renderProfile = () => renderWithProviders(<ProfileComponent />);

describe("Profile Component", () => {
  beforeEach(() => {
    (useUserPromiseContext as jest.Mock).mockReturnValue(fulfilledUser);
    (checkCredentialsProvider as jest.Mock).mockResolvedValue({
      isTrue: true,
      error: "",
    });
  });

  it("renders profile and credential actions", async () => {
    renderProfile();

    expect(await screen.findByText("M")).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /delete account/i }),
    ).toBeInTheDocument();

    // Reset password only appears once checkCredentialsProvider resolves
    expect(
      await screen.findByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();

    expect(checkCredentialsProvider).toHaveBeenCalled();
  });

  it("hides reset button for non-credential providers", async () => {
    (checkCredentialsProvider as jest.Mock).mockResolvedValue({
      isTrue: false,
      error: "",
    });

    renderProfile();

    expect(
      await screen.findByRole("button", { name: /delete account/i }),
    ).toBeInTheDocument();

    // Wait for the provider check to finish (spinner unmounts), then assert
    // the reset button never rendered
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /reset password/i }),
    ).not.toBeInTheDocument();
  });

  it("shows check error", async () => {
    (checkCredentialsProvider as jest.Mock).mockResolvedValue({
      isTrue: false,
      error: "Something went wrong",
    });

    renderProfile();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /reset password/i }),
    ).not.toBeInTheDocument();
  });

  it("deletes account and toasts success", async () => {
    (deleteUser as jest.Mock).mockResolvedValue({ error: "" });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: /delete account/i }),
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Account deletion email has been sent to your email address",
      );
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deletes account and toasts error", async () => {
    (deleteUser as jest.Mock).mockResolvedValue({ error: "Deletion failed" });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: /delete account/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Deletion failed");
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("requests password reset and toasts success", async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValue({ error: "" });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: /reset password/i }),
    );

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith(user.email);
      expect(toast.success).toHaveBeenCalledWith(
        "Password reset email has been sent to your email address",
      );
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("requests password reset and toasts error", async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValue({
      error: "Reset failed",
    });

    const { user: userEvent } = renderProfile();

    await userEvent.click(
      await screen.findByRole("button", { name: /reset password/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Reset failed");
    });

    expect(toast.success).not.toHaveBeenCalled();
  });
});
