"use client";

import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import { api } from "@/lib/api";

type Language = "es" | "fr";

interface Word {
  id: number;
  word: string;
  definition: string;
  translation_es?: string;
  translation_fr?: string;
  mnemonic_word?: string;
  mnemonic_sentence?: string;
  image_url?: string;
}

interface FlashcardsProps {
  words: Word[];
  language: Language;
  onIndexChange?: (index: number) => void;
  currentIndex?: number;
  onIndexSet?: (index: number) => void;
}

export default function Flashcards({ words, language, onIndexChange, currentIndex, onIndexSet }: FlashcardsProps) {
  const [cards, setCards] = useState<Word[]>([]);
  const [internalIndex, setInternalIndex] = useState(0);
  
  // Use external index if provided, otherwise use internal
  const index = currentIndex !== undefined ? currentIndex : internalIndex;
  
  const setIndex = (newIndex: number) => {
    if (onIndexSet) {
      onIndexSet(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };
  const [flipped, setFlipped] = useState(false);
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);
  const [crosswordMode, setCrosswordMode] = useState(false);

  const router = useRouter();
  // Load words
  useEffect(() => {
    setCards(words || []);
    const resetIndex = 0;
    if (onIndexSet) {
      onIndexSet(resetIndex);
    } else {
      setInternalIndex(resetIndex);
    }
  }, [words, onIndexSet]);

  // Reset flipped state when index changes
  useEffect(() => {
    setFlipped(false);
  }, [index]);

  // Notify parent of index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(index);
    }
  }, [index, onIndexChange]);

  if (cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="text-gray-700 text-lg font-medium">
          Loading cards…
        </span>
      </div>
    );
  }

  const card = cards[index];
  
  // Safety check: ensure card exists before rendering
  if (!card) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="text-gray-700 text-lg font-medium">
          No card data available
        </span>
      </div>
    );
  }

  const next = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      router.push("/crossword");
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  };


  // Get the translation based on selected language
  const getTranslation = () => {
    if (language === "es") return card.translation_es;
    if (language === "fr") return card.translation_fr;
    return null;
  };

  const translation = getTranslation();

  // Generate mnemonic for the selected language word
  async function generateMnemonic(e: React.MouseEvent) {
    e.stopPropagation(); // prevents flip

    if (!translation) {
      alert(`No ${language === "es" ? "Spanish" : "French"} translation available for this word.`);
      return;
    }

    setLoadingMnemonic(true);

    try {
      // Generate mnemonic for the translation word (not English)
      // Use translation as the word and English definition
      const data = await api("/mnemonic/generate", {
        method: "POST",
        body: JSON.stringify({
          word: translation, // The foreign language word
          definition: card.definition, // English definition
        }),
      });

      // Update card immediately with text (fast)
      const updated = [...cards];
      updated[index] = {
        ...card,
        mnemonic_word: data.mnemonic_word,
        mnemonic_sentence: data.mnemonic_sentence,
        image_url: data.image_base64 
          ? `data:image/png;base64,${data.image_base64}`
          : undefined,
      };
      setCards(updated);
      
      // Store only text data in sessionStorage (not images - too large, causes quota errors)
      // Images are already in the card state and will persist during component lifecycle
      try {
        const cacheKey = `mnemonic_text_${card.id}_${language}`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          mnemonic_word: data.mnemonic_word,
          mnemonic_sentence: data.mnemonic_sentence,
          // Don't store image_base64 - it's too large and causes quota errors
        }));
      } catch (e) {
        // If storage fails, that's okay - images are in component state
        console.warn("Could not cache mnemonic text:", e);
      }
      
      // Flip automatically when mnemonic text is ready (image loads separately)
      setFlipped(true);

      // Save to word history when mnemonic is generated
      const historyItem = {
        word: card.word,
        translation: translation,
        definition: card.definition,
        language: language === "es" ? "Spanish" : "French",
        date: new Date().toISOString(),
      };
      
      const existingHistory = localStorage.getItem("word_history");
      let history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Check if word already exists in history
      const exists = history.some((h: any) => 
        h.word === historyItem.word && h.translation === historyItem.translation
      );
      
      if (!exists) {
        history.unshift(historyItem); // Add to beginning
        // Keep only last 100 words
        if (history.length > 100) {
          history = history.slice(0, 100);
        }
        localStorage.setItem("word_history", JSON.stringify(history));
      }

      // Flip automatically when mnemonic is ready
      setFlipped(true);
    } catch (err) {
      console.error("Mnemonic error:", err);
      alert("Failed to generate mnemonic. Please try again.");
    }

    setLoadingMnemonic(false);
  }

  // Generate pronunciation guide (simple syllable splitting)
  const getPronunciation = (word: string, lang: Language): string => {
    if (!word) return "";
    const lower = word.toLowerCase();
    
    if (lang === "es") {
      // Simple Spanish syllable splitting (basic version)
      // Split by vowels, but keep consonant clusters together
      const syllables = lower.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouáéíóúü]+[bcdfghjklmnpqrstvwxyz]*/gi) || [];
      return syllables.length > 0 ? `[${syllables.join("-")}]` : `[${lower}]`;
    } else if (lang === "fr") {
      // Simple French syllable splitting (basic version)
      const syllables = lower.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouàâäéèêëïîôùûüÿ]+[bcdfghjklmnpqrstvwxyz]*/gi) || [];
      return syllables.length > 0 ? `[${syllables.join("-")}]` : `[${lower}]`;
    }
    return `[${lower}]`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* ===== CARD WRAPPER (handles 3D flip) ===== */}
      <div
        className="relative w-[480px] h-[580px] cursor-pointer perspective"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* ===== FRONT ===== */}
          <div
            className="absolute inset-0 bg-white rounded-2xl shadow-xl px-8 py-10 flex flex-col items-center justify-center backface-hidden overflow-hidden"
          >
            {/* Spanish/French Section - Top Half */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b-4 border-blue-200 w-full">
              {/* Selected Language Translation (Top) */}
              {translation ? (
                <>
                  <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
                    {translation}
                  </h1>
                  {/* Pronunciation guide */}
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    {getPronunciation(translation, language)}
                  </p>
                </>
              ) : (
                <h1 className="text-4xl font-extrabold text-gray-400 mb-3">
                  No translation
                </h1>
              )}
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">
                {language === "es" ? "Spanish" : "French"}
              </p>
            </div>

            {/* English Section - Bottom Half */}
            <div className="flex flex-col items-center">
              {/* English Word (Middle) */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {card.word}
              </h2>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                English
              </p>

              {/* English Definition (Bottom) */}
              <p className="text-center text-gray-700 text-base max-w-[320px] leading-relaxed mb-4">
                {card.definition}
              </p>

              {/* Always show generate button - user can regenerate if needed */}
              <button
                onClick={generateMnemonic}
                disabled={loadingMnemonic || !translation}
                className="px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
              >
                {loadingMnemonic ? "Generating…" : "Generate Sound-a-like"}
              </button>
            </div>
          </div>

          {/* ===== BACK ===== */}
          <div
            className="absolute inset-0 bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center justify-center rotate-y-180 backface-hidden overflow-hidden"
          >
            {/* Translated word with pronunciation guide */}
            {translation && (
              <div className="w-full flex items-center justify-between mb-4">
                <p className="text-5xl font-extrabold text-blue-600">
                  {translation}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {getPronunciation(translation, language)}
                </p>
              </div>
            )}

            {/* Sound-a-like word */}
            {card.mnemonic_word && (
              <div className="mb-4 w-full">
                <p className="text-gray-700 text-base text-center">
                  <span className="font-semibold">Sound-a-like:</span>{" "}
                  <span className="text-2xl font-bold text-purple-600">
                    "{card.mnemonic_word}"
                  </span>
                </p>
              </div>
            )}

            {/* Large Image - Fills most of the space */}
            {card.image_url && (
              <div className="flex-1 w-full flex items-center justify-center mb-3 min-h-0">
                <img
                  src={card.image_url}
                  className="w-full h-full max-w-full max-h-[420px] object-contain rounded-xl shadow"
                  alt="Sound-a-like word illustration"
                />
              </div>
            )}

            {/* Mnemonic sentence at bottom */}
            {card.mnemonic_sentence && (
              <p className="text-center text-gray-700 text-sm max-w-[400px] leading-relaxed">
                {card.mnemonic_sentence}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// Navigation buttons component to be used in parent
export function FlashcardNavigation({
  index,
  total,
  onPrev,
  onNext,
  onCrossword,
  isLast,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onCrossword: () => void;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-gray-200">
      <button
        onClick={onPrev}
        disabled={index === 0}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all"
      >
        ◀ Prev
      </button>

      <span className="text-gray-800 font-bold text-lg min-w-[80px] text-center">
        {index + 1} / {total}
      </span>

      {isLast ? (
        <button
          onClick={onCrossword}
          className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 font-semibold transition-all"
        >
          Crossword →
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 font-semibold transition-all"
        >
          Next ▶
        </button>
      )}
    </div>
  );
}
