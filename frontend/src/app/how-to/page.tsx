"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HowToPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard (how-to content is now in dashboard)
    router.replace("/dashboard");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        <p className="text-slate-600 dark:text-gray-300">Redirecting...</p>
      </div>
    </div>
  );
}
