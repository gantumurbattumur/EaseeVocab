"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import GoogleLoginButton from "./GoogleLoginButton";

interface MenuItem {
  name: string;
  href: string;
  locked?: boolean;
  tooltip?: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 1000);

    // Auto-expand Puzzle menu if on crossword page
    if (pathname === "/crossword") {
      setExpandedMenus(new Set(["Puzzles"]));
    }

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  const menuItems: MenuItem[] = [
    {
      name: "📚 Learn",
      href: "/learn",
    },
    {
      name: "🧩 Puzzles",
      href: "#",
      children: [
        {
          name: "Crossword",
          href: "/crossword",
        },
        {
          name: "Wordle",
          href: "/games/wordle",
          locked: true,
          tooltip: "Coming soon",
        },
        {
          name: "Connection",
          href: "/games/connection",
          locked: true,
          tooltip: "Coming soon",
        },
      ],
    },
    {
      name: "📖 Word History",
      href: "/words/history",
    },
    {
      name: "📊 Stats",
      href: "/stats",
      locked: true,
      tooltip: "Coming soon",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/learn") {
      return pathname?.startsWith("/learn");
    }
    if (href === "/crossword") {
      return pathname === "/crossword";
    }
    if (href === "/words/history") {
      return pathname?.startsWith("/words/history");
    }
    return pathname === href;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.name);

    if (item.locked) {
      return (
        <div
          key={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-rose-500/70 dark:text-gray-400/70 cursor-not-allowed relative group ${
            level > 0 ? "ml-4" : ""
          }`}
        >
          <span className="flex-1 text-base">{item.name}</span>
          <span className="text-xs text-rose-400/50 dark:text-gray-500/50">🔒</span>
          {item.tooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
              {item.tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
    }

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-base ${
              active
                ? "bg-gradient-to-r from-rose-200/50 to-pink-200/50 dark:bg-gray-700/40 text-rose-800 dark:text-gray-100 shadow-md"
                : "text-rose-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-rose-100/50 hover:to-pink-100/50 dark:hover:bg-gray-700/30 hover:text-rose-900 dark:hover:text-gray-100"
            }`}
          >
            <span className="flex-1 text-left">{item.name}</span>
            <span className={`transform transition-transform text-rose-500 dark:text-gray-400 ${isExpanded ? "rotate-90" : ""}`}>
              ▶
            </span>
          </button>
          {isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-base ${
          active
            ? "bg-gradient-to-r from-rose-200/50 to-pink-200/50 dark:bg-gray-700/40 text-rose-800 dark:text-gray-100 shadow-md"
            : "text-rose-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-rose-100/50 hover:to-pink-100/50 dark:hover:bg-gray-700/30 hover:text-rose-900 dark:hover:text-gray-100"
        } ${level > 0 ? "ml-4" : ""}`}
      >
        <span className="flex-1">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-rose-400 to-pink-400 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:from-rose-500 hover:to-pink-500 dark:hover:bg-gray-600 transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-gradient-to-b dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 from-pink-100 via-rose-100 via-amber-100 to-yellow-100 
          h-screen fixed left-0 top-0 z-40 overflow-y-auto flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Logo */}
      <div className="p-4 border-b border-rose-200/50 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-md">
            <svg 
              className="w-6 h-6 stroke-white dark:stroke-gray-200" 
              fill="none" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-rose-700 dark:text-gray-100 font-bold text-xl">EaseeVocab</span>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-amber-200/50 dark:border-gray-700 space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-gray-700/50">
          <span className="text-base text-rose-700 dark:text-gray-300">🌓 Theme:</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 bg-gradient-to-r from-pink-200 to-rose-200 dark:bg-gray-600 text-rose-800 dark:text-gray-100 rounded-lg text-xs font-semibold hover:from-pink-300 hover:to-rose-300 dark:hover:bg-gray-500 transition-all"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col gap-2">
          {!isAuthenticated ? (
            <div className="px-4 py-2">
              <GoogleLoginButton />
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-amber-200 dark:bg-amber-600 text-slate-800 dark:text-gray-100 rounded-lg text-center font-semibold text-sm hover:bg-amber-300 dark:hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
            >
              🏠 Dashboard
            </Link>
          )}
        </div>

        {/* Support Links */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-rose-700 dark:text-gray-300">💬 Support:</span>
            <a 
              href="mailto:ganabattumur@gmail.com" 
              className="text-rose-600 dark:text-gray-400 hover:text-rose-800 dark:hover:text-gray-200 hover:underline ml-1"
            >
              Email
            </a>
          </div>
          <div>
            <span className="text-rose-700 dark:text-gray-300">🔗 GitHub:</span>
            <a 
              href="https://github.com/gantumurbattumur/easeevocab" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-rose-600 dark:text-gray-400 hover:text-rose-800 dark:hover:text-gray-200 hover:underline ml-1"
            >
              Repository
            </a>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
