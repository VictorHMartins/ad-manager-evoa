"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function isTokenValid(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const now = Date.now() / 1000

    return payload.exp > now
  } catch {
    return false
  }
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token || !isTokenValid(token)) {
      localStorage.removeItem("token")
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }

    setLoading(false)
  }, [router])

  return { loading, isAuthenticated }
}