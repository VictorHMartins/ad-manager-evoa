"use client"

import { useEffect, useState } from "react"
import { API_URL, MEDIA_URL } from "@/src/services/api"
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import PlaylistModal from "@/src/components/playlists/PlaylistModal"
import ConfirmModal from "@/src/components/ConfirmModal"

export default function PlaylistsPage() {

    const [playlists, setPlaylists] = useState<any[]>([])
    const [openModal, setOpenModal] = useState(false)
    const [editando, setEditando] = useState<any>(null)
    const [nome, setNome] = useState("")
    const [midias, setMidias] = useState<any[]>([])
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [idExcluir, setIdExcluir] = useState<number | null>(null)

    async function carregar() {

        const token = localStorage.getItem("token")

        const res = await fetch(`${API_URL}/api/playlists/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()
        setPlaylists(Array.isArray(data) ? data : data.results || [])
    }

    useEffect(() => {
        carregar()
    }, [])

    function abrirNova() {
        setEditando(null)
        setNome("")
        setMidias([])
        setOpenModal(true)
    }

    function abrirEditar(p: any) {
        setEditando(p)
        setNome(p.nome || "")
        setMidias(p.midias || [])
        setOpenModal(true)
    }

    async function salvar() {

        const token = localStorage.getItem("token")

        const form = new FormData()

        form.append("nome", nome || "")

        midias.forEach((m, index) => {

            if (m.id) {
                form.append(`midias[${index}][id]`, m.id)
                form.append("midias_ids[]", m.id)
            }

            if (m.arquivo instanceof File) {
                form.append(`midias[${index}][arquivo]`, m.arquivo)
            }

            form.append(`midias[${index}][tipo]`, m.tipo || "")
            form.append(`midias[${index}][duracao]`, m.duracao || "")
            form.append(`midias[${index}][ordem]`, m.ordem || index + 1)
        })

        if (editando) {
            await fetch(`${API_URL}/api/playlists/${editando.id}/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            })
        } else {
            await fetch(`${API_URL}/api/playlists/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            })
        }

        setOpenModal(false)
        carregar()
    }

    async function confirmarExclusao() {

        if (!idExcluir) return

        const token = localStorage.getItem("token")

        await fetch(`${API_URL}/api/playlists/${idExcluir}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        setConfirmOpen(false)
        setIdExcluir(null)
        carregar()
    }

    function getImagem(src: any) {
        if (!src) return null

        if (typeof src === "string") {
            return src.startsWith("http") ? src : `${MEDIA_URL}${src}`
        }

        return null
    }

    return (

        <div className="p-8">

            <div className="flex justify-between items-center mb-6">

                <div className="flex items-center gap-3">
                    <img src="/fivicon_evoa.svg" className="w-10 h-10" />

                    <div>
                        <h1 className="text-2xl font-semibold text-[#253529]">
                            Playlists
                        </h1>
                        <p className="text-sm text-gray-500">
                            Gerencie suas campanhas e mídias
                        </p>
                    </div>
                </div>

                <button
                    onClick={abrirNova}
                    className="flex items-center gap-2 bg-[#ed5b0c] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    <Plus size={16} />
                    Nova Playlist
                </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">

                {Array.isArray(playlists) && playlists.map((p: any) => {

                    const imagem = p.midias?.[0]?.arquivo

                    return (
                        <div
                            key={p.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                        >

                            <div className="h-[120px] bg-[#f5f6f7] flex items-center justify-center">

                                {imagem ? (
                                    <img
                                        src={getImagem(imagem) || ""}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={28} />
                                )}

                            </div>

                            <div className="p-4">

                                <div className="font-semibold text-[#253529] mb-1">
                                    {p.nome}
                                </div>

                                <div className="text-xs text-gray-500 mb-3">
                                    {p.midias?.length || 0} mídias
                                </div>

                                <div className="flex justify-between items-center">

                                    <button
                                        onClick={() => abrirEditar(p)}
                                        className="flex items-center gap-1 text-sm text-[#4b654e] hover:underline"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIdExcluir(p.id)
                                            setConfirmOpen(true)
                                        }}
                                        className="flex items-center gap-1 text-sm text-red-500 hover:underline"
                                    >
                                        <Trash2 size={14} />
                                        Excluir
                                    </button>

                                </div>

                            </div>

                        </div>
                    )
                })}

            </div>

            {openModal && (
                <PlaylistModal
                    nome={nome}
                    setNome={setNome}
                    midias={midias}
                    setMidias={setMidias}
                    fechar={() => setOpenModal(false)}
                    salvar={salvar}
                    editando={editando}
                />
            )}

            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmarExclusao}
                title="Excluir playlist"
                message="Tem certeza que deseja excluir esta playlist?"
            />

        </div>
    )
}