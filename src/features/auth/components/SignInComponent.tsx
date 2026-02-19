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
import { useActionState } from "react";
import { signInWithEmailAndPassword } from "../utils/apiCalls";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUser } from "../lib/redux/slices/userSlice";
import { useRouter } from "next/navigation";

const SignInComponent = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [error, action, isPending] = useActionState(
    async (_prevState: string, formData: FormData) => {
      const { error, user } = await signInWithEmailAndPassword(formData);
      if (!error && user)
        dispatch(
          setUser({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name,
            image: user.image,
          }),
        );
      router.push(routes.home);

      return error;
    },
    "",
  );

  return (
    <form className="w-full max-w-sm" action={action}>
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
                  name="email"
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
              </Field>

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
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Signing in...
              </>
            ) : (
              <>Sign in</>
            )}
          </Button>
          {error && <Error text={error} />}
          or
          <ContinueWithGoogleButton />
        </CardFooter>
      </Card>
    </form>
  );
};

export default SignInComponent;
