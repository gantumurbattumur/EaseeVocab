"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { api } from "@/lib/api";
import Flashcards from "@/components/Flashcards";

export default function LearnPage() {
  const [words, setWords] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // STEP 1 — current user
        const userInfo = await api("/auth/me");
        setUser(userInfo);

        // STEP 2 — fetch daily batch
        const data = await api("/words/daily", {
          method: "POST",
          body: JSON.stringify({
            user_id: userInfo.id,
            level: "a1",
            limit: 10,
          }),
        });

        setWords(data.words || []);
      } catch (err) {
        console.error("Error loading daily words:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ProtectedPage>
        <div className="p-6">Loading today's words...</div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen flex justify-center items-center p-4">
        <Flashcards words={words} />
      </div>
    </ProtectedPage>
  );
}
