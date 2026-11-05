"use client";
import Error from "@/components/Error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { ContactFormState } from "../utils/types";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { contactUs } from "../utils/serverActions";
import Success from "@/components/Success";

export const contactErrorId = "contact-error";

export const contactSuccessId = "contact-success";

export const contactButtonText = "Submit";

export const contactLoadingButtonText = "Submitting...";

export const nameErrorId = "contact-name-error";

export const emailErrorId = "contact-email-error";

export const messageErrorId = "contact-message-error";

/** *Contact form for the SaaS  **/
export const ContactForm = () => {
  const [state, action, isPending] = useActionState(
    contactUs,
    null as ContactFormState,
  );

  return (
    <form className="w-full max-w-sm" action={action}>
      <Card>
        {" "}
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <div className="flex gap-2 items-center justify-between">
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                </div>
                <Input
                  aria-describedby={nameErrorId}
                  defaultValue={state?.defaultValues.name}
                  id="name"
                  name="name"
                  type="name"
                  required
                  placeholder="Your name"
                />
                <FieldError id={nameErrorId}>{state?.errors?.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-describedby={emailErrorId}
                  defaultValue={state?.defaultValues.email}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="youremail@example.com"
                  required
                />
                <FieldError id={emailErrorId}>
                  {state?.errors?.email}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <Textarea
                  aria-describedby={`${messageErrorId} message-desc`}
                  defaultValue={state?.defaultValues.message}
                  id="message"
                  name="message"
                  placeholder="Your message..."
                  required
                />
                <FieldDescription id="message-desc">
                  Must be at least 20 characters long
                </FieldDescription>
                <FieldError id={messageErrorId}>
                  {state?.errors?.message}
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
            aria-describedby={`${contactErrorId} ${contactSuccessId}`}
          >
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                {contactLoadingButtonText}
              </>
            ) : (
              <>{contactButtonText}</>
            )}
          </Button>
          <Error text={state?.error ?? ""} id={contactErrorId} />
          <Success id={contactSuccessId} text={state?.successMessage ?? ""} />
        </CardFooter>
      </Card>
    </form>
  );
};
