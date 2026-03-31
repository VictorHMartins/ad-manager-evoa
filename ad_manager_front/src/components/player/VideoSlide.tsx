"use client"

import { useEffect, useRef } from "react"

export default function VideoSlide({ src, onEnd }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.src = src
    video.load()
    const tentarReproduzir = async () => {
      try {
        video.muted = false
        await video.play()
      } catch (error) {
        console.warn("Autoplay com áudio bloqueado. Reproduzindo mudo.")
        video.muted = true
        await video.play()
      }
    }

    tentarReproduzir()

    return () => {
      video.pause()
      video.src = ""
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      key={src} 
      playsInline
      preload="auto"
      onEnded={onEnd}
      className="w-full h-full object-cover bg-black"
    />
  )
}