"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-800 px-4">
      <div className="bg-white dark:bg-slate-700 shadow-lg rounded-2xl p-10 w-full max-w-lg text-center border border-gray-200 dark:border-slate-600">

        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
          Sign in to EaseeVocab
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Boost your memory with powerful AI flashcards.
        </p>

        <div className="flex justify-center mb-6">
          <GoogleLoginButton />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
