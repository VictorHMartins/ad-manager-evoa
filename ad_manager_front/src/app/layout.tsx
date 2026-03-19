"use client"

import "./globals.css"
import { usePathname } from "next/navigation"
import Sidebar from "@/src/components/Sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const hideSidebar =
    pathname === "/login" || pathname.startsWith("/player")

  return (
    <html lang="pt-br">
      <body className={hideSidebar ? "" : "flex"}>
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 bg-[#f5f6f7]">
          {children}
        </main>
      </body>
    </html>
  )
}