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
      <Container className="flex justify-end gap-2 items-center" isMain={false}>
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
            <ThemeToggle />
            <UserMenu />
          </NavigationMenuList>
        </NavigationMenu>
      </Container>
    </header>
  );
};

export default Header;
