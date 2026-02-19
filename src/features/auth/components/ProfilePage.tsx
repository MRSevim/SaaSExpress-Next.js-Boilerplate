"use client";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUser } from "../lib/redux/selectors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "../utils/apiCalls";

const ProfilePage = () => {
  const user = useAppSelector(selectUser);
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
      <Button variant="secondary" onClick={requestPasswordReset}>
        Reset password
      </Button>
    </div>
  );
};

export default ProfilePage;
