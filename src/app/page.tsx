"use client";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { temporaryServerError } from "@/utils/temporaryServerAction";
import { captureException } from "@sentry/nextjs";

export default function Home() {
  return (
    <Container className="flex flex-col items-center justify-center gap-4">
      <Button
        variant="outline"
        data-sentry-unmask
        data-sentry-component="Homepage-Client-Error-Button"
        onClick={() => {
          captureException(new Error("Homepage Client Error"));
        }}
      >
        raise client error
      </Button>
      <Button
        data-sentry-unmask
        data-sentry-component="Homepage-Server-Error-Button"
        onClick={() => {
          temporaryServerError();
        }}
      >
        raise server error
      </Button>
    </Container>
  );
}
