"use client"; // Error boundaries must be Client Components

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="text-center">
      <Item
        variant="muted"
        className="max-w-md flex flex-col gap-6 p-6 border-2 border-red-500"
      >
        <ItemMedia>
          <CircleAlert className="size-12 text-red-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="flex flex-col gap-2">
            <p className="text-4xl font-bold">Something went wrong!</p>
            <p className="text-base text-muted-foreground">
              {error.message || "Unknown error occurred!"}
            </p>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button onClick={() => reset()}>Try Again.</Button>
        </ItemActions>
      </Item>
    </Container>
  );
}
