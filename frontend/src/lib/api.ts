export async function api(path: string, options: any = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`http://localhost:8000${path}`, {
    ...options,
    headers,
  });

  return res.json();
}
