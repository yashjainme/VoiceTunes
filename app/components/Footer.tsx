import { FC } from "react";
import Link from "next/link";

const Footer: FC = () => {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800">
      <p className="text-xs text-gray-400">© 2024 Votetunes. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-purple-400" href="/terms">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-purple-400" href="/privacy">
          Privacy
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;