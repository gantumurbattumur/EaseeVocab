"use client";

import { api } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api("/auth/me").then(setUser);
  }, []);

  if (!user) return <ProtectedPage>Loading...</ProtectedPage>;

  return (
    <ProtectedPage>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>

        <div className="mt-6 space-y-4">
          <a href="/learn" className="block p-4 bg-blue-600 text-white rounded">
            Start Today's Words →
          </a>

          <a href="/crossword" className="block p-4 bg-green-600 text-white rounded">
            Crossword Challenge →
          </a>
        </div>
      </div>
    </ProtectedPage>
  );
}
