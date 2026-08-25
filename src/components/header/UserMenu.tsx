"use client";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/features/auth/utils/serverActions";
import { use, useState } from "react";
import { User } from "@/features/auth/utils/types";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";
import { IterationCw } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";

/**
 * Logged in user's menu
 */
const UserMenu = () => {
  const userPromise = useUserPromiseContext();
  const user = use(userPromise);

  return (
    <>
      {user ? (
        <div className="flex gap-2">
          <div className="rounded-md w-20" />
          <Dropdown user={user} />
        </div>
      ) : (
        <>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href={routes.signIn}>Sign In</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Button variant="outline">
                <Link href={routes.signUp}>Sign Up</Link>
              </Button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </>
      )}
    </>
  );
};

const Dropdown = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-md w-20"
          aria-label={`User menu for ${user.name}`}
        >
          <Avatar>
            <AvatarImage
              src={user.image || undefined}
              alt={`${user.name}'s avatar`}
            />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          {open ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-center">
          {" "}
          Account of <p>{user.name}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={routes.profile}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogoutButton = () => {
  return (
    <DropdownMenuItem
      className="text-red-800 dark:text-red-400"
      onClick={async () => {
        const { error } = await signOut();
        if (error) {
          toast.error(error);
        }
      }}
    >
      Logout
      <LogOut className="text-inherit" />
    </DropdownMenuItem>
  );
};

export const HeaderButtonError = catchError((_props, { retry }: ErrorInfo) => {
  return (
    <Button variant="destructive" onClick={() => retry()}>
      <IterationCw />
      Try again
    </Button>
  );
});

export default UserMenu;
