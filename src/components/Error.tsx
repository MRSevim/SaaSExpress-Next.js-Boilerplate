import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

/**
 * Error alert displayer
 */
const Error = ({ text, id }: { text: string; id?: string }) => {
  return (
    <div aria-live="polite" id={id} className="w-full">
      {text && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>An error occurred!</AlertTitle>
          <AlertDescription>{text}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Error;
