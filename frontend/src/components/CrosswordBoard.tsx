"use client";

export default function CrosswordBoard({
  grid,
  onChange,
}: {
  grid: any[][];
  onChange: (r: number, c: number, v: string) => void;
}) {
  function getCellStyles(cell: any) {
    const isBlock = cell.letter === null || cell.is_block;

    // BLOCK = gray
    if (isBlock) {
      return "bg-gray-300 dark:bg-gray-700";
    }

    // CHECKED - after submission
    if (cell.correct === true) {
      return "bg-green-500 dark:bg-green-600 text-white dark:text-white font-bold";
    }
    if (cell.correct === false) {
      return "bg-gray-400 dark:bg-gray-600 text-gray-900 dark:text-white";
    }

    // PLAYABLE default (before submit) - white
    return "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700";
  }

  return (
    <div
      className="grid gap-[2px] p-2 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-inner"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, 40px)` }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isBlock = cell.letter === null || cell.is_block;
          const styles = getCellStyles(cell);

          if (isBlock) {
            return (
              <div
                key={`${r}-${c}`}
                className={`w-[40px] h-[40px] border-2 border-gray-400 dark:border-gray-600 rounded-sm ${styles}`}
              />
            );
          }

          return (
            <div key={`${r}-${c}`} className="relative">
              {cell.number && (
                <div className="absolute top-0 left-0 text-[10px] font-bold text-gray-700 dark:text-gray-300 pointer-events-none z-10 bg-white/80 dark:bg-gray-800/80 px-0.5 rounded-br">
                  {cell.number}
                </div>
              )}

              <input
                type="text"
                maxLength={1}
                value={cell.input ?? ""}
                onChange={(e) =>
                  onChange(r, c, e.target.value.toUpperCase())
                }
                className={`w-[40px] h-[40px] border-2 border-gray-300 dark:border-gray-500 text-center text-lg font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 rounded-sm transition-all ${styles} text-gray-900 dark:text-white`}
                autoComplete="off"
                spellCheck={false}
                style={{ paddingTop: "8px" }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
