"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Layers, List, LogOut, HelpCircle } from "lucide-react"

export default function Sidebar() {

  const router = useRouter()
  const pathname = usePathname()

  const [ajudaOpen, setAjudaOpen] = useState(false)

  function logout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  function NavItem({ icon: Icon, label, path }: any) {
    const active = pathname === path

    return (
      <div
        onClick={() => router.push(path)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
        ${active ? "bg-white/10" : "hover:bg-white/5"}`}
      >
        <Icon size={18} />
        <span className="text-sm">{label}</span>

        {active && (
          <div className="ml-auto w-[3px] h-5 bg-[#ed5b0c] rounded-full" />
        )}
      </div>
    )
  }

  return (
    <>
      <aside className="w-[240px] min-h-screen bg-gradient-to-b from-[#253529] to-[#1F2C22] text-white flex flex-col justify-between p-4">

        <div>

          <div className="mb-10 flex justify-center">
            <Image src="/logo-evoa.svg" alt="Evoa" width={140} height={50} />
          </div>

          <div className="flex flex-col gap-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" path="/" />
            <NavItem icon={Layers} label="Playlists" path="/playlists" />
            <NavItem icon={List} label="Fila de Reprodução" path="/filas" />
          </div>

        </div>

        <div className="flex flex-col gap-2">

          <div
            onClick={() => setAjudaOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <HelpCircle size={18} />
            <span className="text-sm">Ajuda</span>
          </div>

          <div
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair</span>
          </div>

        </div>

      </aside>

      {ajudaOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-[#181818] text-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-white/10">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Central de Ajuda</h2>
                <p className="text-xs text-gray-400">Guia rápido de utilização do sistema</p>
              </div>
              <button
                onClick={() => setAjudaOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard size={18} className="text-[#ed5b0c]" />
                  <span className="font-semibold">Dashboard</span>
                </div>
                <p className="text-sm text-gray-400">
                  Visualize a fila atual e acompanhe o que está sendo exibido nas telas.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={18} className="text-[#ed5b0c]" />
                  <span className="font-semibold">Playlists</span>
                </div>
                <p className="text-sm text-gray-400">
                  Crie campanhas adicionando imagens e vídeos e organize a ordem de exibição.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <List size={18} className="text-[#ed5b0c]" />
                  <span className="font-semibold">Fila de Reprodução</span>
                </div>
                <p className="text-sm text-gray-400">
                  Configure horários e dias da semana para definir quando cada playlist será exibida.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle size={18} className="text-[#ed5b0c]" />
                  <span className="font-semibold">Compatibilidade</span>
                </div>
                <p className="text-sm text-gray-400">
                  Utilize vídeos em formato MP4 (H.264) para garantir funcionamento correto em TVs.
                </p>
              </div>

            </div>

            <div className="mt-6 bg-[#ed5b0c]/10 border border-[#ed5b0c]/20 rounded-xl p-4">

              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={18} className="text-[#ed5b0c]" />
                <span className="font-semibold text-[#ed5b0c]">Suporte</span>
              </div>

              <p className="text-sm text-gray-300">
                Precisa de ajuda? Entre em contato com o suporte técnico ou administrador do sistema.
              </p>

            </div>

          </div>

        </div>
      )}
    </>
  )
}