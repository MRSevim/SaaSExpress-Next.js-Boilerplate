import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signInWithGoogle } from "../utils/apiCalls";
import Error from "@/components/Error";

const ContinueWithGoogleButton = () => {
  const [error, setError] = useState("");
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={async () => {
          const { error } = await signInWithGoogle();
          if (error) setError(error);
        }}
      >
        Continue with Google
      </Button>
      {error && <Error text={error} />}
    </>
  );
};

export default ContinueWithGoogleButton;
