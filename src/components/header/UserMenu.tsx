"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { Button, buttonVariants } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { signOut } from "@/features/auth/utils/serverActions";
import { use, useState } from "react";
import { User } from "@/features/auth/utils/types";
import { useUserPromiseContext } from "@/features/auth/utils/contexts/UserPromiseContext";
import { IterationCw } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";
import { getUserMenuAriaLabel } from "./UserMenu.utils";

/**
 * Logged in user's menu
 */
const UserMenu = () => {
  const userPromise = useUserPromiseContext();
  const user = use(userPromise);

  return (
    <>
      {user ? (
        <Dropdown user={user} />
      ) : (
        <>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                <Link className="h-9" href={routes.signIn}>
                  Sign In
                </Link>
              }
              className={navigationMenuTriggerStyle()}
            />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                <Link
                  href={routes.signUp}
                  className={`${buttonVariants({ variant: "outline" })} h-9`}
                >
                  Sign Up
                </Link>
              }
            />
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
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="rounded-md w-20 h-9"
            aria-label={getUserMenuAriaLabel(user.name)}
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
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-center">
            {" "}
            Account of <p>{user.name}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <Link href={routes.profile} className="w-full cursor-pointer">
                Profile
              </Link>
            }
          ></DropdownMenuItem>

          <LogoutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogoutButton = () => {
  return (
    <DropdownMenuItem
      className="text-red-800 dark:text-red-400 cursor-pointer"
      onClick={async () => {
        const { error } = await signOut();
        if (error) {
          toast.add({
            type: "error",
            description: error,
          });
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
