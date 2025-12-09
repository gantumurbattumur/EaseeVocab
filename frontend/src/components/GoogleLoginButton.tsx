"use client";

import { useEffect, useState } from "react";
import { authenticateWithGoogle } from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config: { theme: string; size: string; width: string }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    // Wait for script to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        setScriptLoaded(true);
        clearInterval(checkGoogle);
      }
    }, 100);

    // Cleanup
    return () => clearInterval(checkGoogle);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: authenticateWithGoogle,
      });

      const buttonElement = document.getElementById("google-login-sidebar");
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: "outline",
          size: "large",
          width: "100%",
        });
      }
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
    }
  }, [scriptLoaded]);

  if (!scriptLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading Google Sign-In...</div>
      </div>
    );
  }

  return <div id="google-login-sidebar" className="w-full" />;
}
