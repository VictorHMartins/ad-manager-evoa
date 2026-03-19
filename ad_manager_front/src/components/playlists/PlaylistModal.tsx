"use client"

import { useState } from "react"
import AddMidiaModal from "./AddMidiaModal"
import ConfirmModal from "@/src/components/ConfirmModal"
import { MEDIA_URL } from "@/src/services/api"

export default function PlaylistModal({
  nome,
  setNome,
  midias,
  setMidias,
  fechar,
  salvar,
  editando
}: any) {

  const [addOpen, setAddOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [indexExcluir, setIndexExcluir] = useState<number | null>(null)

  function removerMidiaConfirmado() {
    if (indexExcluir === null) return

    const nova = midias.filter((_: any, i: number) => i !== indexExcluir)
    atualizarOrdem(nova)

    setConfirmOpen(false)
    setIndexExcluir(null)
  }

  function alterarCampo(index: number, campo: string, valor: any) {
    const nova = [...midias]
    nova[index][campo] = valor
    setMidias(nova)
  }

  function adicionarNovaMidia(midia: any) {
    const nova = [
      ...midias,
      {
        ...midia,
        ordem: midias.length + 1
      }
    ]
    setMidias(nova)
  }

  function atualizarOrdem(lista: any[]) {
    const nova = lista.map((item, index) => ({
      ...item,
      ordem: index + 1
    }))
    setMidias(nova)
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDrop(index: number) {
    if (dragIndex === null) return

    const nova = [...midias]
    const item = nova[dragIndex]

    nova.splice(dragIndex, 1)
    nova.splice(index, 0, item)

    atualizarOrdem(nova)
    setDragIndex(null)
  }

  function getPreview(src: any) {
    if (!src) return null

    if (src instanceof File) {
      return URL.createObjectURL(src)
    }

    if (typeof src === "string") {
      return src.startsWith("http") ? src : `${MEDIA_URL}${src}`
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[900px] max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold text-[#253529] mb-4">
          {editando ? "Editar Playlist" : "Nova Playlist"}
        </h2>

        <input
          value={nome || ""}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da playlist"
          className="w-full border rounded-lg px-3 py-2 mb-6 outline-none focus:ring-2 focus:ring-[#ed5b0c]/30"
        />

        <div className="space-y-3 mb-4">

          {midias.map((m: any, i: number) => {

            const preview = getPreview(m.arquivo)

            return (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className="grid grid-cols-6 gap-4 items-center bg-[#f5f6f7] p-3 rounded-lg cursor-move"
              >

                <div className="w-[80px] h-[60px] rounded overflow-hidden border">
                  {preview && (
                    m.tipo === "video"
                      ? <video src={preview} className="w-full h-full object-cover" />
                      : <img src={preview} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="text-xs text-gray-500 truncate">
                  {typeof m.arquivo === "string"
                    ? m.arquivo.split("/").pop()
                    : m.arquivo?.name}
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Ordem
                  </label>
                  <input
                    type="text"
                    value={m.ordem || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^\d*$/.test(value)) {
                        alterarCampo(i, "ordem", value === "" ? "" : Number(value))
                      }
                    }}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Duração
                  </label>

                  {m.tipo === "imagem" ? (
                    <input
                      type="text"
                      value={m.duracao || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*$/.test(value)) {
                          alterarCampo(i, "duracao", value === "" ? "" : Number(value))
                        }
                      }}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-xs text-gray-400 pt-2">
                      Automático
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIndexExcluir(i)
                    setConfirmOpen(true)
                  }}
                  className="text-red-500 text-sm"
                >
                  Remover
                </button>

              </div>
            )
          })}

        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="text-sm text-[#ed5b0c] mb-4"
        >
          + Adicionar mídia
        </button>

        <div className="flex justify-end gap-2">

          <button
            onClick={fechar}
            className="px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="bg-[#ed5b0c] text-white px-4 py-2 rounded-lg"
          >
            Salvar
          </button>

        </div>

      </div>

      {addOpen && (
        <AddMidiaModal
          onAdd={adicionarNovaMidia}
          fechar={() => setAddOpen(false)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={removerMidiaConfirmado}
        title="Remover mídia"
        message="Tem certeza que deseja remover esta mídia da playlist?"
      />

    </div>
  )
}