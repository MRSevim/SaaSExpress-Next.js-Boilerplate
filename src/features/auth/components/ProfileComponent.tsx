"use client";
import { Button } from "@/components/ui/button";
import { deleteUser, requestPasswordReset } from "../utils/serverActions";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
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
const Profile = ({
  user,
  isCredentialsProvider,
}: {
  user: User;
  isCredentialsProvider: boolean;
}) => {
  return (
    <div className="flex flex-col gap-3 items-center">
      <Avatar size="lg">
        {user.image && (
          <AvatarImage src={user.image} alt={`${user.name}'s avatar`} />
        )}
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <DeleteButton />
      <ResetButton isCredentialsProvider={isCredentialsProvider} />
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

const ResetButton = ({
  isCredentialsProvider,
}: {
  isCredentialsProvider: boolean;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {isCredentialsProvider && (
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
