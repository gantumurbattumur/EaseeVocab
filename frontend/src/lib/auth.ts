"use client";

export async function authenticateWithGoogle(response: { credential: string }) {
  const id_token = response.credential;

  try {
    const res = await fetch("http://localhost:8000/auth/google/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Login failed:", errorText);
      alert("Login failed. Please try again.");
      return;
    }

    const data = await res.json();

    // store token locally
    localStorage.setItem("access_token", data.token);

    // redirect to dashboard or learn page
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Authentication error:", error);
    alert("An error occurred during login. Please try again.");
  }
}
