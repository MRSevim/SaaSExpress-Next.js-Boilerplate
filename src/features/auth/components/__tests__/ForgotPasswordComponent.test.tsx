import "../../utils/commonMocks";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { requestPasswordReset } from "@/features/auth/utils/apiCalls";
import { RequestPasswordReset } from "../../utils/types";
import ForgotPasswordComponent, {
  resetText,
  buttonText,
  loadingText,
} from "../ForgotPasswordComponent";
import { getLowercase } from "@/utils/test-utils";

jest.mock("@/features/auth/utils/apiCalls", () => ({
  requestPasswordReset: jest.fn(),
}));

const mockedRequestPasswordReset =
  requestPasswordReset as jest.MockedFunction<RequestPasswordReset>;

const name = getLowercase(buttonText);

const noError = { error: "", email: "" };

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("correctly requests password reset", async () => {
    let resolveRequestPasswordReset: (
      value: Awaited<ReturnType<RequestPasswordReset>>,
    ) => void;

    mockedRequestPasswordReset.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequestPasswordReset = resolve;
        }),
    );

    const { user } = renderWithProviders(<ForgotPasswordComponent />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();

    const emailText = "myemail@gmail.com";

    await user.type(emailInput, emailText);
    await user.click(screen.getByRole("button", { name }));

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveRequestPasswordReset!(noError);
    const resetButton = await screen.findByRole("button", {
      name,
    });

    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(screen.getByText(resetText)).toBeInTheDocument();
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith(emailText);
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Something went wrong";
    const email = "email@gmail.com";

    mockedRequestPasswordReset.mockResolvedValueOnce({
      error: errorMessage,
      email,
    });

    const { user } = renderWithProviders(<ForgotPasswordComponent />);

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, email);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveValue(email);
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith(email);
    });
  });
});
