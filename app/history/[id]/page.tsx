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

  const exportFile = () => {
    if (!item) return
    const rr = item?.response_json || {}
    const scenes = rr?.scenes || []
    const isEnhanced = !!rr?.prompt_meta
    if (isEnhanced) {
      const content = JSON.stringify(rr, null, 2)
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const name = `history-${item.tool_key}-enhanced-${(item.topic || 'story').toLowerCase().replace(/[^a-z0-9-_]+/g,'-')}-${scenes.length}scene-${new Date(item.created_at).toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`
      const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      return
    }
    const isStory = Array.isArray(scenes) && scenes.length && (scenes[0]?.beat || scenes[0]?.beat_goal)
    if (isStory) {
      const isEN = (item?.language || '').toUpperCase() === 'EN'
      const L = {
        style: isEN ? 'A. VISUAL STYLE' : 'A. GAYA VISUAL',
        beat: isEN ? 'B. BEAT/GOAL' : 'B. BEAT/TUJUAN',
        visual: isEN ? 'C. VISUAL DESCRIPTION' : 'C. DESKRIPSI VISUAL',
        action: isEN ? 'D. KEY ACTION' : 'D. AKSI UTAMA',
        dialogue: isEN ? 'E. DIALOGUE' : 'E. DIALOG',
        audio: isEN ? 'F. AUDIO' : 'F. AUDIO',
        exit: isEN ? 'G. EXIT STATE' : 'G. EXIT STATE',
        transition: isEN ? 'H. TRANSITION' : 'H. TRANSISI',
        stability: isEN ? 'I. STABILITY & ANATOMY INSTRUCTION' : 'I. INSTRUKSI STABILITAS & ANATOMI',
        negative: isEN ? 'J. NEGATIVE PROMPT/FINAL INSTRUCTION' : 'J. NEGATIVE PROMPT/FINAL INSTRUCTION',
      }
      const stabilityText = isEN
        ? 'Maintain consistent character proportions and clean anatomy (hands, fingers, limbs, face). Avoid deformation, extra limbs, floating parts, and perspective warping. Keep camera stable; no excessive motion blur or shaky cam.'
        : 'Jaga proporsi karakter konsisten dan anatomi bersih (tangan, jari, anggota tubuh, wajah). Hindari deformasi, anggota tubuh berlebih, bagian mengambang, dan distorsi perspektif. Kamera stabil; tanpa motion blur berlebihan atau shaky cam.'
      const header = [
        '=== Story Prompt Export (History) ===',
        `Judul/Topik: ${item.topic || '-'}`,
        `Genre: ${item.style || '-'}`,
        `Kelompok Usia: ${item.grade || '-'}`,
        `Jumlah Scene: ${scenes.length}`,
        `Tanggal: ${new Date(item.created_at).toLocaleString('id-ID')}`,
        '====================================',
        '',
      ].join('\n')
      const lines: string[] = []
      scenes.forEach((s: any, i: number) => {
        lines.push('-----------------')
        lines.push(` Scene ${i + 1}`)
        lines.push('-----------------')
        lines.push(`${L.style}:\n${s?.style || '-'}`)
        lines.push('')
        lines.push(`${L.beat}:\n${s?.beat || s?.beat_goal || '-'}`)
        lines.push('')
        lines.push(`${L.visual}:\n${s?.visual || s?.visual_description || '-'}`)
        lines.push('')
        lines.push(`${L.action}:\n${s?.aksi || s?.key_action || '-'}`)
        lines.push('')
        lines.push(`${L.dialogue}:\n${s?.dialog || '-'}`)
        lines.push('')
        lines.push(`${L.audio}:\n${s?.audio || '-'}`)
        lines.push('')
        lines.push(`${L.exit}:\n${s?.exit || s?.exit_state || '-'}`)
        lines.push('')
        const t = s?.transisi || (s?.transition ? `${s?.transition?.type || '-' }${s?.transition?.to_scene ? ` → ${s.transition.to_scene}` : ''}` : '-')
        lines.push(`${L.transition}:\n${t}`)
        lines.push('')
        lines.push(`${L.stability}:\n${s?.stability || stabilityText}`)
        lines.push('')
        lines.push(`${L.negative}:\n${s?.negative || s?.negative_prompt || '-'}`)
        lines.push('')
      })
      const content = header + lines.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const name = `history-storyprompt-${(item.topic || 'story').toLowerCase().replace(/[^a-z0-9-_]+/g,'-')}-${scenes.length}scene-${new Date(item.created_at).toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`
      const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      return
    }
    // MotionPrompt-style fallback
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
      lines.push(` Scene ${s.scene || ''}`)
      lines.push('-----------------')
      const d = s.prompt_detail_id || {}
      const map: Record<string,string> = {
        visual_style: 'A. GAYA VISUAL',
        core_scene_description: 'B. DESKRIPSI ADEGAN INTI',
        cinematography: 'C. SINEMATOGRAFI (KAMERA & LENSA)',
        lighting_and_color: 'D. PENCAHAYAAN & WARNA',
        dialogue_and_audio: 'E. DIALOG & AUDIO',
        educational_focus: 'F. FOKUS PEMBELAJARAN',
        final_instructions: 'G. INSTRUKSI AKHIR & PROMPT NEGATIF',
      }
      Object.keys(map).forEach((k) => {
        lines.push(`${map[k]}:`)
        lines.push(String(d[k] || '-'))
        lines.push('')
      })
    })
    const content = header + lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const name = `history-motionprompt-${(item.topic || 'prompt').toLowerCase().replace(/[^a-z0-9-_]+/g, '-')}-${scenes.length}scene-${new Date(item.created_at).toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`
    const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const loadToForm = () => {
    if (!item) return
    if (item.tool_key === 'storyprompt') {
      localStorage.setItem('story_history_prefill', JSON.stringify(item))
      router.push('/tools/storyprompt')
    } else {
      localStorage.setItem('mp_history_prefill', JSON.stringify(item))
      router.push('/tools/motionprompt')
    }
  }

  if (loading) return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10">Memuat...</main>
    </section>
  )
  if (!item) return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10">Tidak ditemukan.</main>
    </section>
  )

  const userTag = (() => {
    const u = (item as any)?.user || (item as any)?.profile || {}
    return u?.name || u?.full_name || (item as any)?.user_name || u?.email || (item as any)?.user_email || ''
  })()

  const scenes = item?.response_json?.scenes || []
  const isEnhanced = !!item?.response_json?.prompt_meta
  const isStory = Array.isArray(scenes) && scenes.length && (scenes[0]?.beat || scenes[0]?.beat_goal)

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
            <Button className="rounded-xl" onClick={exportFile}>{isEnhanced ? 'Export JSON' : 'Export TXT'}</Button>
            <Button className="rounded-xl" variant="secondary" onClick={loadToForm}>Muat ke Form</Button>
          </div>
        </div>
        <div className="rounded-xl border p-4 text-sm">
          <div>
            <strong>Tanggal:</strong> {new Date(item.created_at).toLocaleString('id-ID')}
            {userTag ? <span className="text-muted-foreground"> • {userTag}</span> : null}
          </div>
          <div><strong>Tool:</strong> {item.tool_key}</div>
          <div><strong>Mapel/Genre:</strong> {item.subject || item.style || '-'}</div>
          <div><strong>Jenjang/Usia:</strong> {item.grade || '-'}</div>
          <div><strong>Topik:</strong> {item.topic || '-'}</div>
          <div><strong>Scene:</strong> {scenes.length}</div>
        </div>

        {isEnhanced ? (
          <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">{JSON.stringify(item.response_json, null, 2)}</pre>
        ) : isStory ? (
          <div className="space-y-2">
            {scenes.map((s: any, idx: number) => (
              <div key={idx} className="rounded-xl border p-3">
                <div className="font-semibold">Scene {idx + 1}</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <p className="text-sm"><strong>Beat/Goal:</strong> <span className="text-muted-foreground">{s?.beat || s?.beat_goal || '-'}</span></p>
                  <p className="text-sm"><strong>Visual:</strong> <span className="text-muted-foreground">{s?.visual || s?.visual_description || '-'}</span></p>
                  <p className="text-sm"><strong>Aksi:</strong> <span className="text-muted-foreground">{s?.aksi || s?.key_action || '-'}</span></p>
                  <p className="text-sm"><strong>Dialog:</strong> <span className="text-muted-foreground">{s?.dialog || '-'}</span></p>
                  <p className="text-sm"><strong>Audio:</strong> <span className="text-muted-foreground">{s?.audio || '-'}</span></p>
                  <p className="text-sm"><strong>Exit:</strong> <span className="text-muted-foreground">{s?.exit || s?.exit_state || '-'}</span></p>
                  <p className="text-sm"><strong>Transisi:</strong> <span className="text-muted-foreground">{s?.transisi || (s?.transition ? `${s.transition?.type || '-' }${s?.transition?.to_scene ? ` → ${s.transition.to_scene}` : ''}` : '-')}</span></p>
                  <p className="text-sm"><strong>Stability:</strong> <span className="text-muted-foreground">{s?.stability || '-'}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {scenes.map((s: any, idx: number) => (
              <div key={s.scene || idx} className="rounded-xl border p-3">
                <div className="font-semibold">Scene {s.scene || (idx + 1)}</div>
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
        )}
      </main>
    </section>
  )
}

