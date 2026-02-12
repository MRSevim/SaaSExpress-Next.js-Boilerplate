import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signInWithGoogle } from "@/features/auth/utils/apiCallsClient";
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
        <svg viewBox="0 0 48 48">
          <path
            fill="currentColor"
            d="M43.6 20.5H42V20H24v8h11.3C33.5 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.6l6-6C33.9 6.5 29.2 4.5 24 4.5 12.6 4.5 3.5 13.6 3.5 25S12.6 45.5 24 45.5 44.5 36.4 44.5 25c0-1.5-.2-3-.9-4.5z"
          />
        </svg>

        <>Sign in With Google</>
      </Button>
      {error && <Error text={error} />}
    </>
  );
};

export default ContinueWithGoogleButton;
