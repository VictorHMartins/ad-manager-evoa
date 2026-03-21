export default function TVPage() {
  return (
    <html>
      <head>
        <title>Player TV</title>

        <style>{`
          body {
            margin: 0;
            background: black;
            overflow: hidden;
          }

          video, img {
            width: 100vw;
            height: 100vh;
            object-fit: cover;
          }
        `}</style>
      </head>

      <body>
        <video id="video" autoPlay muted playsInline></video>
        <img id="image" style={{ display: "none" }} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              var API_URL = "${process.env.NEXT_PUBLIC_API_URL}"

              var midias = []
              var index = 0

              async function carregar() {
                try {
                  var res = await fetch(API_URL + "/api/player/")
                  var data = await res.json()

                  midias = data.midias || []
                  index = 0

                  rodar()

                } catch (e) {
                  setTimeout(carregar, 5000)
                }
              }

              function rodar() {

                if (!midias.length) return

                var m = midias[index]

                var video = document.getElementById("video")
                var image = document.getElementById("image")

                if (m.tipo === "video") {

                  image.style.display = "none"
                  video.style.display = "block"

                  video.src = API_URL + m.arquivo
                  video.muted = true

                  video.play()

                  video.onended = next

                  setTimeout(next, 60000)

                } else {

                  video.pause()
                  video.style.display = "none"

                  image.style.display = "block"
                  image.src = API_URL + m.arquivo

                  var tempo = (m.duracao || 10) * 1000

                  setTimeout(next, tempo)
                }
              }

              function next() {
                index = (index + 1) % midias.length
                rodar()
              }

              carregar()
            `
          }}
        />
      </body>
    </html>
  )
}