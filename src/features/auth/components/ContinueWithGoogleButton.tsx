import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signInWithGoogle } from "@/features/auth/utils/ClientActions";
import Error from "@/components/Error";

export const loadingText = "Redirecting...";

export const buttonText = "Sign in With Google";

export const googleSignInErrorId = "google-sign-in-error";

/**
 * Google login button
 */
const ContinueWithGoogleButton = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        aria-describedby={googleSignInErrorId}
        onClick={async () => {
          setError("");
          setIsLoading(true);
          const { error } = await signInWithGoogle();
          if (error) setError(error);
          setIsLoading(false);
        }}
      >
        <svg viewBox="0 0 48 48">
          <path
            fill="currentColor"
            d="M43.6 20.5H42V20H24v8h11.3C33.5 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.6l6-6C33.9 6.5 29.2 4.5 24 4.5 12.6 4.5 3.5 13.6 3.5 25S12.6 45.5 24 45.5 44.5 36.4 44.5 25c0-1.5-.2-3-.9-4.5z"
          />
        </svg>
        {isLoading ? loadingText : buttonText}
      </Button>

      <Error id={googleSignInErrorId} text={error} />
    </>
  );
};

export default ContinueWithGoogleButton;
