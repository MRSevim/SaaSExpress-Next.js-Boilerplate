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
import { resetPassword, ResetPasswordState } from "../utils/apiCalls";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import { useSearchParams } from "next/navigation";
import Success from "@/components/Success";

const PasswordResetComponent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, action, isPending] = useActionState(
    async (_prevState: ResetPasswordState, formData: FormData) => {
      if (!token)
        return {
          error: "Please use a valid link to reset your password",
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
                <Input name="password" type="password" required />
                <FieldDescription>
                  Must be at least 8 characters long
                </FieldDescription>

                <FieldError>{state?.errors?.password}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Confirm New Password</FieldLabel>
                <Input name="confirm-password" type="password" required />
                <FieldError>{state?.errors?.confirmPassword}</FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Resetting...
              </>
            ) : (
              <>Reset</>
            )}
          </Button>
          {state?.successMessage && <Success text={state.successMessage} />}
          {state?.error && <Error text={state.error} />}
        </CardFooter>
      </Card>
    </form>
  );
};

export default PasswordResetComponent;
