"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/src/components/Sidebar"

export default function SidebarWrapper({ children }: any) {

  const pathname = usePathname()

  const hideSidebar =
    pathname === "/login" || pathname.startsWith("/player") || pathname.startsWith("/tv")

  return (
    <div className={hideSidebar ? "" : "flex"}>
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 bg-[#f5f6f7]">
        {children}
      </main>
    </div>
  )
}