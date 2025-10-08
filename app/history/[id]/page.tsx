"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function HistoryDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/history/${params.id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Gagal memuat detail')
        setItem(json.item)
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Gagal', description: e?.message || 'Coba lagi.' })
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  const exportTxt = () => {
    if (!item) return
    const scenes = item?.response_json?.scenes || []
    const header = [
      '=== Motion Prompt (Indonesia) ===',
      `Mata Pelajaran: ${item.subject || '-'}`,
      `Jenjang: ${item.grade || '-'}`,
      `Gaya: ${item.style || '-'}`,
      `Materi: ${item.topic || '-'}`,
      `Jumlah Adegan: ${scenes.length}`,
      '',
    ].join('\n')
    const lines: string[] = []
    scenes.forEach((s: any) => {
      lines.push('-----------------')
      lines.push(` Scene ${s.scene}`)
      lines.push('-----------------')
      const d = s.prompt_detail_id || {}
      Object.keys({
        visual_style: 'A. GAYA VISUAL',
        core_scene_description: 'B. DESKRIPSI ADEGAN INTI',
        cinematography: 'C. SINEMATOGRAFI (KAMERA & LENSA)',
        lighting_and_color: 'D. PENCAHAYAAN & WARNA',
        dialogue_and_audio: 'E. DIALOG & AUDIO',
        educational_focus: 'F. FOKUS PEMBELAJARAN',
        final_instructions: 'G. INSTRUKSI AKHIR & PROMPT NEGATIF',
      }).forEach((k) => {
        const label = ({
          visual_style: 'A. GAYA VISUAL',
          core_scene_description: 'B. DESKRIPSI ADEGAN INTI',
          cinematography: 'C. SINEMATOGRAFI (KAMERA & LENSA)',
          lighting_and_color: 'D. PENCAHAYAAN & WARNA',
          dialogue_and_audio: 'E. DIALOG & AUDIO',
          educational_focus: 'F. FOKUS PEMBELAJARAN',
          final_instructions: 'G. INSTRUKSI AKHIR & PROMPT NEGATIF',
        } as any)[k]
        lines.push(`${label}:`)
        lines.push(String(d[k] || '-'))
        lines.push('')
      })
    })
    const content = header + lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const name = `history-motionprompt-${(item.topic || 'prompt').toLowerCase().replace(/[^a-z0-9-_]+/g, '-')}-${scenes.length}scene-${new Date(item.created_at).toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`
    const a = document.createElement('a')
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const loadToForm = () => {
    if (!item) return
    localStorage.setItem('mp_history_prefill', JSON.stringify(item))
    router.push('/tools/motionprompt')
  }

  if (loading) return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10">Memuat…</main>
    </section>
  )
  if (!item) return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10">Tidak ditemukan.</main>
    </section>
  )

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-xl" onClick={() => router.back()} aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Detail Riwayat</h1>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-xl" onClick={exportTxt}>Export TXT</Button>
            <Button className="rounded-xl" variant="secondary" onClick={loadToForm}>Muat ke Form</Button>
          </div>
        </div>
      <div className="rounded-xl border p-4 text-sm">
        <div><strong>Tanggal:</strong> {new Date(item.created_at).toLocaleString('id-ID')}</div>
        <div><strong>Mapel:</strong> {item.subject || '-'}</div>
        <div><strong>Jenjang:</strong> {item.grade || '-'}</div>
        <div><strong>Gaya:</strong> {item.style || '-'}</div>
        <div><strong>Materi:</strong> {item.topic || '-'}</div>
      </div>
      <div className="space-y-2">
        {(item.response_json?.scenes || []).map((s: any) => (
          <div key={s.scene} className="rounded-xl border p-3">
            <div className="font-semibold">Scene {s.scene}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                {Object.entries(s?.prompt_detail_id || {}).map(([k, v]) => (
                  <p key={k} className="text-sm"><strong>{k}:</strong> <span className="text-muted-foreground">{String(v)}</span></p>
                ))}
              </div>
              <div>
                {Object.entries(s?.prompt_detail_en || {}).map(([k, v]) => (
                  <p key={k} className="text-sm"><strong>{k}:</strong> <span className="text-muted-foreground">{String(v)}</span></p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      </main>
    </section>
  )
}
