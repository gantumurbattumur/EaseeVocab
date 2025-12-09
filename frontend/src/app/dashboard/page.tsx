"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Language = "es" | "fr" | null;
type Level = "a1" | "a2" | "b1" | "b2" | null;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if language and level are already selected in localStorage
    const savedLanguage = localStorage.getItem("learning_language") as Language;
    const savedLevel = localStorage.getItem("learning_level") as Level;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "fr")) {
      setSelectedLanguage(savedLanguage);
    }
    if (savedLevel && (savedLevel === "a1" || savedLevel === "a2" || savedLevel === "b1" || savedLevel === "b2")) {
      setSelectedLevel(savedLevel);
    }

    // Try to get user info (optional, won't break if not logged in)
    const token = localStorage.getItem("access_token");
    if (token) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Only try to get user if logged in
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.ok ? res.json() : null)
        .then(setUser)
        .catch(() => {
          // User not logged in or invalid token, that's okay
          setUser(null);
        });
    }
  }, []);

  const handleLanguageSelect = (lang: "es" | "fr") => {
    setSelectedLanguage(lang);
    localStorage.setItem("learning_language", lang);
    // Don't navigate yet - wait for level selection
  };

  const handleLevelSelect = (level: "a1" | "a2" | "b1" | "b2") => {
    setSelectedLevel(level);
    localStorage.setItem("learning_level", level);
    // Navigate to learn page with both language and level
    if (selectedLanguage) {
      router.push(`/learn?lang=${selectedLanguage}&level=${level}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-800">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
        {user && (
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
            Welcome back, {user.name}!
          </h1>
        )}

        {/* How It Works Section - Collapsible */}
        <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-xl mb-6 border border-gray-200 dark:border-slate-600 overflow-hidden">
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <span className="text-2xl transition-transform duration-300">
              {showHowItWorks ? "−" : "+"}
            </span>
          </button>

          {showHowItWorks && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              {/* Interactive Flashcard Demo */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-8">
                <div className="flex-shrink-0">
                  <div
                    className="relative w-[350px] h-[450px] cursor-pointer perspective"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div
                      className={`absolute inset-0 transition-transform duration-500 preserve-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 bg-white border-2 border-gray-300 rounded-2xl shadow-xl px-8 py-10 flex flex-col items-center justify-center backface-hidden">
                        <div className="text-center mb-6 pb-6 border-b-2 border-gray-200 w-full">
                          <h3 className="text-4xl font-extrabold text-gray-900 mb-2">
                            plato
                          </h3>
                          <p className="text-sm text-gray-500">[pla-to]</p>
                        </div>
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-gray-800 mb-2">
                            plate
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            A flat dish for serving food
                          </p>
                          <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-300">
                            Click to flip
                          </div>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 bg-white border-2 border-gray-300 rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center justify-center rotate-y-180 backface-hidden">
                        <div className="text-center mb-4 w-full">
                          <h3 className="text-5xl font-extrabold text-gray-900 mb-2">
                            plato
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">[pla-to]</p>
                        </div>
                        
                        {showImage ? (
                          <div className="mb-4 w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                            <div className="text-gray-600 text-center">
                              <div className="text-2xl mb-2 font-semibold">Image</div>
                              <p className="text-sm">AI-Generated Visual Aid</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 w-full h-48 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                            <div className="text-gray-500 text-center">
                              <div className="animate-spin text-2xl mb-2 font-semibold">⟳</div>
                              <p className="text-sm">Generating image...</p>
                            </div>
                          </div>
                        )}

                        <div className="text-center">
                          <p className="text-gray-700 text-sm mb-2">
                            <span className="font-semibold">Sound-a-like:</span>{" "}
                            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">"plate-o"</span>
                          </p>
                          <p className="text-gray-500 text-xs">
                            Think of a plate with an "o" - a plate-o!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 max-w-md">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          Sound-a-like Words
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Connect new words to familiar sounds. "Plato" sounds like "plate-o" - a plate with an O!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          AI-Generated Images
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Visual memory aids created by AI to help you remember words faster and more effectively.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          Crossword Puzzles
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Test your memorization with fun crossword challenges using the words you've learned.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          Track Progress
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Sign in to track your learning streak, view word history, and see your improvement over time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  Pro Tips
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-700 dark:text-blue-400 font-bold">RR</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm">Review Regularly</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                      Come back daily to review words
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-700 dark:text-purple-400 font-bold">SL</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm">Use Sound-a-likes</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                      Create strong mental connections
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-700 dark:text-green-400 font-bold">CW</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm">Practice with Puzzles</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                      Complete crosswords to reinforce learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-xl p-8 mb-6 border border-gray-200 dark:border-slate-600">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
            Select Your Learning Language
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Choose your language and level to get started
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Spanish Option */}
            <button
              onClick={() => handleLanguageSelect("es")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedLanguage === "es"
                  ? "border-gray-900 dark:border-blue-500 bg-white dark:bg-blue-900/30"
                  : "border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-blue-900/20"
              }`}
            >
              <div className="text-4xl mb-3">🇪🇸</div>
              <h3               className={`text-xl font-bold mb-2 ${
                selectedLanguage === "es"
                  ? "text-gray-900 dark:text-blue-300"
                  : "text-gray-900 dark:text-gray-100"
              }`}>Spanish</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Learn English words with Spanish translations
              </p>
            </button>

            {/* French Option */}
            <button
              onClick={() => handleLanguageSelect("fr")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedLanguage === "fr"
                  ? "border-gray-900 dark:border-blue-500 bg-white dark:bg-blue-900/30"
                  : "border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-blue-900/20"
              }`}
            >
              <div className="text-4xl mb-3">🇫🇷</div>
              <h3               className={`text-xl font-bold mb-2 ${
                selectedLanguage === "fr"
                  ? "text-gray-900 dark:text-blue-300"
                  : "text-gray-900 dark:text-gray-100"
              }`}>French</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Learn English words with French translations
              </p>
            </button>
          </div>

          {selectedLanguage && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Selected: <span className="font-bold text-gray-900 dark:text-blue-300">
                  {selectedLanguage === "es" ? "Spanish" : "French"}
                </span>
              </p>
              
              {/* Level Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Select Your Level
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["a1", "a2", "b1", "b2"] as const).map((level) => {
                    const levelNames: Record<string, string> = {
                      a1: "Beginner",
                      a2: "Elementary",
                      b1: "Intermediate",
                      b2: "Upper Intermediate",
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedLevel === level
                            ? "border-gray-900 dark:border-blue-500 bg-white dark:bg-blue-900/30 font-bold"
                            : "border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
                          {level.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {levelNames[level]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedLevel && (
                <a
                  href={`/learn?lang=${selectedLanguage}&level=${selectedLevel}`}
                  className="inline-block px-8 py-3 bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 rounded-xl font-semibold hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Learning
                </a>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/crossword"
                className="px-6 py-2 bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Today's Crossword Challenge
              </a>
              {!user && (
                <a
                  href="/login"
                  className="px-6 py-2 bg-pink-200 dark:bg-pink-300 text-gray-900 dark:text-gray-900 rounded-lg hover:bg-pink-300 dark:hover:bg-pink-400 border border-pink-300 dark:border-pink-400 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Sign in to Track Progress
                </a>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
