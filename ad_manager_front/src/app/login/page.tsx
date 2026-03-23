"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { API_URL } from "@/src/services/api"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: any) {

    e.preventDefault()

    setError("")

    if (!email || !password) {
      setError("Preencha usuário e senha")
      return
    }

    setLoading(true)

    try {

      const res = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError("Usuário ou senha inválidos")
        setLoading(false)
        return
      }

      localStorage.setItem("token", data.access)

      router.push("/")

    } catch (err) {

      setError("Erro ao conectar com o servidor")

    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#253529] via-[#1F2C22] to-[#0F1A14]">

      <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-[380px] transition-all duration-300 hover:scale-[1.01]">

        <div className="flex justify-center mb-4">
          <Image
            src="/logo-evoa-escuro.svg"
            alt="Evoa"
            width={130}
            height={50}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-[#253529]">
            AD Manager
          </h1>
          <p className="text-gray-500 text-sm">
            Painel Administrativo
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <div className="relative">
            <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 pl-10 w-full focus:outline-none focus:border-[#ED5B0C]"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 pl-10 pr-10 w-full focus:outline-none focus:border-[#ED5B0C]"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="bg-[#ED5B0C] text-white py-3 rounded-lg hover:opacity-90 transition cursor-pointer active:scale-95"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

        </form>

        <div className="text-center text-xs text-gray-400 mt-6">
          Powered by Webnox
        </div>

      </div>

    </div>
  )
}