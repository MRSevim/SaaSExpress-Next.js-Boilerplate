import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import ContinueWithGoogleButton, {
  buttonText,
  loadingText,
} from "../ContinueWithGoogleButton";
import { signInWithGoogle } from "@/features/auth/utils/apiCallsClient";
import { SignInWithGoogle } from "../../utils/types";
import { getLowercase } from "@/utils/test-utils";

jest.mock("@/features/auth/utils/apiCallsClient", () => ({
  signInWithGoogle: jest.fn(),
}));

const mockedSignInWithGoogle =
  signInWithGoogle as jest.MockedFunction<SignInWithGoogle>;

const name = getLowercase(buttonText);

const noError = { error: "" };

describe("ContinueWithGoogle Button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in user correctly", async () => {
    mockedSignInWithGoogle.mockResolvedValueOnce(noError);

    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(mockedSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it("shows error", async () => {
    const error = "Google Auth Failed";

    mockedSignInWithGoogle.mockResolvedValueOnce({
      error,
    });

    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it("disables the button while signing in and re-enables after", async () => {
    let resolveSignIn: (value: Awaited<ReturnType<SignInWithGoogle>>) => void;

    mockedSignInWithGoogle.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    const button = screen.getByRole("button", { name });

    await user.click(button);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignIn!(noError);

    const resetButton = await screen.findByRole("button", {
      name,
    });

    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(mockedSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });
});
