// Get API base URL and ensure it has protocol
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Ensure URL has protocol (fixes cases where env var is missing https://)
if (API_BASE_URL && !API_BASE_URL.startsWith("http://") && !API_BASE_URL.startsWith("https://")) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

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

  // Ensure path starts with /
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${apiPath}`;
  
  console.log(`🌐 API Call: ${fullUrl}`);

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }

  return res.json();
}
