"use client"

import { useEffect } from "react"

export default function ImageSlide({ src, duracao, onEnd }: any) {

  useEffect(() => {
    const tempo = (duracao || 10) * 1000

    const timer = setTimeout(() => {
      onEnd()
    }, tempo)

    return () => clearTimeout(timer)
  }, [src])

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <img
        src={src}
        className="w-full h-full object-cover"
      />
    </div>
  )
}