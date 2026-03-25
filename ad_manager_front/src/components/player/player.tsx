"use client"

import { useEffect, useState } from "react"
import { getPlaylist, MEDIA_URL } from "@/src/services/api"
import ImageSlide from "./ImageSlide"
import VideoSlide from "./VideoSlide"

export default function Player() {

  const [midias, setMidias] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  async function carregar() {
    try {
      const data = await getPlaylist()

      if (data?.midias && data.midias.length > 0) {
        setMidias(data.midias)
        setIndex(0)
      } else {
        setTimeout(carregar, 5000)
      }

    } catch {
      setTimeout(carregar, 5000)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function next() {
    setFade(false)

    setTimeout(() => {
      setIndex((prev) => (prev + 1) % midias.length)
      setFade(true)
    }, 300)
  }

  useEffect(() => {

    const interval1 = setInterval(() => {
      try {
        document.body.dispatchEvent(new Event("mousemove"))
      } catch {}
    }, 20000)

    const interval2 = setInterval(() => {
      document.body.style.transform = "scale(1.0001)"
      setTimeout(() => {
        document.body.style.transform = "scale(1)"
      }, 300)
    }, 30000)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
    }

  }, [])

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

      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }}
      >
        <source src="/blank.mp4" type="video/mp4" />
      </video>

      <div className={`w-full h-full transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>

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

    </div>
  )
}