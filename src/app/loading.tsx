import Container from "@/components/Container";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <Container>
      <Item variant="muted">
        <ItemMedia>
          <Spinner className="size-10" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Loading...</ItemTitle>
        </ItemContent>
      </Item>
    </Container>
  );
}
