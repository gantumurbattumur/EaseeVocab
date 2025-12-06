"use client";

import { useEffect, useState } from "react";

export default function ProtectedPage({ children }: any) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
    } else {
      setAllowed(true);
    }
  }, []);

  if (!allowed) return <div className="p-6">Checking authentication...</div>;

  return children;
}
