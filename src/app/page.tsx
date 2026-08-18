import Container from "@/components/Container";
import { getRandomNumber } from "@/utils/helpers";

export default async function Home() {
  "use cache";

  return <Container>{getRandomNumber()}</Container>;
}
