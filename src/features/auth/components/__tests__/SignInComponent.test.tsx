import { screen } from "@testing-library/react";
import SignInComponent from "../SignInComponent";
import { renderWithProviders } from "@/utils/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/features/auth/lib/auth", () => ({
  auth: {
    api: {
      signInEmail: jest.fn(async ({ body: { email } }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: "123",
              email,
              emailVerified: true,
              name: "myname",
              image: undefined,
            });
          }, 50);
        });
      }),
    },
  },
}));

jest.mock(
  "@/features/auth/components/ContinueWithGoogleButton",
  () =>
    function GoogleComp() {
      return <></>;
    },
);

describe("Sign In Component", () => {
  it("logs in user correctly", async () => {
    const { user } = renderWithProviders(<SignInComponent />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "myemail@gmail.com");

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "mypassword");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const signInButton = await screen.findByRole("button", {
      name: /signing in.../i,
    });

    expect(signInButton).toBeDisabled();
  });
});
