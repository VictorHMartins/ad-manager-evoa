"use client"

export default function VideoSlide({ src, onEnd }: any) {

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <video
        src={src}
        autoPlay
        controls={false}
        onEnded={onEnd}
        className="w-full h-full object-cover"
      />
    </div>
  )
}