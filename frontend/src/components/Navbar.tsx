"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setUser({}); // User is logged in
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-800 shadow-sm h-14 flex items-center px-6 fixed top-0 left-0 z-50 border-b border-gray-200 dark:border-slate-700">
      <div className="flex justify-between w-full">
        <Link href="/" className="text-xl font-bold text-rose-600 dark:text-rose-400">
          EaseeVocab
        </Link>

        <div className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium items-center">
          <Link href="/learn" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Learn
          </Link>
          <Link href="/crossword" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Crossword
          </Link>

          {/* Login / Logout */}
          {!user ? (
            <Link
              href="/login"
              className="bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 px-4 py-1 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-colors"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 px-3 py-1 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
