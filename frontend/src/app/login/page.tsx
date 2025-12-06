"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center mt-24">
      <h1 className="text-3xl font-bold mb-8">Sign in to MemoCross</h1>
      <GoogleLoginButton />
    </div>
  );
}
