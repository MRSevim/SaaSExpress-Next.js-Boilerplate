"use client";
import { Button } from "@/components/ui/button";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
} from "../utils/serverActions";
import { toast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";
import {
  passwordResetEmailSuccessMessage,
  requestPasswordResetButtonText,
  accountDeletionEmailSuccessMessage,
  deleteAccountButtonText,
} from "../utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "../utils/types";

/**
 * Profile of the logged in user
 */
const Profile = ({ user }: { user?: User }) => {
  if (!user) return;
  return (
    <div className="flex flex-col gap-3 items-center">
      <Avatar size="lg">
        {user.image && (
          <AvatarImage src={user.image} alt={`${user.name}'s avatar`} />
        )}
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <DeleteButton />
      <ResetButton />
    </div>
  );
};

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
          toast.add({ type: "error", description: error });
        } else
          toast.add({
            type: "success",
            description: accountDeletionEmailSuccessMessage,
          });
        setLoading(false);
      }}
    >
      {deleteAccountButtonText}
    </Button>
  );
};

const ResetButton = () => {
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
      <Error text={checkError} />
      {isCredentialsProvider && !checkError && (
        <Button
          disabled={loading}
          variant="secondary"
          onClick={async () => {
            setLoading(true);
            const { error } = await requestPasswordReset();
            if (error) {
              toast.add({ type: "error", description: error });
            } else
              toast.add({
                type: "success",
                description: passwordResetEmailSuccessMessage,
              });
            setLoading(false);
          }}
        >
          {requestPasswordResetButtonText}
        </Button>
      )}
    </>
  );
};

export default Profile;
