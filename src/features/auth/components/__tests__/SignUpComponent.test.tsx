import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, getLowercase } from "@/utils/test-utils";
import SignUpComponent, {
  signUpButtonText,
  signUpLoadingButtonText,
} from "../SignUpComponent";
import { signUp } from "@/features/auth/utils/apiCalls";
import { signUpSuccessMessage } from "@/features/auth/utils/constants";
import { SignUp, SignUpState } from "../../utils/types";

jest.mock("@/features/auth/utils/apiCalls", () => ({
  signUp: jest.fn(),
}));

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

const mockedSignUp = signUp as jest.MockedFunction<SignUp>;

const name = getLowercase(signUpButtonText);

const nameValue = "myname";
const email = "myemail@gmail.com";
const password = "mypassword";

const noError: SignUpState = {
  error: "",
  successMessage: signUpSuccessMessage,
  defaultValues: { name: nameValue, email },
};

describe("Sign Up Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signs up user correctly", async () => {
    let resolveSignUp: (value: Awaited<ReturnType<SignUp>>) => void;

    mockedSignUp.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve;
        }),
    );

    const { user } = renderWithProviders(<SignUpComponent />);

    const nameInput = screen.getByLabelText("Username");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    await user.type(nameInput, nameValue);
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);

    await user.click(screen.getByRole("button", { name }));

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(signUpLoadingButtonText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSignUp!(noError);

    const resetButton = await screen.findByRole("button", { name });
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(screen.getByText(signUpSuccessMessage)).toBeInTheDocument();
      expect(mockedSignUp).toHaveBeenCalledTimes(1);
      const [, formData] = mockedSignUp.mock.calls[0];
      expect(formData.get("name")).toBe(nameValue);
      expect(formData.get("email")).toBe(email);
      expect(formData.get("password")).toBe(password);
      expect(formData.get("confirm-password")).toBe(password);
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Email already exists";

    mockedSignUp.mockResolvedValueOnce({
      error: errorMessage,
      defaultValues: { name: nameValue, email },
    });

    const { user } = renderWithProviders(<SignUpComponent />);

    await user.type(screen.getByLabelText("Username"), nameValue);
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm password"), password);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockedSignUp).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(signUpSuccessMessage)).not.toBeInTheDocument();
    });
  });
});
