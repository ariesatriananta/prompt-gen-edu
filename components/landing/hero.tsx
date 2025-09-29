"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Wand2, Check } from "lucide-react"

export function Hero() {
  const slides = [
    {
      title: "Generator Prompt Edukasi",
      desc: "Buat prompt berkualitas untuk tugas, materi ajar, dan riset hanya dalam hitungan detik.",
    },
    {
      title: "Template Siap Pakai",
      desc: "Puluhan template kurasi untuk Guru, Siswa, dan Dosen. Tinggal pakai, sesuaikan, kirim.",
    },
    {
      title: "Hasil Konsisten",
      desc: "Standarisasi gaya dan format output dengan kontrol yang mudah. Tingkatkan kualitas dan produktivitas.",
    },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <Wand2 className="size-7" />
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          ClassToon
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">AI & Digital Tools untuk produktivitas edukasi</p>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Toko online SaaS generator prompt berbasis AI untuk Guru, Siswa, dan Profesional. Hasil cepat, konsisten, dan dapat disesuaikan.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Link href="/login">Coba Gratis</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <a href="#pricing">Lihat Harga</a>
          </Button>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl">
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {slides.map((s, i) => (
                <CarouselItem key={i}>
                  <div className="rounded-3xl border bg-card p-8 text-left shadow-sm">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Check className="h-4 w-4" /> Sorotan
                    </div>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 text-muted-foreground">{s.desc}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
