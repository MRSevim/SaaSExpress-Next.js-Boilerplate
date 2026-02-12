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
import UserMenu from "./UserMenu";
import { env } from "@/utils/env";

const Header = () => {
  return (
    <header className="p-3 border-b border-b-slate-200 dark:border-b-slate-700">
      <Container className="flex gap-2" isMain={false}>
        {" "}
        <NavigationMenu className="max-w-full w-full">
          <NavigationMenuList className="flex-col sm:flex-row justify-between gap-2">
            {" "}
            <NavigationMenuItem className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="px-4 py-2">{env.APP_NAME}</h1>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href={routes.home}>Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </Container>
    </header>
  );
};

export default Header;
