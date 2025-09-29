"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold">Contact Us</h2>
        <p className="mt-2 text-muted-foreground">Punya pertanyaan? Kirimkan pesanmu.</p>
      </div>

      {submitted ? (
        <div className="rounded-3xl border bg-card p-6 text-center">
          <p>Terima kasih! Kami akan membalas secepatnya.</p>
        </div>
      ) : (
        <form
          className="grid gap-4 rounded-3xl border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <div className="grid gap-1">
            <label className="text-sm font-medium">Nama</label>
            <Input required placeholder="Nama lengkap" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Email</label>
            <Input required type="email" placeholder="nama@email.com" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Pesan</label>
            <Textarea required placeholder="Tulis pesan kamu..." />
          </div>
          <Button type="submit" className="rounded-2xl">Kirim</Button>
        </form>
      )}
    </section>
  )
}

