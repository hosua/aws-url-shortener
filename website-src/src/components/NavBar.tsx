import { Link } from "react-router-dom";
import ThemeSwitcher from "@components/ThemeSwitcher";
import { Button } from "@components/ui/button";

export const NavBar = () => {
  return (
    <nav className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="font-semibold h-9 inline-flex items-center -mt-1.25"
        >
          hoswoo.xyz
        </Link>
        <Button variant="ghost" asChild>
          <Link to="/">URL Shortener</Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default NavBar;
