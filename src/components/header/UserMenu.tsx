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
import { signOut } from "@/features/auth/utils/apiCallsClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { authClient } from "@/features/auth/lib/authClient";
import { User } from "@/features/auth/lib/auth";

const UserMenu = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <Button variant="outline" asChild>
        <Skeleton className="w-20" />
      </Button>
    );
  }
  return (
    <>
      {user ? (
        <Dropdown user={user} />
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
        <Button variant="outline">
          {" "}
          <Avatar>
            <AvatarImage
              src={user.image || undefined}
              alt={`${user.name}'s avatar`}
            />
            <AvatarFallback>Av</AvatarFallback>
          </Avatar>
          {open ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {" "}
          Account of <p>{user.name}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogoutButton = () => {
  const router = useRouter();
  return (
    <DropdownMenuItem
      className="text-red-800 dark:text-red-400"
      onClick={async () => {
        const { error } = await signOut();
        if (error) {
          toast.error(error);
        } else {
          router.push(routes.signIn);
        }
      }}
    >
      Logout
      <LogOut className="text-inherit" />
    </DropdownMenuItem>
  );
};

export default UserMenu;
