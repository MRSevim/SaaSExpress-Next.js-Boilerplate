import Container from "@/components/Container";
import { getRandomNumber } from "@/utils/helpers";

export default async function Home() {
  "use cache";
  console.log("homepage rendered");
  return <Container>{getRandomNumber()}</Container>;
}
