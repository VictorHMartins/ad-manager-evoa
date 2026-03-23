const API_URL = process.env.NEXT_PUBLIC_API_URL as string
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL as string

export { API_URL, MEDIA_URL }


export async function apiFetch(endpoint: string, options: any = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  })

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return null
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
  try {

    const res = await fetch(`${API_URL}/api/player/`, {
      cache: "no-store"
    })

    if (!res.ok) {
      return { midias: [] }
    }

    return await res.json()

  } catch {
    return { midias: [] }
  }
}