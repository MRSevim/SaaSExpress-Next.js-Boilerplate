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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { useActionState } from "react";
import { resetPassword } from "../utils/apiCalls";
import { ResetPasswordState } from "../utils/types";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import { useSearchParams } from "next/navigation";
import Success from "@/components/Success";

export const invalidText = "Please use a valid link to reset your password";

export const buttonText = "Reset Password";

export const loadingText = "Resetting...";

export const passwordErrorId = "password-error";

export const confirmPasswordErrorId = "confirm-password-error";

export const passwordResetSuccessId = "password-reset-success";

export const passwordResetErrorId = "password-reset-error";

/**
 *
 */
const PasswordResetComponent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, action, isPending] = useActionState(
    async (_prevState: ResetPasswordState, formData: FormData) => {
      if (!token)
        return {
          error: invalidText,
        } as ResetPasswordState;
      return await resetPassword(formData, token);
    },
    null as ResetPasswordState,
  );

  return (
    <form className="w-full max-w-sm" action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  aria-describedby={`${passwordErrorId} password-desc`}
                  name="password"
                  id="password"
                  type="password"
                  required
                />
                <FieldDescription id="password-desc">
                  Must be at least 8 characters long
                </FieldDescription>

                <FieldError id={passwordErrorId}>
                  {state?.errors?.password}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm New Password
                </FieldLabel>
                <Input
                  aria-describedby={confirmPasswordErrorId}
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                />
                <FieldError id={confirmPasswordErrorId}>
                  {state?.errors?.confirmPassword}
                </FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            aria-describedby={`${passwordResetSuccessId} ${passwordResetErrorId}`}
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                {loadingText}
              </>
            ) : (
              <>{buttonText}</>
            )}
          </Button>
          <Success
            text={state?.successMessage ?? ""}
            id={passwordResetSuccessId}
          />
          <Error text={state?.error ?? ""} id={passwordResetErrorId} />
        </CardFooter>
      </Card>
    </form>
  );
};

export default PasswordResetComponent;
