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
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="p-3 border-b border-b-slate-200 dark:border-b-slate-700">
      <Container className="flex justify-between items-center" isMain={false}>
        {" "}
        <NavigationMenu>
          <NavigationMenuList>
            {" "}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href={routes.home}>Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
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
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
};

export default Header;
