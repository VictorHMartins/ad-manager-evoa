"use client"

import { useEffect, useState } from "react"
import { apiFetch, API_URL } from "@/src/services/api"
import { Monitor, Tv2, Copy, Check } from "lucide-react"

export default function TvModal({ tv, fechar }: any) {

    const [nome, setNome] = useState("")
    const [codigo, setCodigo] = useState("")
    const [orientacao, setOrientacao] = useState("h")
    const [tipoPlayer, setTipoPlayer] = useState("react")
    const [descricao, setDescricao] = useState("")
    const [ativo, setAtivo] = useState(true)

    const [erro, setErro] = useState("")
    const [copiado, setCopiado] = useState<string | null>(null)

    const isEdicao = Boolean(tv)

    useEffect(() => {
        if (tv) {
            setNome(tv.nome || "")
            setCodigo(tv.codigo || "")
            setOrientacao(tv.orientacao || "h")
            setTipoPlayer(tv.tipo_player || "react")
            setDescricao(tv.descricao || "")
            setAtivo(tv.ativo !== undefined ? tv.ativo : true)
        }
    }, [tv])

    function normalizarCodigo(valor: string) {
        return valor.toLowerCase().replace(/[^a-z0-9-_]/g, "")
    }

    function urlReact() {
        return `${window.location.origin}/player/${codigo}`
    }

    function urlLegacy() {
        return `${window.location.origin}/tv.html?tv=${codigo}`
    }

    async function copiar(texto: string, chave: string) {
        try {
            await navigator.clipboard.writeText(texto)
            setCopiado(chave)
            setTimeout(() => setCopiado(null), 2000)
        } catch {}
    }

    async function salvar() {
        setErro("")

        if (!nome.trim()) {
            setErro("Nome é obrigatório")
            return
        }

        if (!codigo.trim()) {
            setErro("Código é obrigatório")
            return
        }

        const payload = {
            nome: nome.trim(),
            codigo: codigo.trim(),
            orientacao,
            tipo_player: tipoPlayer,
            descricao: descricao.trim(),
            ativo,
        }

        try {
            if (isEdicao) {
                await apiFetch(`/api/dispositivos/${tv.id}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
            } else {
                await apiFetch("/api/dispositivos/", {
                    method: "POST",
                    body: JSON.stringify(payload),
                })
            }

            fechar()

        } catch {
            setErro("Erro ao salvar TV. Verifique se o código já está em uso.")
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-[560px] space-y-5">

                <h2 className="font-semibold text-lg">
                    {isEdicao ? "Editar TV" : "Nova TV"}
                </h2>

                {erro && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                        {erro}
                    </div>
                )}

                <div className="space-y-3">

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Nome da TV</label>
                        <input
                            placeholder="Ex: TV Recepção"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Código único <span className="text-gray-400">(letras minúsculas, números, - ou _)</span>
                        </label>
                        <input
                            placeholder="Ex: r, m, p, recepcao"
                            value={codigo}
                            onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
                            disabled={isEdicao}
                            className={`w-full border rounded px-3 py-2 text-sm font-mono ${isEdicao ? "bg-gray-50 text-gray-400" : ""}`}
                        />
                        {isEdicao && (
                            <p className="text-xs text-gray-400 mt-1">
                                O código não pode ser alterado após criação.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Orientação</label>
                            <select
                                value={orientacao}
                                onChange={(e) => setOrientacao(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                <option value="h">Horizontal</option>
                                <option value="v">Vertical</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Tipo de player</label>
                            <select
                                value={tipoPlayer}
                                onChange={(e) => setTipoPlayer(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                <option value="react">Player React</option>
                                <option value="legacy">Player Legacy</option>
                            </select>
                        </div>

                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Descrição (opcional)</label>
                        <input
                            placeholder="Ex: TV principal da recepção"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ativo}
                            onChange={(e) => setAtivo(e.target.checked)}
                            className="accent-[#ed5b0c]"
                        />
                        <span className="text-sm text-gray-700">TV ativa</span>
                    </label>

                </div>

                {/* URLs do player — exibidas quando código está preenchido */}
                {codigo && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">

                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            URLs do player
                        </p>

                        <div className="space-y-2">

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Monitor size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-xs font-mono text-gray-600 truncate">
                                        /player/{codigo}
                                    </span>
                                </div>
                                <button
                                    onClick={() => copiar(urlReact(), "react")}
                                    className="shrink-0 text-gray-400 hover:text-[#ed5b0c] transition cursor-pointer"
                                >
                                    {copiado === "react" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Tv2 size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-xs font-mono text-gray-600 truncate">
                                        /tv.html?tv={codigo}
                                    </span>
                                </div>
                                <button
                                    onClick={() => copiar(urlLegacy(), "legacy")}
                                    className="shrink-0 text-gray-400 hover:text-[#ed5b0c] transition cursor-pointer"
                                >
                                    {copiado === "legacy" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>

                        </div>

                    </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                    <button onClick={fechar} className="cursor-pointer text-sm px-4 py-2">
                        Cancelar
                    </button>
                    <button
                        onClick={salvar}
                        className="bg-[#ed5b0c] text-white px-4 py-2 rounded text-sm cursor-pointer active:scale-95 transition"
                    >
                        Salvar
                    </button>
                </div>

            </div>

        </div>
    )
}
