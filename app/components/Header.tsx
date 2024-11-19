"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { Music, ChevronDown } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./Button";
import Image from "next/image";

const Header: FC = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Wrapper div that includes both the fixed header and a spacer */}
      <div className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <header className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link 
            className="flex items-center justify-center group" 
            href="/"
          >
            <Music className="h-7 w-7 text-purple-500 transition-transform duration-300 group-hover:scale-110" />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
              Votetunes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-all duration-200 hover:scale-105"
                href={href}
              >
                {label}
              </Link>
            ))}

            {session ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="hover:bg-purple-500 hover:text-white transition-colors duration-200"
                >
                  Sign Out
                </Button>

                <div className="relative">
                  <div
                    onClick={handleToggleDropdown}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500 transition-all duration-200 group-hover:ring-purple-400">
                      <Image
                        src={session.user?.image || "/path/to/default/image.jpg"}
                        alt="User Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm animate-in fade-in slide-in-from-top-5 duration-200">
                      <div className="p-3">
                        <p className="text-sm text-gray-300 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => signIn()} 
                className="bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
              >
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden relative w-10 h-10 text-gray-300 flex items-center justify-center"
            onClick={handleToggleMenu}
          >
            <div className={`transform transition-all duration-300 ${
              menuOpen ? 'rotate-180 scale-105' : ''
            }`}>
              {menuOpen ? (
                <span className="text-2xl">×</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </div>
          </button>
        </header>

        {/* Mobile Navigation */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}>
          <div className="bg-gray-800/95 backdrop-blur-sm px-4 py-3 space-y-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                className="block text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors duration-200"
                href={href}
              >
                {label}
              </Link>
            ))}

            {session ? (
              <div className="space-y-3 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500">
                    <Image
                      src={session.user?.image || "/path/to/default/image.jpg"}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-300 truncate">{session.user?.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="w-full hover:bg-purple-500 hover:text-white transition-colors duration-200"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => signIn()} 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer div to prevent content from being hidden behind fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;