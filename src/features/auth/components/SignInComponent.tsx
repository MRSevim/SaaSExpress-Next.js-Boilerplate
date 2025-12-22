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
import { routes } from "@/utils/routes";
import Link from "next/link";
import ContinueWithGoogleButton from "./ContinueWithGoogleButton";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

const SignInComponent = () => {
  return (
    <form className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardAction>
            <Button variant="link" asChild>
              <Link href={routes.signUp}>Sign Up</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">
                  Password
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </FieldLabel>
              </Field>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={() => {
              console.log("first");
            }}
          >
            Sign in
          </Button>
          or
          <ContinueWithGoogleButton />
        </CardFooter>
      </Card>
    </form>
  );
};

export default SignInComponent;
