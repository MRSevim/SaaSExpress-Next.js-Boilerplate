import Link from "next/link";
import { CircleIcon } from "lucide-react";
import Container from "@/components/Container";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { routes } from "@/utils/routes";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="text-center">
      <Item
        variant="muted"
        className="max-w-md flex flex-col gap-6 p-4 text-center border-2 border-orange-500"
      >
        <ItemMedia>
          <CircleIcon className="size-12 text-orange-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold">Page Not Found</h1>
            <p className="text-base text-muted-foreground">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button asChild className="rounded-full">
            <Link href={routes.home}>Back to Home</Link>
          </Button>
        </ItemActions>
      </Item>
    </Container>
  );
}
