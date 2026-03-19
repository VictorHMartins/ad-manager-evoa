"use client"

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?"
}: any) {

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[400px]">

        <h2 className="text-lg font-semibold mb-2 text-[#253529]">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Confirmar
          </button>

        </div>

      </div>

    </div>
  )
}