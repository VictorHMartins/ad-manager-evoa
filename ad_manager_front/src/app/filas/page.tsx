"use client"

import { useEffect, useState } from "react"
import { API_URL } from "@/src/services/api"
import { Plus, Trash2, Search, Calendar } from "lucide-react"
import FilaModal from "@/src/components/filas/FilaModal"
import ConfirmModal from "@/src/components/ConfirmModal"

export default function FilasPage() {

    const [filas, setFilas] = useState<any[]>([])
    const [filtradas, setFiltradas] = useState<any[]>([])

    const [open, setOpen] = useState(false)
    const [filaSelecionada, setFilaSelecionada] = useState<any>(null)

    const [busca, setBusca] = useState("")
    const [diaFiltro, setDiaFiltro] = useState("")

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [filaExcluir, setFilaExcluir] = useState<number | null>(null)

    async function carregar() {
        const token = localStorage.getItem("token")

        const res = await fetch(`${API_URL}/api/filas/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()
        setFilas(data)
        setFiltradas(data)
    }

    useEffect(() => {
        carregar()
    }, [])

    useEffect(() => {
        let resultado = filas

        if (busca) {
            resultado = resultado.filter((f: any) =>
                f.nome.toLowerCase().includes(busca.toLowerCase())
            )
        }

        if (diaFiltro !== "") {
            resultado = resultado.filter((f: any) =>
                (f.dias_semana || []).includes(Number(diaFiltro))
            )
        }

        setFiltradas(resultado)
    }, [busca, diaFiltro, filas])

    async function confirmarExclusao() {
        if (filaExcluir === null) return

        const token = localStorage.getItem("token")

        const res = await fetch(`${API_URL}/api/filas/${filaExcluir}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res.ok) {
            setConfirmOpen(false)
            setFilaExcluir(null)
            carregar()
        } else {
            console.log("Erro ao excluir", res.status)
        }
    }

    function formatarDias(dias: number[]) {
        const mapa = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

        if (!dias || dias.length === 0) return "—"
        if (dias.length === 7) return "Todos os dias"

        return dias.map((d) => mapa[d]).join(", ")
    }

    function formatarPlaylists(playlists: any[]) {
        if (!playlists || playlists.length === 0) return "—"

        return playlists
            .sort((a, b) => a.ordem - b.ordem)
            .map((p) => p.playlist_nome)
            .join(" • ")
    }

    return (
        <div className="p-8">

            <div className="flex justify-between items-center mb-6">

                <div className="flex items-center gap-3">
                    <img src="/fivicon_evoa.svg" className="w-10 h-10" />
                    <h1 className="text-xl font-semibold text-gray-800">
                        Filas de Reprodução
                    </h1>
                </div>

                <button
                    onClick={() => {
                        setFilaSelecionada(null)
                        setOpen(true)
                    }}
                    className="flex items-center gap-2 bg-[#ed5b0c] hover:bg-[#cf4e0a] text-white px-4 py-2 rounded-lg transition cursor-pointer active:scale-95"
                >
                    <Plus size={16} />
                    Nova Fila
                </button>

            </div>

            <div className="flex flex-wrap gap-3 mb-6">

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow">
                    <Search size={16} className="text-gray-400" />
                    <input
                        placeholder="Buscar fila..."
                        className="outline-none text-sm"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow">
                    <Calendar size={16} className="text-gray-400" />

                    <select
                        className="outline-none text-sm"
                        value={diaFiltro}
                        onChange={(e) => setDiaFiltro(e.target.value)}
                    >
                        <option value="">Todos os dias</option>
                        <option value="1">Segunda</option>
                        <option value="2">Terça</option>
                        <option value="3">Quarta</option>
                        <option value="4">Quinta</option>
                        <option value="5">Sexta</option>
                        <option value="6">Sábado</option>
                        <option value="0">Domingo</option>
                    </select>
                </div>

            </div>

            <div className="space-y-4">

                {filtradas.map((f: any) => (

                    <div
                        key={f.id}
                        onClick={() => {
                            setFilaSelecionada(f)
                            setOpen(true)
                        }}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer flex justify-between items-center border border-transparent hover:border-gray-200 hover:-translate-y-[2px]"
                    >

                        <div className="space-y-1">

                            <div className="font-semibold text-gray-800 text-base">
                                {f.nome}
                            </div>

                            <div className="text-sm text-gray-500">
                                Playlists: {formatarPlaylists(f.playlists)}
                            </div>

                            <div className="text-xs text-gray-400">
                                Horário: {f.horario_inicio} - {f.horario_fim}
                            </div>

                            <div className="text-xs text-blue-600 font-medium">
                                {formatarDias(f.dias_semana)}
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setFilaExcluir(f.id)
                                setConfirmOpen(true)
                            }}
                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
                        >
                            <Trash2 size={18} />
                        </button>

                    </div>

                ))}

                {filtradas.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        Nenhuma fila encontrada
                    </div>
                )}

            </div>

            {open && (
                <FilaModal
                    fila={filaSelecionada}
                    fechar={() => {
                        setOpen(false)
                        setFilaSelecionada(null)
                        carregar()
                    }}
                />
            )}

            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmarExclusao}
                title="Excluir fila"
                message="Tem certeza que deseja excluir esta fila?"
            />

        </div>
    )
}