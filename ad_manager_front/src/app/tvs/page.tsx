"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/src/services/api"
import { Plus, Trash2, Monitor, Tv2, Copy, Check } from "lucide-react"
import TvModal from "@/src/components/tvs/TvModal"
import ConfirmModal from "@/src/components/ConfirmModal"

export default function TvsPage() {

    const [tvs, setTvs] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [tvSelecionada, setTvSelecionada] = useState<any>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [tvExcluir, setTvExcluir] = useState<number | null>(null)
    const [copiado, setCopiado] = useState<string | null>(null)

    async function carregar() {
        try {
            const data = await apiFetch("/api/dispositivos/")
            setTvs(Array.isArray(data) ? data : data?.results || [])
        } catch {
            setTvs([])
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    async function confirmarExclusao() {
        if (tvExcluir === null) return

        try {
            await apiFetch(`/api/dispositivos/${tvExcluir}/`, { method: "DELETE" })
            setConfirmOpen(false)
            setTvExcluir(null)
            carregar()
        } catch {
            console.log("Erro ao excluir TV")
        }
    }

    async function copiar(texto: string, chave: string) {
        try {
            await navigator.clipboard.writeText(texto)
            setCopiado(chave)
            setTimeout(() => setCopiado(null), 2000)
        } catch {}
    }

    function urlReact(codigo: string) {
        return `${window.location.origin}/player/${codigo}`
    }

    function urlLegacy(codigo: string) {
        return `${window.location.origin}/tv.html?tv=${codigo}`
    }

    return (
        <div className="p-8">

            <div className="flex justify-between items-center mb-6">

                <div className="flex items-center gap-3">
                    <img src="/fivicon_evoa.svg" className="w-10 h-10" />
                    <h1 className="text-xl font-semibold text-gray-800">TVs / Dispositivos</h1>
                </div>

                <button
                    onClick={() => {
                        setTvSelecionada(null)
                        setOpen(true)
                    }}
                    className="flex items-center gap-2 bg-[#ed5b0c] hover:bg-[#cf4e0a] text-white px-4 py-2 rounded-lg transition cursor-pointer active:scale-95"
                >
                    <Plus size={16} />
                    Nova TV
                </button>

            </div>

            <div className="space-y-4">

                {tvs.map((tv: any) => (

                    <div
                        key={tv.id}
                        onClick={() => {
                            setTvSelecionada(tv)
                            setOpen(true)
                        }}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer flex justify-between items-center border border-transparent hover:border-gray-200 hover:-translate-y-[2px]"
                    >

                        <div className="space-y-2 flex-1 min-w-0">

                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-gray-800">
                                    {tv.nome}
                                </div>

                                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tv.codigo}
                                </span>

                                {!tv.ativo && (
                                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded">
                                        Inativa
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                    {tv.orientacao === "v" ? "Vertical" : "Horizontal"}
                                </span>
                                <span>
                                    {tv.tipo_player === "legacy" ? "Player Legacy" : "Player React"}
                                </span>
                                {tv.descricao && (
                                    <span className="text-gray-400">{tv.descricao}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        copiar(urlReact(tv.codigo), `react-${tv.id}`)
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#ed5b0c] transition cursor-pointer"
                                >
                                    <Monitor size={12} />
                                    <span className="font-mono">/player/{tv.codigo}</span>
                                    {copiado === `react-${tv.id}`
                                        ? <Check size={12} className="text-green-500" />
                                        : <Copy size={12} />
                                    }
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        copiar(urlLegacy(tv.codigo), `legacy-${tv.id}`)
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#ed5b0c] transition cursor-pointer"
                                >
                                    <Tv2 size={12} />
                                    <span className="font-mono">/tv.html?tv={tv.codigo}</span>
                                    {copiado === `legacy-${tv.id}`
                                        ? <Check size={12} className="text-green-500" />
                                        : <Copy size={12} />
                                    }
                                </button>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setTvExcluir(tv.id)
                                setConfirmOpen(true)
                            }}
                            className="text-red-500 hover:text-red-700 transition cursor-pointer ml-4"
                        >
                            <Trash2 size={18} />
                        </button>

                    </div>

                ))}

                {tvs.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        Nenhuma TV cadastrada
                    </div>
                )}

            </div>

            {open && (
                <TvModal
                    tv={tvSelecionada}
                    fechar={() => {
                        setOpen(false)
                        setTvSelecionada(null)
                        carregar()
                    }}
                />
            )}

            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmarExclusao}
                title="Excluir TV"
                message="Tem certeza que deseja excluir esta TV? As filas associadas também serão removidas."
            />

        </div>
    )
}
