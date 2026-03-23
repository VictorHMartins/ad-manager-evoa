"use client"

import { useEffect, useState } from "react"
import { API_URL } from "@/src/services/api"
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react"

export default function FilaModal({ fila, fechar }: any) {

    const [nome, setNome] = useState("")
    const [playlists, setPlaylists] = useState<any[]>([])
    const [selecionadas, setSelecionadas] = useState<any[]>([])

    const [inicio, setInicio] = useState("")
    const [fim, setFim] = useState("")

    const [todosDias, setTodosDias] = useState(true)
    const [dias, setDias] = useState<number[]>([])

    const [erro, setErro] = useState("")

    useEffect(() => {
        carregarPlaylists()
    }, [])

    useEffect(() => {
        if (fila) {
            setNome(fila.nome || "")
            setInicio(fila.horario_inicio || "")
            setFim(fila.horario_fim || "")
            setDias(fila.dias_semana || [])
            setTodosDias((fila.dias_semana || []).length === 7)

            if (fila.playlists) {
                setSelecionadas(
                    fila.playlists.map((p: any, i: number) => ({
                        id: p.playlist,
                        nome: p.playlist_nome,
                        ordem: p.ordem
                    }))
                )
            }
        }
    }, [fila])

    async function carregarPlaylists() {
        const token = localStorage.getItem("token")

        const res = await fetch(`${API_URL}/api/playlists/`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()
        setPlaylists(data)
    }

    function adicionarPlaylist(p: any) {
        if (selecionadas.find((x) => x.id === p.id)) return

        setSelecionadas([
            ...selecionadas,
            {
                id: p.id,
                nome: p.nome,
                ordem: selecionadas.length + 1
            }
        ])
    }

    function removerPlaylist(id: number) {
        const nova = selecionadas
            .filter((p) => p.id !== id)
            .map((p, i) => ({ ...p, ordem: i + 1 }))

        setSelecionadas(nova)
    }

    function subir(index: number) {
        if (index === 0) return

        const nova = [...selecionadas]
            ;[nova[index - 1], nova[index]] = [nova[index], nova[index - 1]]

        setSelecionadas(nova.map((p, i) => ({ ...p, ordem: i + 1 })))
    }

    function descer(index: number) {
        if (index === selecionadas.length - 1) return

        const nova = [...selecionadas]
            ;[nova[index + 1], nova[index]] = [nova[index], nova[index + 1]]

        setSelecionadas(nova.map((p, i) => ({ ...p, ordem: i + 1 })))
    }

    function toggleDia(dia: number) {
        let novosDias

        if (dias.includes(dia)) {
            novosDias = dias.filter((d) => d !== dia)
        } else {
            novosDias = [...dias, dia]
        }

        setDias(novosDias)
        setTodosDias(novosDias.length === 7)
    }

    function selecionarTodosDias() {
        const todos = [0, 1, 2, 3, 4, 5, 6]
        setDias(todos)
        setTodosDias(true)
    }

    async function salvar() {

        setErro("")

        const token = localStorage.getItem("token")

        const form = new FormData()

        form.append("nome", nome)
        form.append("horario_inicio", inicio)
        form.append("horario_fim", fim)
        form.append("dias_semana", JSON.stringify(dias))

        selecionadas.forEach((p, i) => {
            form.append(`playlists[${i}][playlist]`, String(p.id))
            form.append(`playlists[${i}][ordem]`, String(p.ordem))
        })

        const url = fila
            ? `${API_URL}/api/filas/${fila.id}/`
            : `${API_URL}/api/filas/`

        const method = fila ? "PUT" : "POST"

        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: form
        })

        const data = await res.json()

        if (!res.ok) {

            if (data.non_field_errors) {
                setErro(data.non_field_errors[0])
            } else if (typeof data === "object") {
                const firstKey = Object.keys(data)[0]
                setErro(data[firstKey][0])
            } else {
                setErro("Erro ao salvar")
            }

            return
        }

        fechar()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-[800px] space-y-6">

                <h2 className="font-semibold text-lg">
                    {fila ? "Editar Fila" : "Nova Fila"}
                </h2>

                {erro && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                        {erro}
                    </div>
                )}

                <input
                    placeholder="Nome da fila"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />

                <div className="flex gap-2 flex-wrap">

                    <button
                        onClick={selecionarTodosDias}
                        className={`px-3 py-1 rounded cursor-pointer transition ${todosDias ? "bg-[#ed5b0c] text-white" : "bg-gray-200"}`}
                    >
                        Todos
                    </button>

                    {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                        <button
                            key={d}
                            onClick={() => toggleDia(d)}
                            className={`px-3 py-1 rounded cursor-pointer transition ${dias.includes(d) ? "bg-[#ed5b0c] text-white" : "bg-gray-200"}`}
                        >
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]}
                        </button>
                    ))}

                </div>

                <div className="flex gap-2">
                    <input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-full border rounded px-2 py-2" />
                    <input type="time" value={fim} onChange={(e) => setFim(e.target.value)} className="w-full border rounded px-2 py-2" />
                </div>

                <div className="border rounded-xl p-4 bg-white">

                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-700">
                            Playlists disponíveis
                        </div>

                        <div className="text-xs text-gray-400">
                            Clique para adicionar
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-1">

                        {playlists.map((p) => {

                            const jaSelecionada = selecionadas.some(s => s.id === p.id)

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => !jaSelecionada && adicionarPlaylist(p)}
                                    className={`
                        relative border rounded-lg p-3 cursor-pointer transition
                        ${jaSelecionada
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-50 hover:border-[#ed5b0c] hover:bg-white"}
                    `}
                                >

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm font-medium">
                                            {p.nome}
                                        </span>

                                        {!jaSelecionada && (
                                            <span className="text-xs text-[#ed5b0c] font-semibold">
                                                +
                                            </span>
                                        )}

                                    </div>

                                    {jaSelecionada && (
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-white/70 rounded-lg">
                                            Adicionado
                                        </div>
                                    )}

                                </div>
                            )
                        })}

                    </div>

                </div>

                <div className="border rounded-xl p-4 bg-gray-50">

                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-700">
                            Playlists na fila
                        </div>

                        <div className="text-xs text-gray-400">
                            {selecionadas.length} item(s)
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">

                        {selecionadas.length === 0 && (
                            <div className="text-sm text-gray-400 text-center py-6">
                                Nenhuma playlist adicionada
                            </div>
                        )}

                        {selecionadas.map((p, index) => (

                            <div
                                key={p.id}
                                className="flex items-center justify-between bg-white border rounded-lg px-3 py-2 hover:border-[#ed5b0c] transition"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="w-6 h-6 flex items-center justify-center text-xs font-semibold bg-[#ed5b0c] text-white rounded">
                                        {p.ordem}
                                    </div>

                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm font-medium text-gray-800">
                                            {p.nome}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Ordem de execução
                                        </span>
                                    </div>

                                </div>

                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={() => subir(index)}
                                        className="p-1 rounded hover:bg-gray-100 cursor-pointer transition"
                                    >
                                        <ArrowUp size={16} />
                                    </button>

                                    <button
                                        onClick={() => descer(index)}
                                        className="p-1 rounded hover:bg-gray-100 cursor-pointer transition"
                                    >
                                        <ArrowDown size={16} />
                                    </button>

                                    <button
                                        onClick={() => removerPlaylist(p.id)}
                                        className="p-1 rounded hover:bg-red-50 cursor-pointer transition"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={fechar} className="cursor-pointer">Cancelar</button>
                    <button onClick={salvar} className="bg-[#ed5b0c] text-white px-4 py-2 rounded cursor-pointer active:scale-95 transition">
                        Salvar
                    </button>
                </div>

            </div>

        </div>
    )
}