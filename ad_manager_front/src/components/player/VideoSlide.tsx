"use client"

import { useEffect, useRef } from "react"

export default function VideoSlide({ src, onEnd }: any) {

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true
          video.play()
        })
      }
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      onEnded={onEnd}
      className="w-full h-full object-cover"
    />
  )
}