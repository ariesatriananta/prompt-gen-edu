const testimonials = [
  {
    name: "Rina, Guru Bahasa",
    quote:
      "Menyusun materi dan kisi-kisi jadi jauh lebih cepat. Template-nya membantu menjaga kualitas tugas siswa.",
  },
  {
    name: "Arif, Mahasiswa",
    quote:
      "Prompt preset risetnya mantap. Ngebantu banget pas nyusun kerangka dan pertanyaan wawancara.",
  },
  {
    name: "Dewi, Trainer",
    quote:
      "Output konsisten sehingga slide training lebih rapi dan profesional. Hemat banyak waktu revisi.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold">Apa Kata Pengguna</h2>
        <p className="mt-2 text-muted-foreground">Dipakai oleh pendidik, pelajar, dan profesional</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="rounded-3xl border bg-card p-6">
            <blockquote className="text-sm text-muted-foreground">“{t.quote}”</blockquote>
            <figcaption className="mt-4 font-medium">{t.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

