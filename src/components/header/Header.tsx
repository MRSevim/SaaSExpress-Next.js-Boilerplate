import ThemeToggle from "@/features/theme/components/ThemeToggle";
import Container from "../Container";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { env } from "@/utils/env";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Skeleton } from "../ui/skeleton";
import { getUser } from "@/features/auth/utils/serverHelpers";
import { buttonVariants } from "../ui/button";
import Dropdown, { HeaderButtonError } from "./Dropdown";

/**
 * Header with links and menus
 */
const Header = () => {
  return (
    <header className="p-3 border-b border-b-slate-200 dark:border-b-slate-700">
      <Container className="flex gap-2" isMain={false}>
        {" "}
        <NavigationMenu className="max-w-full w-full">
          <NavigationMenuList className="flex-col sm:flex-row justify-between gap-2">
            {" "}
            <NavigationMenuItem className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="px-4 py-2 font-heading">{env.APP_NAME}</h1>
              <NavigationMenuLink
                render={<Link href={routes.home}>Home</Link>}
                className={navigationMenuTriggerStyle()}
              />
            </NavigationMenuItem>
            <div className="flex items-center gap-2">
              <HeaderButtonError>
                <Suspense fallback={<SmallSkeleton />}>
                  <ThemeWrapper />
                </Suspense>
              </HeaderButtonError>
              <HeaderButtonError>
                <Suspense
                  fallback={
                    <div className="flex gap-2">
                      <SmallSkeleton />
                      <SmallSkeleton />
                    </div>
                  }
                >
                  <UserMenu />
                </Suspense>
              </HeaderButtonError>
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </Container>
    </header>
  );
};

const ThemeWrapper = async () => {
  const cookieStore = await cookies();

  const initialTheme = cookieStore.get("theme")?.value;
  return <ThemeToggle initialTheme={initialTheme} />;
};

const UserMenu = async () => {
  const user = await getUser();

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

const SmallSkeleton = () => <Skeleton className="h-9 rounded-md w-20" />;

export default Header;
