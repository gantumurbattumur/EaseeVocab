export async function authenticateWithGoogle(response: any) {
  const id_token = response.credential;

  const res = await fetch("http://localhost:8000/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
  });

  const data = await res.json();

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    window.location.href = "/dashboard";
  } else {
    alert("Login failed");
  }
}
