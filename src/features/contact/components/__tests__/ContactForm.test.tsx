import {
  getInsensitiveExp,
  renderWithProviders,
} from "@/utils/test-utils/jest-utils";
import {
  ContactForm,
  contactErrorId,
  contactLoadingButtonText,
  contactSuccessId,
  emailErrorId,
  messageErrorId,
  nameErrorId,
} from "../ContactForm";
import { screen, waitFor } from "@testing-library/react";
import {
  contactFormShortMessageError,
  contactFormSuccessMessage,
  contactButtonText,
} from "../../utils/constants";
import { sendEmail } from "@/lib/resend/helpers";
import { invalidEmail, shortName } from "@/features/auth/utils/constants";
import { env } from "@/utils/env";
jest.mock("@/lib/resend/helpers");

const mockedSendEmail = sendEmail as unknown as jest.Mock;

describe("ContactForm Component", () => {
  const renderComponent = () => {
    const { user } = renderWithProviders(<ContactForm />);
    return {
      user,
      submitButton: screen.getByRole("button", {
        name: getInsensitiveExp(contactButtonText),
      }),
      messageInput: screen.getByLabelText(/message/i),
      nameInput: screen.getByLabelText(/name/i),
      emailInput: screen.getByLabelText(/email/i),
    };
  };
  it("sends contact form correctly", async () => {
    let resolveSendEmail;

    const username = "  myname";
    const email = "   BIGemail@gmail.com";
    const message = "   This is a valid message with more than 20 characters";

    mockedSendEmail.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSendEmail = resolve;
        }),
    );

    const { user, nameInput, emailInput, messageInput, submitButton } =
      renderComponent();

    expect(submitButton.getAttribute("aria-describedby")).toContain(
      contactErrorId,
    );
    expect(submitButton.getAttribute("aria-describedby")).toContain(
      contactSuccessId,
    );
    expect(nameInput.getAttribute("aria-describedby")).toContain(nameErrorId);
    expect(emailInput.getAttribute("aria-describedby")).toContain(emailErrorId);
    expect(messageInput.getAttribute("aria-describedby")).toContain(
      messageErrorId,
    );

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(messageInput).toBeRequired();

    await user.type(nameInput, username);
    await user.type(emailInput, email);
    await user.type(messageInput, message);

    await user.click(submitButton);

    const loadingButton = await screen.findByRole("button", {
      name: getInsensitiveExp(contactLoadingButtonText),
    });

    expect(loadingButton).toBeDisabled();

    resolveSendEmail!();

    const resetButton = await screen.findByRole("button", { name: "Submit" }); //regular expression is matching loading button, so we use absolute string to find the reset button
    expect(resetButton).toBeEnabled();

    await waitFor(() => {
      expect(document.getElementById(contactSuccessId)).toHaveTextContent(
        contactFormSuccessMessage,
      );
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: env.CONTACT_EMAIL,
        subject: `New contact form submission in ${env.APP_NAME} from ${username.trim()}`,
        text: `Name: ${username.trim()}\nEmail: ${email.trim().toLowerCase()}\nMessage: ${message.trim()}`,
        type: "contact-form-submission",
      });
      expect(nameInput).toHaveValue("");
      expect(emailInput).toHaveValue("");
      expect(messageInput).toHaveValue("");
    });
  });

  it("shows api error", async () => {
    const errorMessage = "Email already exists";
    const email = "myemail@gmail.com";
    const name = "myname";
    const message = "This is a valid message with more than 20 characters";

    mockedSendEmail.mockRejectedValueOnce(new Error(errorMessage));

    const { user, nameInput, emailInput, messageInput, submitButton } =
      renderComponent();

    await user.type(nameInput, name);
    await user.type(emailInput, email);
    await user.type(messageInput, message);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(contactErrorId)).toHaveTextContent(
        errorMessage,
      );
      expect(nameInput).toHaveValue(name);
      expect(emailInput).toHaveValue(email);
      expect(messageInput).toHaveValue(message);
    });
  });

  it("shows validation errors", async () => {
    const email = "myemail@g";
    const name = "m";
    const message = "short";

    const { user, nameInput, emailInput, messageInput, submitButton } =
      renderComponent();

    await user.type(nameInput, name);
    await user.type(emailInput, email);
    await user.type(messageInput, message);

    await user.click(submitButton);

    await waitFor(() => {
      expect(document.getElementById(nameErrorId)).toHaveTextContent(shortName);
      expect(document.getElementById(emailErrorId)).toHaveTextContent(
        invalidEmail,
      );
      expect(document.getElementById(messageErrorId)).toHaveTextContent(
        contactFormShortMessageError,
      );

      expect(mockedSendEmail).not.toHaveBeenCalled();
      expect(nameInput).toHaveValue(name);
      expect(emailInput).toHaveValue(email);
      expect(messageInput).toHaveValue(message);
    });
  });
});
