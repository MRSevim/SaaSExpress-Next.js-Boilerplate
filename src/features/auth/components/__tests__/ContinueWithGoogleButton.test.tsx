import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils/jest-utils";
import ContinueWithGoogleButton, {
  googleSignInErrorId,
  loadingText,
} from "../ContinueWithGoogleButton";
import { getInsensitiveExp } from "@/utils/test-utils/jest-utils";
import { authClient } from "../../lib/authClient";
import { unknownError } from "@/utils/constants";
import { googleSignInButtonText } from "../../utils/constants";

const name = getInsensitiveExp(googleSignInButtonText);

const noError = { error: "" };

const mockedSocialSignIn = authClient.signIn.social as jest.Mock;

describe("ContinueWithGoogle Button", () => {
  const renderButton = () => {
    const { user } = renderWithProviders(<ContinueWithGoogleButton />);
    return { user, button: screen.getByRole("button", { name }) };
  };

  it("logs in user correctly", async () => {
    mockedSocialSignIn.mockResolvedValueOnce(noError);

    const { user, button } = renderButton();
    expect(button.getAttribute("aria-describedby")).toContain(
      googleSignInErrorId,
    );
    await user.click(button);

    await waitFor(() => {
      expect(mockedSocialSignIn).toHaveBeenCalledWith({
        provider: "google",
      });
      expect(mockedSocialSignIn).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("shows error when api resolves to error", async () => {
    const error = "Google Auth Failed";

    mockedSocialSignIn.mockResolvedValueOnce({
      error: { message: error },
    });

    const { user, button } = renderButton();

    await user.click(button);

    await waitFor(() => {
      expect(document.getElementById(googleSignInErrorId)).toHaveTextContent(
        error,
      );
    });
  });

  it("shows error when api rejects", async () => {
    const error = "Google Auth Failed";

    mockedSocialSignIn.mockRejectedValueOnce(new Error(error));

    const { user, button } = renderButton();

    await user.click(button);

    await waitFor(() => {
      expect(document.getElementById(googleSignInErrorId)).toHaveTextContent(
        error,
      );
    });
  });

  it("disables the button while signing in and re-enables after", async () => {
    let resolveSignIn;

    mockedSocialSignIn.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user, button } = renderButton();

    await user.click(button);

    const loadingButton = await screen.findByRole("button", {
      name: getInsensitiveExp(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignIn!(noError);

    const resetButton = await screen.findByRole("button", {
      name,
    });

    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(mockedSocialSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it("shows unknown error when rejected value is not an Error instance", async () => {
    mockedSocialSignIn.mockRejectedValueOnce("some string, not an Error");

    const { user, button } = renderButton();

    await user.click(button);

    await waitFor(() => {
      expect(document.getElementById(googleSignInErrorId)).toHaveTextContent(
        unknownError,
      );
    });
  });

  it("clears previous error on retry", async () => {
    const error = "Google Auth Failed";

    mockedSocialSignIn.mockResolvedValueOnce({ error: { message: error } });
    mockedSocialSignIn.mockResolvedValueOnce(noError);

    const { user, button } = renderButton();

    await user.click(button);

    await screen.findByText(error);

    await user.click(button);

    await waitFor(() => {
      expect(
        document.getElementById(googleSignInErrorId),
      ).not.toHaveTextContent(error);
    });
  });
});
