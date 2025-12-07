"use client";

import { useState } from "react";

export default function Flashcards({ words }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);

  const card = words[index];

  const next = () => {
    if (index < words.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  };

  // ⭐ Generate mnemonic from backend
  async function generateMnemonic(e) {
    e.stopPropagation(); // stop click from flipping card

    setLoadingMnemonic(true);

    try {
      const res = await fetch("http://localhost:8000/mnemonic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: card.word,
          definition: card.definition,
        }),
      });

      const data = await res.json();

      // Inject mnemonic + image into the card
      card.mnemonic = data.mnemonic;
      card.image_url = `data:image/png;base64,${data.image_base64}`;

      setFlipped(true); // show result immediately
    } catch (err) {
      console.error("Error generating mnemonic:", err);
    }

    setLoadingMnemonic(false);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card container */}
      <div
        className="relative w-80 h-52 md:w-96 md:h-64 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 ${
            flipped ? "rotate-y-180" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 bg-white border rounded-xl shadow-lg flex flex-col items-center justify-center p-4"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h1 className="text-3xl font-bold text-gray-900">{card.word}</h1>
            <p className="text-gray-600 mt-3">Tap to reveal definition</p>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 bg-white border rounded-xl shadow-lg flex flex-col items-center justify-center p-4 rotate-y-180"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h2 className="font-semibold text-lg text-gray-900">
              {card.definition}
            </h2>

            <p className="text-gray-600 text-sm mt-3">
              {card.translation_es} / {card.translation_fr}
            </p>

            {/* ⭐ Show mnemonic text if available */}
            {card.mnemonic && (
              <p className="text-gray-800 mt-3 text-center font-medium">
                {card.mnemonic}
              </p>
            )}

            {/* ⭐ Show mnemonic image if available */}
            {card.image_url && (
              <img
                src={card.image_url}
                className="mt-3 w-36 h-36 rounded-lg shadow object-cover"
              />
            )}

            {/* ⭐ Mnemonic button */}
            <button
              onClick={generateMnemonic}
              disabled={loadingMnemonic}
              className="px-3 py-1 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingMnemonic ? "Generating…" : "Generate Mnemonic"}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-4 py-2 bg-black-200 rounded disabled:opacity-40"
        >
          ◀ Prev
        </button>

        <span className="text-lg font-medium text-white">
          {index + 1} / {words.length}
        </span>

        <button
          onClick={next}
          disabled={index === words.length - 1}
          className="px-4 py-2 bg-black-200 rounded disabled:opacity-40"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
