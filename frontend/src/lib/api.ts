export async function api(path: string, options: any = {}) {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Only add Authorization header if token exists (optional auth)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:8000${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }

  return res.json();
}
