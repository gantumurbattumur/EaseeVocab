"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";

interface WordHistoryItem {
  word: string;
  translation: string;
  definition: string;
  language: string;
  languageCode?: string; // Optional: for backward compatibility
  date: string;
}

interface CachedMnemonicData {
  word: string;
  definition: string;
  language: string;
  mnemonic_word?: string;
  mnemonic_sentence?: string;
  image_base64?: string;
  found: boolean;
}

interface WordHistoryWithCache extends WordHistoryItem {
  mnemonic_word?: string;
  mnemonic_sentence?: string;
  image_url?: string;
  hasCache: boolean;
}

export default function WordHistoryPage() {
  const [history, setHistory] = useState<WordHistoryItem[]>([]);
  const [historyWithCache, setHistoryWithCache] = useState<WordHistoryWithCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCache, setLoadingCache] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordHistoryWithCache | null>(null);

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

  useEffect(() => {
    // Fetch cached mnemonics for all words in history
    if (history.length === 0) {
      setHistoryWithCache([]);
      return;
    }

    const fetchCachedMnemonics = async () => {
      setLoadingCache(true);
      try {
        // Prepare request payload
        const wordsToLookup = history.map((item) => ({
          word: item.translation,
          definition: item.definition,
          language: item.languageCode || (item.language === "Spanish" ? "es" : "fr"),
        }));

        const response = await api("/mnemonic/get-cached", {
          method: "POST",
          body: JSON.stringify({
            words: wordsToLookup,
          }),
        });

        // Merge cached data with history
        const merged = history.map((item, index) => {
          const cached = response.results[index];
          return {
            ...item,
            mnemonic_word: cached?.mnemonic_word,
            mnemonic_sentence: cached?.mnemonic_sentence,
            image_url: cached?.image_base64
              ? `data:image/png;base64,${cached.image_base64}`
              : undefined,
            hasCache: cached?.found || false,
          };
        });

        setHistoryWithCache(merged);
      } catch (err) {
        console.error("Error fetching cached mnemonics:", err);
        // Fallback to history without cache
        setHistoryWithCache(
          history.map((item) => ({
            ...item,
            hasCache: false,
          }))
        );
      } finally {
        setLoadingCache(false);
      }
    };

    fetchCachedMnemonics();
  }, [history]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all word history?")) {
      localStorage.removeItem("word_history");
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-white dark:bg-slate-800">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading word history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-800">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Word History
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                All the words you've memorized
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-colors font-semibold"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-600">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                No words memorized yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start learning with flashcards to build your word history!
              </p>
              <a
                href="/learn"
                className="inline-block px-6 py-3 bg-pink-100 dark:bg-pink-200 text-gray-900 dark:text-gray-900 rounded-xl hover:bg-pink-200 dark:hover:bg-pink-300 transition-colors font-semibold"
              >
                Start Learning
              </a>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-600">
              {loadingCache && (
                <div className="mb-4 text-center text-gray-600 dark:text-gray-300 text-sm">
                  Loading cached images...
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyWithCache.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedWord(item)}
                    className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                  >
                    {/* Image */}
                    {item.image_url && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img
                          src={item.image_url}
                          alt={`Mnemonic for ${item.translation}`}
                          className="w-full h-32 object-contain"
                        />
                      </div>
                    )}

                    {/* Word Info */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {item.translation}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {item.language}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">
                      {item.word}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {item.definition}
                    </p>

                    {/* Sound-a-like word */}
                    {item.mnemonic_word && (
                      <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                          <span className="font-semibold">Sound-a-like:</span>
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          "{item.mnemonic_word}"
                        </p>
                        {item.mnemonic_sentence && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                            {item.mnemonic_sentence}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zoom Modal */}
          {selectedWord && (
            <div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedWord(null)}
            >
              <div
                className="bg-white dark:bg-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Close Button */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedWord.translation}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {selectedWord.language}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedWord(null)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {/* Large Image */}
                  {selectedWord.image_url && (
                    <div className="mb-6 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <img
                        src={selectedWord.image_url}
                        alt={`Mnemonic for ${selectedWord.translation}`}
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  )}

                  {/* Word Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {selectedWord.word}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedWord.definition}
                      </p>
                    </div>

                    {/* Sound-a-like word */}
                    {selectedWord.mnemonic_word && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <span className="font-semibold">Sound-a-like:</span>
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          "{selectedWord.mnemonic_word}"
                        </p>
                        {selectedWord.mnemonic_sentence && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            {selectedWord.mnemonic_sentence}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Memorized on {new Date(selectedWord.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

