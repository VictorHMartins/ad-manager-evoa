"use client"

import { useState } from "react"

export default function AddMidiaModal({ onAdd, fechar }: any) {

    const [arquivo, setArquivo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [tipo, setTipo] = useState<"imagem" | "video" | null>(null)
    const [duracao, setDuracao] = useState<number | "">(10)
    const [nome, setNome] = useState("")

    const [videoDuration, setVideoDuration] = useState<number | null>(null)

    function formatarTempo(segundos: number) {
        const min = Math.floor(segundos / 60)
        const sec = Math.floor(segundos % 60)
        return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    }

    function handleArquivo(file: File) {

        setArquivo(file)

        const url = URL.createObjectURL(file)
        setPreview(url)

        setNome(file.name.replace(/\.[^/.]+$/, ""))

        if (file.type.startsWith("image")) {
            setTipo("imagem")
        } else if (file.type.startsWith("video")) {
            setTipo("video")
        }
    }

    function handleDrop(e: any) {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleArquivo(file)
    }

    function handleSelect(e: any) {
        const file = e.target.files[0]
        if (file) handleArquivo(file)
    }

    function confirmar() {

        if (!arquivo) return

        onAdd({
            nome,
            arquivo,
            tipo,
            duracao: tipo === "imagem"
                ? (duracao === "" ? 10 : duracao)
                : videoDuration
        })

        fechar()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-[520px]">

                <h2 className="text-lg font-semibold mb-4">
                    Adicionar Mídia
                </h2>

                {!arquivo && (

                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                    >

                        <p className="text-sm text-gray-500 mb-2">
                            Arraste o arquivo aqui
                        </p>

                        <p className="text-xs text-gray-400 mb-3">
                            ou
                        </p>

                        <label className="bg-[#ed5b0c] text-white px-4 py-2 rounded cursor-pointer">
                            Escolher arquivo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleSelect}
                            />
                        </label>

                    </div>

                )}

                {arquivo && (

                    <div className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                                Nome da mídia
                            </label>
                            <input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#ed5b0c]/30"
                            />
                        </div>

                        {tipo === "imagem" && (
                            <>
                                <img
                                    src={preview!}
                                    className="w-full h-[220px] object-cover rounded"
                                />

                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">
                                        Duração (segundos)
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={duracao}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (/^\d*$/.test(value)) {
                                                    setDuracao(value === "" ? "" : Number(value))
                                                }
                                            }}
                                            className="w-full border rounded-lg px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[#ed5b0c]/30"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            seg
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {tipo === "video" && (
                            <>
                                <video
                                    src={preview!}
                                    controls
                                    className="w-full h-[220px] object-cover rounded"
                                    onLoadedMetadata={(e: any) => {
                                        const dur = e.target.duration
                                        setVideoDuration(dur)
                                    }}
                                />

                                {videoDuration && (
                                    <div className="text-sm text-gray-600">
                                        Duração: <span className="font-medium">
                                            {formatarTempo(videoDuration)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                )}

                <div className="flex justify-end gap-2 mt-6">

                    <button onClick={fechar} className="cursor-pointer">
                        Cancelar
                    </button>

                    <button
                        onClick={confirmar}
                        className="bg-[#ed5b0c] text-white px-4 py-2 rounded cursor-pointer active:scale-95 transition"
                    >
                        Adicionar
                    </button>

                </div>

            </div>

        </div>
    )
}