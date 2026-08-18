"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { routes } from "@/utils/routes";
import Link from "next/link";
import ContinueWithGoogleButton from "./ContinueWithGoogleButton";
import { useActionState } from "react";
import { signUp } from "../utils/apiCalls";
import { SignUpState } from "../utils/types";
import Success from "@/components/Success";
import Error from "@/components/Error";
import { Spinner } from "@/components/ui/spinner";

export const signUpButtonText = "Sign up";
export const signUpLoadingButtonText = "Signing up...";

export const submitButtonErrorId = "sign-up-submit-error";
export const submitButtonSuccessId = "sign-up-submit-success";

export const nameErrorId = "sign-up-name-error";
export const emailErrorId = "sign-up-email-error";
export const passwordErrorId = "sign-up-password-error";
export const confirmPasswordErrorId = "sign-up-confirm-password-error";

const SignUpComponent = () => {
  const [state, action, isPending] = useActionState(
    async (_prevState: SignUpState, formData: FormData) => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const defaultValues = { name, email };
      const result = await signUp(formData);

      const hasFieldErrors = Object.values(result.errors ?? {}).some(Boolean);

      if (result.error || hasFieldErrors) {
        return { ...result, defaultValues };
      }
      return { ...result, defaultValues: { name: "", email: "" } };
    },
    null as SignUpState,
  );
  return (
    <form className="w-full max-w-sm" action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardAction className="leading-none">
            <Button className="p-0 h-0" variant="link" asChild>
              <Link href={routes.signIn}>Sign In</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input
                  aria-describedby={nameErrorId}
                  defaultValue={state?.defaultValues.name}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your username"
                  required
                />
                <FieldError id={nameErrorId}>{state?.errors?.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-describedby={emailErrorId}
                  id="email"
                  name="email"
                  defaultValue={state?.defaultValues.email}
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
                <FieldError id={emailErrorId}>
                  {state?.errors?.email}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  aria-describedby={`${passwordErrorId} password-desc`}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
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
                  Confirm password
                </FieldLabel>
                <Input
                  aria-describedby={confirmPasswordErrorId}
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="••••••••"
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
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-describedby={`${submitButtonErrorId} ${submitButtonSuccessId}`}
          >
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                {signUpLoadingButtonText}
              </>
            ) : (
              <>{signUpButtonText}</>
            )}
          </Button>
          <Success
            id={submitButtonSuccessId}
            text={state?.successMessage ?? ""}
          />
          <Error id={submitButtonErrorId} text={state?.error ?? ""} />
          or
          <ContinueWithGoogleButton />
        </CardFooter>
      </Card>
    </form>
  );
};

export default SignUpComponent;
