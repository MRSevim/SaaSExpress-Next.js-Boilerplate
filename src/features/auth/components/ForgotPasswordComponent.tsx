"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { useActionState } from "react";
import { requestPasswordReset } from "../utils/apiCalls";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import Success from "@/components/Success";
import { passwordResetSuccessMessage } from "../utils/constants";

export const buttonText = "Request Password Reset Link";

export const loadingText = "Requesting...";

export const forgotPasswordResetErrorId = "forgot-password-error";

export const forgotPasswordResetSuccessId = "forgot-password-success";

/**
 *
 */
const ForgotPasswordComponent = () => {
  const [state, action, isPending] = useActionState(
    async (
      _prevState: { error: string; successMessage: string },
      formData: FormData,
    ) => {
      const { error, email } = await requestPasswordReset(
        formData.get("email") as string,
      );
      return {
        email,
        error,
        successMessage: !error ? passwordResetSuccessMessage : "",
      };
    },
    { error: "", successMessage: "", email: "" },
  );

  return (
    <form className="w-full max-w-sm" action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password? </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-describedby={`${forgotPasswordResetErrorId} ${forgotPasswordResetSuccessId}`}
                  defaultValue={state?.email}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                {loadingText}
              </>
            ) : (
              <>{buttonText}</>
            )}
          </Button>
          <Error text={state.error} id={forgotPasswordResetErrorId} />
          <Success
            text={state.successMessage}
            id={forgotPasswordResetSuccessId}
          />
        </CardFooter>
      </Card>
    </form>
  );
};

export default ForgotPasswordComponent;
