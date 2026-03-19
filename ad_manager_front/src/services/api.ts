const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || API_URL

export { API_URL, MEDIA_URL }


export async function apiFetch(endpoint: string, options: any = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  })

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return
  }

  if (!res.ok) {
    throw new Error("Erro na requisição")
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}

export async function getPlaylist() {

  const res = await fetch(`${API_URL}/api/player/`, {
    cache: "no-store"
  })

  if (!res.ok) {
    throw new Error("Erro ao buscar playlist")
  }

  return res.json()
}