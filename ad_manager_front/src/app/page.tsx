"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/src/services/api"
import { useAuth } from "@/src/hooks/useAuth"
import Image from "next/image"
import { Plus, ListVideo, Clock, Tv2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { loading, isAuthenticated } = useAuth()

  const [dispositivos, setDispositivos] = useState<any[]>([])
  const [filas, setFilas] = useState<any[]>([])

  function formatarDiaSemana(dias: number[]) {
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    if (!dias || dias.length === 0) return "Todos"
    return dias.map(d => nomes[d]).join(", ")
  }

  async function carregar() {
    try {

      const [dispositivosData, filasData] = await Promise.all([
        apiFetch("/api/dispositivos/"),
        apiFetch("/api/filas/")
      ])

      setDispositivos(Array.isArray(dispositivosData) ? dispositivosData : dispositivosData?.results || [])
      setFilas(Array.isArray(filasData) ? filasData : filasData?.results || [])

    } catch {
      setFilas([])
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      carregar()
    }
  }, [isAuthenticated])

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/fivicon_evoa.svg"
          alt="Evoa"
          width={42}
          height={42}
        />

        <div>
          <h1 className="text-2xl font-semibold text-[#253529] tracking-tight">
            AD Manager
          </h1>
          <p className="text-gray-500 text-sm">
            Gerenciador inteligente de transmissão
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">

        <div
          onClick={() => router.push("/playlists")}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border-l-4 border-[#ed5b0c]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#ed5b0c]/10 p-2 rounded-lg">
              <Plus className="text-[#ed5b0c]" size={18} />
            </div>
            <span className="font-semibold text-[#253529]">
              Nova Playlist
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Criar campanhas e mídias
          </p>
        </div>

        <div
          onClick={() => router.push("/filas")}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border-l-4 border-[#4b654e]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#4b654e]/10 p-2 rounded-lg">
              <ListVideo className="text-[#4b654e]" size={18} />
            </div>
            <span className="font-semibold text-[#253529]">
              Nova Fila
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Agendar reprodução
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-2 mb-4">
            <Tv2 className="text-[#ed5b0c]" size={18} />
            <h2 className="font-semibold text-[#253529]">
              TVs cadastradas
            </h2>
          </div>

          {dispositivos.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              Nenhuma TV cadastrada
            </div>
          ) : (
            <div className="space-y-2">
              {dispositivos.map((tv: any) => (
                <div
                  key={tv.id}
                  onClick={() => router.push("/tvs")}
                  className="flex items-center justify-between bg-[#f9fafb] rounded-lg p-3 hover:bg-[#f1f5f9] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[#253529] text-sm">{tv.nome}</span>
                    <span className="font-mono text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{tv.codigo}</span>
                    {!tv.ativo && (
                      <span className="text-xs text-red-400">Inativa</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {tv.orientacao === "v" ? "Vertical" : "Horizontal"} · {tv.tipo_player === "legacy" ? "Compatível" : "Moderno"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-[#ed5b0c]" size={18} />
            <h2 className="font-semibold text-[#253529]">
              Próximos
            </h2>
          </div>

          <div className="space-y-3">
            {Array.isArray(filas) && filas.map((f: any, i: number) => (
              <div
                key={f.id || i}
                className="bg-[#f5f6f7] p-3 rounded-lg hover:bg-[#eceff1] transition"
              >
                <div className="text-sm font-semibold text-[#253529]">
                  {f.nome}
                </div>

                <div className="text-xs text-gray-500">
                  {formatarDiaSemana(f.dias_semana)}
                </div>

                <div className="text-sm text-[#ed5b0c] font-medium">
                  {f.horario_inicio} → {f.horario_fim}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  )
}