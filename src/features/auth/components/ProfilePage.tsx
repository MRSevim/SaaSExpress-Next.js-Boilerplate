"use client";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUser } from "../lib/redux/selectors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  checkCredentialsProvider,
  deleteUser,
  requestPasswordReset,
} from "../utils/apiCalls";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/Error";

const ProfilePage = () => {
  const user = useAppSelector(selectUser);
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
      {checkProviderLoading && <Spinner className="size-8" />}
      {checkError && <Error text={checkError} />}
      {isCredentialsProvider && !checkError && (
        <Button
          variant="secondary"
          onClick={async () => {
            const { error } = await requestPasswordReset(user.email);
            if (error) {
              toast.error(error);
            } else
              toast.success(
                "Password reset email has been sent to your email adress",
              );
          }}
        >
          Reset password
        </Button>
      )}
      <Button
        variant="destructive"
        onClick={async () => {
          const { error } = await deleteUser();
          if (error) {
            toast.error(error);
          } else
            toast.success(
              "Account Deletion email has been sent to your email adress",
            );
        }}
      >
        Delete Account
      </Button>
    </div>
  );
};

export default ProfilePage;
