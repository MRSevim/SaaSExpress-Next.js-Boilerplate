import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import ContinueWithGoogleButton, {
  buttonText,
  loadingText,
} from "../ContinueWithGoogleButton";
import { signInWithGoogle } from "@/features/auth/utils/apiCallsClient";
import { signInWithGoogleType } from "../../utils/types";

jest.mock("@/features/auth/utils/apiCallsClient", () => ({
  signInWithGoogle: jest.fn(),
}));

const mockedSignInWithGoogle =
  signInWithGoogle as jest.MockedFunction<signInWithGoogleType>;

const name = new RegExp(buttonText.toLowerCase(), "i");

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
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
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
    let resolveSignIn: (
      value: Awaited<ReturnType<signInWithGoogleType>>,
    ) => void;

    mockedSignInWithGoogle.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user } = renderWithProviders(<ContinueWithGoogleButton />);

    const button = screen.getByRole("button", { name });

    await user.click(button);
    await user.click(button);

    expect(button).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: new RegExp(loadingText.toLowerCase(), "i"),
      }),
    ).toBeInTheDocument();

    resolveSignIn!(noError);

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(button).not.toBeDisabled();
    });

    expect(screen.getByRole("button", { name })).toBeInTheDocument();
  });
});
