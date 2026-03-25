const API_URL = process.env.NEXT_PUBLIC_API_URL as string
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL as string

export { API_URL, MEDIA_URL }

export async function apiFetch(endpoint: string, options: any = {}) {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const isFormData = options.body instanceof FormData

  try {

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
      throw new Error("Unauthorized")
    }

    if (res.status === 204) {
      return null
    }

    const text = await res.text()

    try {
      return text ? JSON.parse(text) : null
    } catch {
      return null
    }

  } catch (err) {
    throw err
  }
}

export async function getPlaylist() {
  try {

    const res = await fetch(`${API_URL}/api/player/`, {
      cache: "no-store"
    })

    if (!res.ok) {
      return { midias: [] }
    }

    const text = await res.text()

    try {
      return text ? JSON.parse(text) : { midias: [] }
    } catch {
      return { midias: [] }
    }

  } catch {
    return { midias: [] }
  }
}