"use client"

import { useEffect } from "react"

export default function TVPage() {

  useEffect(() => {

    const API_URL: any = process.env.NEXT_PUBLIC_API_URL

    let midias: any[] = []
    let index: number = 0

    function carregar() {

      const xhr: any = new XMLHttpRequest()

      xhr.open("GET", API_URL + "/api/player/", true)

      xhr.onreadystatechange = function () {

        if (xhr.readyState === 4 && xhr.status === 200) {

          try {
            const data = JSON.parse(xhr.responseText)

            midias = data.midias || []
            index = 0

            rodar()

          } catch (e) {
            setTimeout(carregar, 5000)
          }
        }
      }

      xhr.onerror = function () {
        setTimeout(carregar, 5000)
      }

      xhr.send()
    }

    function rodar() {

      if (!midias.length) return

      const m: any = midias[index]

      const video: any = document.getElementById("video")
      const image: any = document.getElementById("image")

      if (m.tipo === "video") {

        image.style.display = "none"
        video.style.display = "block"

        video.src = API_URL + m.arquivo
        video.muted = true

        const playPromise = video.play()

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true
            video.play()
          })
        }

        video.onended = next

        setTimeout(next, 60000)

      } else {

        video.pause()
        video.style.display = "none"

        image.style.display = "block"
        image.src = API_URL + m.arquivo

        const tempo = (m.duracao || 10) * 1000

        setTimeout(next, tempo)
      }
    }

    function next() {
      index = (index + 1) % midias.length
      rodar()
    }

    carregar()

  }, [])

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "black",
      overflow: "hidden"
    }}>
      <video
        id="video"
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
      <img
        id="image"
        style={{
          display: "none",
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    </div>
  )
}