"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-800">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-3rem)]">
          <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-600">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/learn"
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

