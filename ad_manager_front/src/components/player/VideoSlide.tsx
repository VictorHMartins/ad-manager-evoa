"use client"

import { useEffect, useRef } from "react"

export default function VideoSlide({ src, onEnd }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.removeAttribute('src')
    video.load()
    video.muted = false 
    
    const playPromise = video.play()

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Auto-play com som bloqueado, tentando mudo:", error)
        video.muted = true
        video.play()
      })
    }

    return () => {
      if (video) {
        video.pause()
        video.src = ""
        video.load()
      }
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      autoPlay
      playsInline
      preload="auto"
      onEnded={onEnd}
      className="w-full h-full object-cover"
      style={{ backgroundColor: 'black' }} 
    />
  )
}