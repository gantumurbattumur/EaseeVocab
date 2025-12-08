"use client";

import { useEffect, useState } from "react";
import CrosswordBoard from "@/components/CrosswordBoard";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

export default function CrosswordPage() {
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        // Get words from flashcards (stored in localStorage)
        const storedWords = localStorage.getItem("flashcard_words");
        let wordsToUse = [];
        
        if (storedWords) {
          try {
            wordsToUse = JSON.parse(storedWords);
          } catch (e) {
            console.error("Error parsing stored words:", e);
          }
        }
        
        // If no stored words, fetch new ones
        if (wordsToUse.length === 0) {
          const wordsData = await api("/words/daily", {
            method: "POST"
          });
          wordsToUse = wordsData?.words || [];
          localStorage.setItem("flashcard_words", JSON.stringify(wordsToUse));
        }
        
        // Get selected language
        const selectedLanguage = localStorage.getItem("learning_language") || "es";
        
        // Generate crossword using translated words (Spanish/French) instead of English
        // This tests the user's memorization of the foreign words
        // Take exactly 10 words and ensure they have translations
        const wordsWithTranslations = wordsToUse.slice(0, 10)
          .map((w: any) => {
            const translation = selectedLanguage === "es" ? w.translation_es : w.translation_fr;
            return {
              word: translation || w.word, // Use translation, fallback to English if no translation
              englishWord: w.word,
              definition: w.definition,
              translation: translation,
              hasTranslation: !!translation
            };
          })
          .filter((w: any) => w.word && w.word.length <= 10); // Filter out words without translations and words too long
        
        if (wordsWithTranslations.length === 0) {
          setError("No translated words available. Please complete flashcards first.");
          setLoading(false);
          return;
        }
        
        // Use translated words for the crossword
        const translatedWordList = wordsWithTranslations.map((w: any) => w.word.toUpperCase());
        
        // Create clues mapping (English definition as clue for translated words)
        const cluesMap: { [key: string]: string } = {};
        wordsWithTranslations.forEach((w: any) => {
          cluesMap[w.word.toUpperCase()] = w.definition; // English definition as clue
        });
        
        // Call crossword API with translated words and clues
        const json = await api("/crossword/today", {
          method: "POST",
          body: JSON.stringify({
            words: translatedWordList,
            clues: cluesMap,
          }),
        });

        // ensure basic fields
        json.grid = json.grid.map((row: any[]) =>
          row.map((cell: any) => ({
            ...cell,
            is_block: cell.is_block ?? false,
            input: cell.input ?? "",
            number: cell.number ?? null,
          }))
        );

        // clue numbers - handle shared starting cells
        const cellNumbers: { [key: string]: number } = {};
        json.words.forEach((w: any) => {
          const cellKey = `${w.row}-${w.col}`;
          if (json.grid[w.row] && json.grid[w.row][w.col]) {
            // If multiple words start at same cell, they share the same number
            if (!cellNumbers[cellKey]) {
              cellNumbers[cellKey] = w.number;
            }
            json.grid[w.row][w.col].number = cellNumbers[cellKey];
          }
        });

        setData(json);
      } catch (err: any) {
        console.error("Error loading crossword:", err);
        setError(err.message || "Failed to load crossword");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updateCell(r: number, c: number, val: string) {
    const updated = { ...data };
    updated.grid = updated.grid.map((row: any[], rr: number) =>
      row.map((cell: any, cc: number) =>
        rr === r && cc === c ? { ...cell, input: val } : cell
      )
    );
    setData(updated);
  }

  async function submit() {
    try {
      const check = await api("/crossword/check", {
        method: "POST",
        body: JSON.stringify({
          grid: data.grid,
          words: data.words,
        }),
      });

      setResult(check);

      // clone grid
      const updated = { ...data };
      updated.grid = updated.grid.map((row: any[]) => row.map((c: any) => ({ ...c })));

      check.results.forEach((w: any) => {
        const word = data.words.find((x: any) => x.number === w.number);
        if (!word) return;

        const { row, col, direction, answer } = word;
        [...answer].forEach((_, i) => {
          const r = direction === "across" ? row : row + i;
          const c = direction === "across" ? col + i : col;

          updated.grid[r][c].correct = w.correct;
        });
      });

      setData(updated);
    } catch (err: any) {
      console.error("Error submitting crossword:", err);
      alert("Failed to submit crossword. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Loading crossword…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No crossword data available</p>
          </div>
        </div>
      </div>
    );
  }

  const across = data.words.filter((w: any) => w.direction === "across");
  const down = data.words.filter((w: any) => w.direction === "down");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crossword Challenge</h1>
            <p className="text-gray-600">Test your vocabulary knowledge</p>
          </div>

          <div className="flex flex-row gap-12">
            {/* LEFT */}
            <div>
              <CrosswordBoard grid={data.grid} onChange={updateCell} />

        <button
          onClick={submit}
          className="mt-6 px-5 py-2 bg-green-600 text-white rounded-lg"
        >
          Submit
        </button>

              {result && (
                <div className="mt-4 text-xl font-bold">
                  Score: {result.results.filter((r: any) => r.correct).length} /{" "}
                  {result.results.length}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="max-w-[350px]">
              <h3 className="font-bold">Across</h3>
              {across.map((w: any) => (
                <div key={w.number} className="mb-2">
                  <strong>{w.number}</strong>. {w.clue}
                </div>
              ))}

              <h3 className="font-bold mt-6">Down</h3>
              {down.map((w: any) => (
                <div key={w.number} className="mb-2">
                  <strong>{w.number}</strong>. {w.clue}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
