"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function authenticateWithGoogle(response: { credential: string }) {
  const id_token = response.credential;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/google/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Login failed:", errorText);
      throw new Error("Login failed. Please try again.");
    }

    const data = await res.json();

    // store token locally
    localStorage.setItem("access_token", data.token);

    // redirect to dashboard or learn page
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}
