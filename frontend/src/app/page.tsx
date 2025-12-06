export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to MemoCross</h1>
      <p className="text-lg mb-8">Learn faster with mnemonics + AI-generated puzzles.</p>

      <a
        href="/login"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign in to begin →
      </a>
    </div>
  );
}
