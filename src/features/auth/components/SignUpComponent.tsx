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
import { signUp, SignUpState } from "../utils/apiCalls";
import Success from "@/components/Success";
import Error from "@/components/Error";
import { Spinner } from "@/components/ui/spinner";

const SignUpComponent = () => {
  const [state, action, isPending] = useActionState(
    signUp,
    null as SignUpState,
  );
  return (
    <form className="w-full max-w-sm" action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardAction>
            <Button variant="link" asChild>
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
                  defaultValue={state?.defaultValues.name}
                  name="name"
                  type="text"
                  placeholder="Your username"
                  required
                />
                <FieldError>{state?.errors?.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  name="email"
                  defaultValue={state?.defaultValues.email}
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
                <FieldError>{state?.errors?.email}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
                <FieldDescription>
                  Must be at least 8 characters long
                </FieldDescription>

                <FieldError>{state?.errors?.password}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm password
                </FieldLabel>
                <Input
                  name="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
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
                Signing up...
              </>
            ) : (
              <>Sign up</>
            )}
          </Button>
          {state?.successMessage && <Success text={state.successMessage} />}
          {state?.error && <Error text={state.error} />}
          or
          <ContinueWithGoogleButton />
        </CardFooter>
      </Card>
    </form>
  );
};

export default SignUpComponent;
