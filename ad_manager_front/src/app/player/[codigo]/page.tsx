"use client"

import { useParams } from "next/navigation"
import Player from "@/src/components/player/player"

export default function PlayerPage() {
  const params = useParams()
  const codigo = params.codigo as string

  return <Player codigo={codigo} />
}
