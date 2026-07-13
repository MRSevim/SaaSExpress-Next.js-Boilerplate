import Container from "@/components/Container";

export default async function Home() {
  "use cache";
  console.log("homepage rendered");
  return <Container>{getRandom()}</Container>;
}

const getRandom = async () => {
  return (Math.random() * 100).toFixed(2);
};
