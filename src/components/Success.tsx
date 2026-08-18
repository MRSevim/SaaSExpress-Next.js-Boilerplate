import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

/**
 *
 */
const Success = ({ text, id }: { id?: string; text: string }) => {
  return (
    <div aria-live="polite" id={id} className="w-full">
      {text && (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Successful Action</AlertTitle>
          <AlertDescription>{text}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Success;
