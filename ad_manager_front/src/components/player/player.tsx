"use client"

import { useEffect, useState } from "react"
import { getPlaylist, MEDIA_URL } from "@/src/services/api"
import ImageSlide from "./ImageSlide"
import VideoSlide from "./VideoSlide"

export default function Player() {

  const [midias, setMidias] = useState<any[]>([])
  const [index, setIndex] = useState(0)

  async function carregar() {
    try {
      const data = await getPlaylist()

      if (data?.midias) {
        setMidias(data.midias)
        setIndex(0)
      }

    } catch (err) {
      console.error("Erro ao carregar player", err)

      setTimeout(carregar, 5000)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function next() {
    setIndex((prev) => (prev + 1) % midias.length)
  }

  if (!midias.length) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Carregando...
      </div>
    )
  }

  const atual = midias[index]

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">

      {atual.tipo === "imagem" && (
        <ImageSlide
          src={`${MEDIA_URL}${atual.arquivo}`}
          duracao={atual.duracao}
          onEnd={next}
        />
      )}

      {atual.tipo === "video" && (
        <VideoSlide
          src={`${MEDIA_URL}${atual.arquivo}`}
          onEnd={next}
        />
      )}

    </div>
  )
}