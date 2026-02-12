import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const Success = ({ text }: { text: string }) => {
  return (
    <Alert>
      <CheckCircle2Icon />
      <AlertTitle>Successful Action</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
};

export default Success;
