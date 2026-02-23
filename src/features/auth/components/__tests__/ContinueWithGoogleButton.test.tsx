import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import ContinueWithGoogleButton from "../ContinueWithGoogleButton";
import { authClient } from "../../lib/authClient";

jest.mock("@/features/auth/lib/authClient", () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
}));

describe("ContinueWithGoogle Button", () => {
  it("logs in user correctly", async () => {
    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    await user.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
    });
  });

  it("shows error", async () => {
    const errorMessage = "Google Auth Failed";
    (authClient.signIn.social as unknown as jest.Mock).mockImplementationOnce(
      async () => {
        return Promise.resolve({ error: { message: errorMessage } });
      },
    );

    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    await user.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
