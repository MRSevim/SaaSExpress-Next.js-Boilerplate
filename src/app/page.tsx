import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TableCaption,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Check, List, SquareDashedText } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Task Management",
    description: "Create, edit, and delete tasks with ease.",
    icon: List,
  },
  {
    title: "Task Descriptions",
    description: "Add detailed descriptions to your tasks.",
    icon: SquareDashedText,
  },
  {
    title: "Done-undone Checks",
    description: "Mark tasks as done or undone with ease.",
    icon: Check,
  },
];

const pricing = [
  {
    feature: "Task Management",
    status: "Free",
  },
  {
    feature: "Task Descriptions",
    status: "Subscription",
  },
  {
    feature: "Done-undone Checks",
    status: "Free",
  },
];

export default async function Home() {
  return (
    <div className="flex-1 bg-linear-to-bl from-secondary to-background">
      <Container className="flex flex-col">
        <div className="w-full flex flex-col-reverse lg:flex-row justify-center items-center gap-20 my-20">
          <div>
            <h1 className="text-5xl font-bold">To Do App</h1>
            <p className="text-xl text-muted-foreground mt-4">
              Create and manage your tasks efficiently...
            </p>
          </div>
          <Image
            loading="eager"
            className="rounded-full"
            src="/tick.jpg"
            width={300}
            height={300}
            alt="Tick sign"
          />
        </div>
        <div className="flex flex-col w-full ">
          <h2 className="text-3xl font-bold" id="features">
            Features
          </h2>
          <div className="w-full flex flex-col lg:flex-row flex-items-center gap-6 mt-6">
            {features.map((feature, index) => (
              <Card className="flex-1" key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {feature.title} <feature.icon />
                  </CardTitle>
                </CardHeader>
                <CardContent>{feature.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex items-center w-full mt-10">
          <Table className="mt-6 w-50 lg:w-100 m-auto">
            <TableCaption>Pricing Information of features</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.map((feature) => (
                <TableRow key={feature.feature}>
                  <TableCell className="font-medium">
                    {feature.feature}
                  </TableCell>
                  <TableCell className="text-right">{feature.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col w-full my-20">
          <h2 className="text-3xl font-bold" id="pricing">
            Pricing
          </h2>{" "}
          <Card className="mt-6 w-full">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                <p>
                  Get access to all premium features with our monthly
                  subscription.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-around items-center">
              3.99$/month or 30$/year{" "}
              <Button disabled size="lg">
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
