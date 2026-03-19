"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL, MEDIA_URL } from "@/src/services/api"
import { useAuth } from "@/src/hooks/useAuth"
import Image from "next/image"
import { Plus, ListVideo, Clock, PlayCircle } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { loading, isAuthenticated } = useAuth()

  const [player, setPlayer] = useState<any>(null)
  const [filas, setFilas] = useState<any[]>([])

  function formatarDiaSemana(dias: number[]) {
    const nomes = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    if (!dias || dias.length === 0) return "Todos"
    return dias.map(d => nomes[d]).join(", ")
  }

  async function carregar() {
    try {
      const token = localStorage.getItem("token")

      const [p, f] = await Promise.all([
        fetch(`${API_URL}/api/player/`),
        fetch(`${API_URL}/api/filas/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const playerData = await p.json()
      const filasData = await f.json()

      setPlayer(playerData)

      if (Array.isArray(filasData)) {
        setFilas(filasData)
      } else {
        setFilas([])
      }

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

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="text-[#ed5b0c]" size={18} />
              <h2 className="font-semibold text-[#253529]">
                Fila Atual
              </h2>
            </div>

            <span className="text-sm text-gray-500">
              {player?.fila ? player.fila : "Sem fila no momento"}
            </span>
          </div>

          {!player?.midias || player.midias.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              Nenhuma mídia em reprodução no momento
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 text-xs text-gray-400 mb-2 px-2">
                <span>Ordem</span>
                <span>Título</span>
                <span>Duração</span>
                <span>Mídia</span>
              </div>

              <div className="space-y-2">
                {player.midias.map((m: any, i: number) => (
                  <div
                    key={m.id || i}
                    className="grid grid-cols-4 items-center bg-[#f9fafb] rounded-lg p-2 hover:bg-[#f1f5f9] transition"
                  >
                    <span className="text-sm text-gray-500">
                      {i + 1}
                    </span>

                    <span className="text-sm font-medium text-[#253529]">
                      {m.nome}
                    </span>

                    <span className="text-sm text-gray-500">
                      {m.duracao || "--"}
                    </span>

                    <div className="w-[60px] h-[35px] rounded overflow-hidden border">
                      {m.tipo === "video" ? (
                        <video
                          src={`${MEDIA_URL}${m.arquivo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`${MEDIA_URL}${m.arquivo}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
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