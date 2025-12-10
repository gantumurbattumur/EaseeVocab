"use client";

import Sidebar from "@/components/Sidebar";

export default function ConnectionPage() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-800">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-600">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Connection
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Coming soon! Connect related words in this puzzle game.
            </p>
            <div className="text-6xl mb-6">🔗</div>
            <p className="text-gray-500 dark:text-gray-400">
              This feature is under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

