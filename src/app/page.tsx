import Container from "@/components/Container";

export default async function Home() {
  return <Container>{getRandom()}</Container>;
}

const getRandom = async () => {
  "use cache";
  return (Math.random() * 100).toFixed(2);
};
