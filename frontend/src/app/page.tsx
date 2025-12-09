"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace("/dashboard");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-800">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4 text-gray-900 dark:text-gray-100">⟳</div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
