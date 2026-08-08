import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import ForgotPasswordComponent, {
  resetText,
  buttonText,
  loadingText,
} from "../ForgotPasswordComponent";
import { getLowercase } from "@/utils/test-utils";
import { auth } from "../../lib/auth";
import { env } from "@/utils/env";
import { routes } from "@/utils/routes";

const name = getLowercase(buttonText);

const mockedRequestPasswordReset = auth.api
  .requestPasswordReset as unknown as jest.Mock;

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    const { user } = renderWithProviders(<ForgotPasswordComponent />);
    return {
      user,
      button: screen.getByRole("button", { name }),
      emailInput: screen.getByLabelText(/email/i),
    };
  };

  it("correctly requests password reset", async () => {
    let resolveRequestPasswordReset;

    mockedRequestPasswordReset.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequestPasswordReset = resolve;
        }),
    );

    const { user, emailInput, button } = renderComponent();

    expect(emailInput).toBeRequired();

    const email = "   USER@example.com";

    await user.type(emailInput, email);
    await user.click(button);

    const loadingButton = await screen.findByRole("button", {
      name: getLowercase(loadingText),
    });

    expect(loadingButton).toBeDisabled();

    resolveRequestPasswordReset!();
    const resetButton = await screen.findByRole("button", {
      name,
    });

    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(screen.getByText(resetText)).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(mockedRequestPasswordReset).toHaveBeenCalledTimes(1);
      expect(mockedRequestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: email.trim().toLowerCase(),
          redirectTo: env.BASE_URL + routes.passwordReset,
        },
      });
      expect(emailInput).toHaveValue("");
    });
  });

  it("returns an error for invalid request password reset input", async () => {
    const { user, emailInput, button } = renderComponent();

    await user.type(emailInput, "bad-email@d");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(mockedRequestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Something went wrong";
    const email = "email@gmail.com";

    mockedRequestPasswordReset.mockRejectedValueOnce(new Error(errorMessage));

    const { user, emailInput } = renderComponent();

    await user.type(emailInput, email);

    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveValue(email);
      expect(mockedRequestPasswordReset).toHaveBeenCalledTimes(1);
    });
  });
});
