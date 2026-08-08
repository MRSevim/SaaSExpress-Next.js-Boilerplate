import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import SignInComponent, {
  signInButtonText,
  signInLoadingButtonText,
} from "../SignInComponent";
import { signInWithEmailAndPassword } from "@/features/auth/utils/apiCalls";
import { SignInWithEmailAndPassword } from "../../utils/types";

jest.mock("@/features/auth/utils/apiCalls", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

const mockedSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<SignInWithEmailAndPassword>;

const name = getLowercase(signInButtonText);

const email = "myemail@gmail.com";
const password = "mypassword";

const noError = { error: "" };

describe("Sign In Component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = () => {
    const { user } = renderWithProviders(<SignInComponent />);
    return {
      user,
      submitButton: screen.getByRole("button", { name }),
      emailInput: screen.getByLabelText(/email/i),
      passwordInput: screen.getByLabelText(/password/i),
    };
  };

  it("logs in user correctly", async () => {
    let resolveSignIn: (
      value: Awaited<ReturnType<SignInWithEmailAndPassword>>,
    ) => void;

    mockedSignInWithEmailAndPassword.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    const { user, emailInput, passwordInput, submitButton } = renderComponent();

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    await user.click(submitButton);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(signInLoadingButtonText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignIn!(noError);

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      const [formData] = mockedSignInWithEmailAndPassword.mock.calls[0];
      expect(formData.get("email")).toBe(email);
      expect(formData.get("password")).toBe(password);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });
  });

  it("shows error", async () => {
    const error = "Invalid credentials";

    mockedSignInWithEmailAndPassword.mockResolvedValueOnce({ error });

    const { user, emailInput, passwordInput, submitButton } = renderComponent();

    await user.type(emailInput, email);
    await user.type(passwordInput, password);

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
      expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      const [formData] = mockedSignInWithEmailAndPassword.mock.calls[0];
      expect(formData.get("email")).toBe(email);
      expect(formData.get("password")).toBe(password);
      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue("");
    });
  });
});
