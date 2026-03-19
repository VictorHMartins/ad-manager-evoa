"use client"

export default function VideoSlide({ src, onEnd }: any) {

  return (
    <video
      src={src}
      autoPlay
      muted
      onEnded={onEnd}
      className="w-full h-full object-contain"
    />
  )
}