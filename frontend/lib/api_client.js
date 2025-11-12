const BASE_URL = "http://127.0.0.1:8000"; 

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export async function fetchAssets(token) {
  const res = await fetch(`${BASE_URL}/api/assets/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch assets");
  return await res.json();
}

export async function uploadAsset(formData, token) {
  const res = await fetch(`${BASE_URL}/api/assets/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return await res.json();
}
