import Image from "next/image"

const features = [
  {
    title: "Eduprompt",
    desc: "Buat prompt edukasi untuk materi, tugas, dan pembelajaran terstruktur.",
    img: "/landing-page/eduprompt.png",
  },
  {
    title: "Motionprompt",
    desc: "Template prompt untuk video/animasi dan motion graphics.",
    img: "/landing-page/motionprompt.png",
  },
  {
    title: "Storyprompt",
    desc: "Bangun alur cerita interaktif dan naskah narasi yang menarik.",
    img: "/landing-page/storyprompt.png",
  },
  {
    title: "Visiprompt",
    desc: "Panduan visual learning: diagram, infografik, dan ilustrasi.",
    img: "/landing-page/visiprompt.png",
  },
  {
    title: "QuizPrompt",
    desc: "Susun kuis otomatis beserta kunci jawaban dan tingkat kesulitan.",
    img: "/landing-page/quizPrompt.png",
  },
  {
    title: "PlayPrompt",
    desc: "Prompts untuk aktivitas bermain dan gamifikasi di kelas.",
    img: "/landing-page/playPrompt.png",
  },
]

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />

      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold">Features</h2>
          <p className="mt-2 text-muted-foreground">Pilihan jenis tools prompt sesuai kebutuhanmu</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="overflow-hidden rounded-3xl border bg-card">
              <div className="relative aspect-square w-full">
                <Image src={f.img} alt={f.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
