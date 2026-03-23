import "./globals.css"
import SidebarWrapper from "@/src/components/SidebarWrapper"

export const metadata = {
  title: "AD Manager - Evoa",
  description: "Sistema de gerenciamento de mídia",
  icons: {
    icon: "/fivicon_evoa.svg",
    shortcut: "/fivicon_evoa.svg",
    apple: "/fivicon_evoa.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  )
}