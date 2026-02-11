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

const Header = () => {
  return (
    <header className="p-3 border-b border-b-slate-200 dark:border-b-slate-700">
      <Container className="flex gap-2" isMain={false}>
        {" "}
        <NavigationMenu className="max-w-full w-full">
          <NavigationMenuList className="justify-between">
            {" "}
            <NavigationMenuItem className="flex items-center gap-2">
              <h1 className="p-2">SaaSExpress</h1>
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
