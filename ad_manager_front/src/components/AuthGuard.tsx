"use client"

import { useAuth } from "@/src/hooks/useAuth"

export default function AuthGuard({ children }: any) {

  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Carregando...
      </div>
    )
  }

  return children
}