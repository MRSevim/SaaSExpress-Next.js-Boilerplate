"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
} from "../utils/apiCalls";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";

export const deleteButtonText = "Delete Account";

export const accountDeletionSuccessMessage =
  "Account deletion email has been sent to your email address";

export const passwordResetSuccessMessage =
  "Password reset email has been sent to your email address";

export const resetPasswordButtonText = "Reset password";

const ProfilePage = () => {
  const userPromise = useUserPromiseContext();
  const user = use(userPromise);

  if (!user) return;
  return (
    <div className="flex flex-col gap-3 items-center">
      <Avatar size="lg">
        <AvatarImage
          src={user.image || undefined}
          alt={`${user.name}'s avatar`}
        />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <DeleteButton />
      <ResetButton email={user.email} />
    </div>
  );
};

export default ProfilePage;

const DeleteButton = () => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      variant="destructive"
      onClick={async () => {
        setLoading(true);
        const { error } = await deleteUser();
        if (error) {
          toast.error(error);
        } else toast.success(accountDeletionSuccessMessage);
        setLoading(false);
      }}
    >
      {deleteButtonText}
    </Button>
  );
};

const ResetButton = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(false);
  const [checkProviderLoading, setCheckProviderLoading] = useState(true);
  const [isCredentialsProvider, setIsCredentialsProvider] = useState(false);
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    const check = async () => {
      const { error, isTrue } = await checkCredentialsProvider();
      setCheckProviderLoading(false);
      if (error) {
        setCheckError(error);
      } else setIsCredentialsProvider(isTrue);
    };
    check();
  }, []);
  return (
    <>
      {checkProviderLoading && <Spinner className="size-8" />}
      {checkError && <Error text={checkError} />}
      {isCredentialsProvider && !checkError && (
        <Button
          disabled={loading}
          variant="secondary"
          onClick={async () => {
            setLoading(true);
            const { error } = await requestPasswordReset(email);
            if (error) {
              toast.error(error);
            } else toast.success(passwordResetSuccessMessage);
            setLoading(false);
          }}
        >
          {resetPasswordButtonText}
        </Button>
      )}
    </>
  );
};
