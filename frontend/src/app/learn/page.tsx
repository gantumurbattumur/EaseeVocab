"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function LearnPage() {
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    api("/words/daily", { method: "POST", body: JSON.stringify({ level: "a1", limit: 10 }) })
      .then(data => setWords(data.words));
  }, []);

  return (
    <ProtectedPage>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Today's Words</h1>

        <ul className="space-y-4">
          {words.map((w) => (
            <li key={w.id} className="p-4 border rounded">
              <div className="font-bold">{w.word}</div>
              <div>{w.definition}</div>
              <div className="text-sm text-gray-500">
                {w.translation_es} / {w.translation_fr}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedPage>
  );
}
