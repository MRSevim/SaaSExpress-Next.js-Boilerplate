import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const Error = ({ text }: { text: string }) => {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>An error occurred!</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
};

export default Error;
