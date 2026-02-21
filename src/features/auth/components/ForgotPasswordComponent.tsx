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

const ForgotPasswordComponent = () => {
  const [state, action, isPending] = useActionState(
    async (
      _prevState: { error: string; successMessage: string },
      formData: FormData,
    ) => {
      const { error } = await requestPasswordReset(
        formData.get("email") as string,
      );
      return {
        error,
        successMessage: !error
          ? "Password reset email has been sent to your email adress"
          : "",
      };
    },
    { error: "", successMessage: "" },
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
                Requesting...
              </>
            ) : (
              <>Request Password Reset Link</>
            )}
          </Button>
          {state?.error && <Error text={state.error} />}
          {state?.successMessage && <Success text={state.successMessage} />}
        </CardFooter>
      </Card>
    </form>
  );
};

export default ForgotPasswordComponent;
