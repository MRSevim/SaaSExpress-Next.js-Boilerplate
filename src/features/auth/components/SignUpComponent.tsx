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
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { routes } from "@/utils/routes";
import Link from "next/link";
import ContinueWithGoogleButton from "./ContinueWithGoogleButton";

const SignUpComponent = () => {
  return (
    <form className="w-full max-w-sm">
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
                  id="name"
                  type="text"
                  placeholder="Your username"
                  required
                />
              </Field>
            </FieldGroup>

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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Sign up
          </Button>
          or
          <ContinueWithGoogleButton />
        </CardFooter>
      </Card>
    </form>
  );
};

export default SignUpComponent;
