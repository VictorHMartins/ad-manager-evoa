"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Layers, List, LogOut, HelpCircle } from "lucide-react"

export default function Sidebar() {

  const router = useRouter()
  const pathname = usePathname()

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
    <aside className="w-[240px] min-h-screen bg-gradient-to-b from-[#253529] to-[#1F2C22] text-white flex flex-col justify-between p-4">

      <div>

        <div className="mb-8 px-2">
          <Image src="/logo-evoa.svg" alt="Evoa" width={120} height={40} />
        </div>

        <div className="flex flex-col gap-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" path="/" />
          <NavItem icon={Layers} label="Playlists" path="/playlists" />
          <NavItem icon={List} label="Fila de Reprodução" path="/filas" />
        </div>

      </div>

      <div className="flex flex-col gap-2">

        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer">
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
  )
}