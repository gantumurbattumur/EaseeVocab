"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface WordHistoryItem {
  word: string;
  translation: string;
  definition: string;
  language: string;
  date: string;
}

export default function WordHistoryPage() {
  const [history, setHistory] = useState<WordHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load word history from localStorage
    const stored = localStorage.getItem("word_history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (e) {
        console.error("Error parsing word history:", e);
      }
    }
    setLoading(false);
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all word history?")) {
      localStorage.removeItem("word_history");
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Loading word history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Word History
              </h1>
              <p className="text-gray-600">
                All the words you've memorized
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No words memorized yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start learning with flashcards to build your word history!
              </p>
              <a
                href="/learn"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Learning →
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-blue-600">
                          {item.translation}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase">
                          {item.language}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 font-semibold mb-1">
                      {item.word}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.definition}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

