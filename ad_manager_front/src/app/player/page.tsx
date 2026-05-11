"use client"

export default function PlayerPage() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white space-y-3">
        <p className="text-lg font-semibold">Código de TV não informado</p>
        <p className="text-sm text-gray-400">
          Acesse o player com o código da TV: <span className="font-mono text-white">/player/CODIGO</span>
        </p>
      </div>
    </div>
  )
}
