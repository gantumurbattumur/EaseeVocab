"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Flashcards, { FlashcardNavigation } from "@/components/Flashcards";
import Sidebar from "@/components/Sidebar";

type Language = "es" | "fr" | null;

function LearnPageContent() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordsReady, setWordsReady] = useState(false);
  const generatingRef = useRef(false);
  const initialWordsRef = useRef<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get language from URL params or localStorage
    const langParam = searchParams.get("lang") as Language;
    const savedLang = localStorage.getItem("learning_language") as Language;
    const lang = langParam || (savedLang && (savedLang === "es" || savedLang === "fr") ? savedLang : null);
    
    if (lang) {
      setSelectedLanguage(lang);
      localStorage.setItem("learning_language", lang);
    } else {
      // No language selected, redirect to dashboard
      router.push("/dashboard");
      return;
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!selectedLanguage) return;

    const loadData = async () => {
      try {
        const data = await api("/words/daily", {
          method: "POST"
        });

        // backend returns DailyWordsResponse with { date, count, words }
        // Extract the words array from the response
        const wordsData = data?.words || [];
        setWords(wordsData);
        
        // Store initial words for reference
        initialWordsRef.current = wordsData;
        
        // Store words in localStorage for crossword to use
        localStorage.setItem("flashcard_words", JSON.stringify(wordsData));
        
        setWordsReady(true);
      } catch (err) {
        console.error("Error loading daily words:", err);
        setWords([]);
        setWordsReady(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLanguage]);

  // Images are generated on-demand when user clicks "Generate Sound-a-like" button
  // This provides better UX - no waiting, no storage quota issues

  if (!selectedLanguage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a language first</p>
          <a
            href="/dashboard"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading today's words...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Flashcards Section */}
          <div className="flex justify-center items-start gap-8">
            {/* Left: Flashcards */}
            <div className="flex-shrink-0">
              <Flashcards 
                words={words} 
                language={selectedLanguage} 
                onIndexChange={setCurrentIndex}
                currentIndex={currentIndex}
                onIndexSet={setCurrentIndex}
              />
            </div>

            {/* Right: Info Panel */}
            <div className="flex-1 max-w-sm">
              <div className="bg-white rounded-xl shadow-lg p-5 space-y-5 flex flex-col h-full">
                {/* Progress Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Today's Progress
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {words.length > 0 ? currentIndex + 1 : 0} / {words.length}
                    </span>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>📖</span> How to Use
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>
                        Click the card to flip and see the sound-a-like word
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>
                        Click "Generate Sound-a-like Word" to create a memory aid
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>
                        Use the sound-a-like word and image to remember
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Language Info */}
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Learning:</span>{" "}
                    {selectedLanguage === "es" ? "Spanish → English" : "French → English"}
                  </p>
                  <p className="mt-1">
                    The flashcard shows the{" "}
                    {selectedLanguage === "es" ? "Spanish" : "French"} word
                    separated from English, helping you memorize it through sound-a-like words.
                  </p>
                </div>

                {/* Navigation Buttons at Bottom */}
                <div className="mt-auto">
                  <FlashcardNavigation
                    index={currentIndex}
                    total={words.length}
                    onPrev={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                      }
                    }}
                    onNext={() => {
                      if (currentIndex < words.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      }
                    }}
                    onCrossword={() => {
                      window.location.href = "/crossword";
                    }}
                    isLast={currentIndex === words.length - 1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
