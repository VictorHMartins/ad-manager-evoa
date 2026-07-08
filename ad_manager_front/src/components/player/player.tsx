"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getPlaylist, MEDIA_URL } from "@/src/services/api"
import ImageSlide from "./ImageSlide"
import VideoSlide from "./VideoSlide"

interface PlayerProps {
  codigo: string
}

export default function Player({ codigo }: PlayerProps) {
  const [midias, setMidias] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [orientacao, setOrientacao] = useState<"h" | "v">("h")

  const ultimaAtualizacao = useRef(0)
  const intervaloAtualizacao = 60000

  const midiasRef = useRef<any[]>([])
  const novaMidiaRef = useRef<any[] | null>(null)
  const preloadVideoRef = useRef<HTMLVideoElement>(null)

  const carregar = useCallback(async () => {
    try {
      const data = await getPlaylist(codigo)

      if (data?.orientacao) {
        setOrientacao(data.orientacao)
      }

      if (data?.midias && data.midias.length > 0) {

        if (midiasRef.current.length === 0) {

          midiasRef.current = data.midias
          setMidias(data.midias)
          setIndex(0)

        } else {

          const atual = JSON.stringify(midiasRef.current)
          const nova = JSON.stringify(data.midias)

          if (atual !== nova) {
            novaMidiaRef.current = data.midias
          }

        }

        ultimaAtualizacao.current = Date.now()

      } else {
        setTimeout(carregar, 5000)
      }

    } catch {
      setTimeout(carregar, 5000)
    }
  }, [codigo])

  function verificarAtualizacao() {
    const agora = Date.now()

    if (agora - ultimaAtualizacao.current > intervaloAtualizacao) {
      carregar()
    }
  }

  function aplicarAtualizacaoSeNecessario(proximoIndex: number) {
    if (novaMidiaRef.current && proximoIndex === 0) {
      midiasRef.current = novaMidiaRef.current
      setMidias(novaMidiaRef.current)
      novaMidiaRef.current = null
      return true
    }
    return false
  }

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    midiasRef.current = midias
  }, [midias])

  // Wake Lock — mantém tela ativa em browsers modernos
  useEffect(() => {
    let wakeLock: any = null

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen")
        }
      } catch {}
    }

    requestWakeLock()

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Anti-standby — eventos periódicos para TVs sem Wake Lock
  useEffect(() => {
    const interval = setInterval(() => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)

      const ev = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true
      })

      document.body.dispatchEvent(ev)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Preload do próximo item — bufferiza vídeo/imagem seguinte antes da troca
  useEffect(() => {
    const total = midiasRef.current.length
    if (total === 0) return

    const proxima = midiasRef.current[(index + 1) % total]
    if (!proxima) return

    if (proxima.tipo === "video") {
      const video = preloadVideoRef.current
      if (video) {
        video.src = `${MEDIA_URL}${proxima.arquivo}`
        video.load()
      }
    } else if (proxima.tipo === "imagem") {
      const img = new Image()
      img.src = `${MEDIA_URL}${proxima.arquivo}`
    }

    return () => {
      const video = preloadVideoRef.current
      if (video) {
        video.pause()
        video.removeAttribute("src")
        video.load()
      }
    }
  }, [index, midias])

  function next() {
    setFade(false)

    setTimeout(() => {
      verificarAtualizacao()

      const total = midiasRef.current.length
      const proximoIndex = (index + 1) % total

      const atualizou = aplicarAtualizacaoSeNecessario(proximoIndex)

      if (atualizou) {
        setIndex(0)
      } else {
        setIndex(proximoIndex)
      }

      setFade(true)
    }, 300)
  }

  if (!midias.length) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Nenhuma fila de reprodução selecionada para esse horario...
      </div>
    )
  }

  const atual = midias[index]

  // Estilos para orientação vertical (TV em landscape reproduzindo conteúdo portrait)
  const verticalStyle: React.CSSProperties = orientacao === "v" ? {
    position: "fixed",
    top: "50%",
    left: "50%",
    width: "100vh",
    height: "100vw",
    transform: "translate(-50%, -50%) rotate(-90deg)",
  } : {}

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/*
        blank.mp4 invisível — workaround para autoplay policy.
        Mantém o browser em estado "media-active", permitindo que
        vídeos subsequentes reproduzam sem bloqueio.
        NÃO remover. NÃO mover para dentro do container rotacionado.
      */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "10px",
          height: "10px",
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: "none"
        }}
      >
        <source src="/blank.mp4" type="video/mp4" />
      </video>

      {/*
        Preload oculto do próximo item da playlist.
        Não é exibido nem tocado — só força o browser a bufferizar
        o próximo vídeo em cache HTTP antes da troca chegar nele.
      */}
      <video
        ref={preloadVideoRef}
        preload="auto"
        muted
        style={{ display: "none" }}
      />

      <div style={verticalStyle} className={orientacao === "v" ? "" : "relative z-10 w-full h-full"}>
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
    </div>
  )
}
