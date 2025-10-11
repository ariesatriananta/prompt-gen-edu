"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Loader2, History, Wand2, Lightbulb, Dice5, Download } from 'lucide-react'
import Link from 'next/link'

type Scene = {
  beat: string
  visual: string
  aksi: string
  dialog: string
  audio: string
  exit: string
  transisi: string
  style?: string
  negative?: string
}

export default function StorypromptPage() {
  const [genre, setGenre] = useState('Dongeng')
  const [ageGroup, setAgeGroup] = useState('4-6')
  const [language, setLanguage] = useState<'ID'|'EN'|'JV'|'ES'|'FR'|'ZH'|'DE'|'AR'>('ID')
  const [promptLanguage, setPromptLanguage] = useState<'JSON'|'EN'|'ID'>('JSON')
  const [storyIdea, setStoryIdea] = useState('')
  const [characterDesc, setCharacterDesc] = useState('')
  const [moralLesson, setMoralLesson] = useState('')
  const [numScenes, setNumScenes] = useState(8)

  const [loading, setLoading] = useState(false)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysis, setAnalysis] = useState<any | null>(null)
  const [scriptOpen, setScriptOpen] = useState(false)
  const [scriptText, setScriptText] = useState('')
  const [sceneDialogOpen, setSceneDialogOpen] = useState(false)
  const [sceneDialogText, setSceneDialogText] = useState('')
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [jsonEnhanced, setJsonEnhanced] = useState<any | null>(null)
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorContent, setErrorContent] = useState('')

  const callApi = async (path: string, payload: any) => {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    let json: any = null
    try { json = await res.json() } catch { json = null }
    if (!res.ok) {
      const err: any = new Error(json?.error || 'API error')
      if (json?.raw_ai_text) err.raw_ai_text = json.raw_ai_text
      throw err
    }
    return json
  }

  const formatDurationID = (totalSeconds: number): string => {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '-'
    const s = Math.floor(totalSeconds)
    const hours = Math.floor(s / 3600)
    const minutes = Math.floor((s % 3600) / 60)
    const seconds = s % 60
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours} jam`)
    if (minutes > 0) parts.push(`${minutes} menit`)
    if (seconds > 0 && hours === 0) parts.push(`${seconds} detik`)
    if (parts.length === 0) return '0 detik'
    return parts.join(', ')
  }

  const handleSavePrompts = () => {
    if (!Array.isArray(scenes) || scenes.length === 0) {
      return toast({ variant: 'destructive', title: 'Tidak ada hasil', description: 'Buat prompt terlebih dahulu.' })
    }
    if (promptLanguage === 'JSON' && jsonEnhanced) {
      try {
        const blob = new Blob([JSON.stringify(jsonEnhanced, null, 2)], { type: 'application/json;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const slug = (storyIdea || 'story')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-_]+/g, '')
          .slice(0, 60)
        const name = `storyprompt-enhanced-${slug}-${scenes.length}scene-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        toast({ title: 'Tersimpan', description: 'File JSON berhasil diunduh.' })
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Gagal menyimpan', description: e?.message || 'Coba lagi.' })
      }
      return
    }

    const header = [
      '=== Story Prompt Export ===',
      `Genre: ${genre}`,
      `Kelompok Usia: ${ageGroup}`,
      `Bahasa Dialog: ${language}`,
      `Mode Prompt: ${promptLanguage}`,
      `Jumlah Scene: ${scenes.length}`,
      `Estimasi Durasi: ${formatDurationID(scenes.length * 8)}`,
      `Tanggal: ${new Date().toLocaleString('id-ID')}`,
      '===========================',
      '',
    ].join('\n')

    const isEN = promptLanguage === 'EN'
    const L = {
      style: isEN ? 'A. VISUAL STYLE' : 'A. GAYA VISUAL',
      beat: isEN ? 'B. BEAT/GOAL' : 'B. BEAT/TUJUAN',
      visual: isEN ? 'C. VISUAL DESCRIPTION' : 'C. DESKRIPSI VISUAL',
      action: isEN ? 'D. KEY ACTION' : 'D. AKSI UTAMA',
      dialogue: isEN ? 'E. DIALOGUE' : 'E. DIALOG',
      audio: isEN ? 'F. AUDIO' : 'F. AUDIO',
      exit: isEN ? 'G. EXIT STATE' : 'G. EXIT STATE',
      transition: isEN ? 'H. TRANSITION' : 'H. TRANSISI',
      negative: 'I. NEGATIVE PROMPT/FINAL INSTRUCTION',
    }
    const lines: string[] = []
    scenes.forEach((s, i) => {
      lines.push('-----------------')
      lines.push(` Scene ${i + 1}`)
      lines.push('-----------------')
      lines.push(`${L.style}:\n${s.style || '-'}`)
      lines.push('')
      lines.push(`${L.beat}:\n${s.beat}`)
      lines.push('')
      lines.push(`${L.visual}:\n${s.visual}`)
      lines.push('')
      lines.push(`${L.action}:\n${s.aksi}`)
      lines.push('')
      lines.push(`${L.dialogue}:\n${s.dialog || '-'}`)
      lines.push('')
      lines.push(`${L.audio}:\n${s.audio}`)
      lines.push('')
      lines.push(`${L.exit}:\n${s.exit}`)
      lines.push('')
      lines.push(`${L.transition}:\n${s.transisi}`)
      lines.push('')
      lines.push(`${L.negative}:\n${s.negative || '-'}`)
      lines.push('')
    })

    const content = header + lines.join('\n')
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const slug = (storyIdea || 'story')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]+/g, '')
        .slice(0, 60)
      const name = `storyprompt-${slug}-${scenes.length}scene-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: 'Tersimpan', description: 'File TXT berhasil diunduh.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: e?.message || 'Coba lagi.' })
    }
  }

  const handleRandomIdea = () => {
    const ideas = [
      'Anak gajah yang takut air belajar berenang.',
      'Kupu-kupu pemalu yang mencari teman di taman bunga.',
      'Robot kecil tersesat di kota besar, dibantu merpati.',
      'Pensil ajaib yang menggambar apapun jadi nyata.',
      'Awan kecil ingin melihat dunia dari bawah.',
    ]
    setStoryIdea(ideas[Math.floor(Math.random()*ideas.length)])
  }

  const handleDevelop = async () => {
    if (!storyIdea.trim()) return toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Jelaskan ide plot terlebih dahulu.' })
    setLoading(true)
    try {
      const { result } = await callApi('/api/story/develop', { storyIdea })
      setStoryIdea(result.plot || storyIdea)
      setCharacterDesc(result.characters || characterDesc)
      setMoralLesson(result.moral || moralLesson)
      toast({ title: 'Berhasil', description: 'Ide dikembangkan oleh AI.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: e?.message || 'Gagal mengembangkan ide.' })
    } finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    if (!storyIdea.trim()) return toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Jelaskan ide plot terlebih dahulu.' })
    setLoading(true)
    setScenes([])
    setJsonEnhanced(null)
    try {
      const { scenes: list, prompt_meta } = await callApi('/api/story/generate', { genre, ageGroup, language, promptLanguage, storyIdea, characterDesc, moralLesson, numScenes })
      if (!Array.isArray(list) || !list.length) throw new Error('AI tidak mengembalikan hasil.')
      const fallbackStyleEN = 'Pixar-Disney 3D animation style'
      const fallbackStyleID = 'Gaya animasi 3D Pixar-Disney'
      const fallbackNegativeEN = 'realistic gore, violence, blood, sharp teeth close-up, horror vibes, dark/gritty tone, excessive motion blur, shaky cam, text overlays, watermark, subtitles burned-in, brand logos, complex crowd scenes, night-time lighting, scary sound effects, blurry, distorted, unreadable letters, broken letters, messy letters, ugly, duplicate, morbid, mutilated, out of frame, poorly drawn, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, visible hair under hijab, incomplete hijab.'
      const fallbackNegativeID = 'kekerasan realistis, gore, darah, close-up gigi tajam, nuansa horor, tone gelap/kusam, motion blur berlebihan, kamera goyang, teks overlay, watermark, subtitle tertanam, logo merek, kerumunan kompleks, pencahayaan malam, efek suara menakutkan, buram, terdistorsi, huruf tak terbaca/pecah, tulisan berantakan, jelek, duplikat, morbid, dimutilasi, keluar frame, gambar buruk, mutasi, cacat anatomi, proporsi buruk, anggota tubuh berlebih, wajah kloning, cacat wajah, rambut terlihat di bawah hijab, hijab tidak lengkap.'
      const useEN = promptLanguage === 'EN'
      const normalized: Scene[] = list.map((raw: any) => {
        if (promptLanguage === 'JSON') {
          const trans = raw?.transition
          const transText = trans && typeof trans === 'object' ? `${String(trans.type || '-')}${trans?.to_scene ? ` → ${trans.to_scene}` : ''}` : String(raw?.transisi || raw?.transition || '-')
          return {
            beat: String(raw?.beat_goal || ''),
            visual: String(raw?.visual_description || ''),
            aksi: String(raw?.key_action || ''),
            dialog: String(raw?.dialog || ''),
            audio: String(raw?.audio || ''),
            exit: String(raw?.exit_state || ''),
            transisi: transText,
            style: String(prompt_meta?.animation_style || (useEN ? fallbackStyleEN : fallbackStyleID)),
            negative: String(raw?.negative_prompt || prompt_meta?.negative_prompt || (useEN ? fallbackNegativeEN : fallbackNegativeID)),
          }
        }
        const s = raw as Scene
        return {
          ...s,
          style: (raw as any).style || (useEN ? fallbackStyleEN : fallbackStyleID),
          negative: (raw as any).negative || (useEN ? fallbackNegativeEN : fallbackNegativeID),
        }
      })
      setScenes(normalized)
      if (promptLanguage === 'JSON' && prompt_meta) setJsonEnhanced({ prompt_meta, scenes: list })
      try {
        await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool_key: 'storyprompt', subject: 'Story', grade: ageGroup, style: genre, topic: storyIdea, story: characterDesc, negative: '', scene_count: list.length, model: 'gemini-2.5-flash', response_json: promptLanguage==='JSON' && prompt_meta ? { prompt_meta, scenes: list } : { scenes: list } }) })
      } catch {}
    } catch (e: any) {
      const raw = e?.raw_ai_text ? String(e.raw_ai_text) : ''
      const msg = e?.message || 'Gagal membuat prompt.'
      const snippet = raw ? `${(raw || '').slice(0, 200)}${raw.length>200?'...':''}` : ''
      toast({ variant: 'destructive', title: 'Gagal', description: `${msg}${snippet ? ` | Raw: ${snippet}` : ''}` })
      const content = raw ? `${msg}\n\n=== RAW AI TEXT ===\n${raw}` : msg
      setErrorContent(content)
      setErrorOpen(true)
      if (raw) console.error('RAW_AI_TEXT (generate):', raw)
    } finally { setLoading(false) }
  }

  const handleAnalyze = async () => {
    if (!storyIdea.trim()) return toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Jelaskan ide plot terlebih dahulu.' })
    setAnalysis(null)
    setAnalysisOpen(true)
    try {
      const { analysis } = await callApi('/api/story/analyze', { genre, ageGroup, storyIdea, characterDesc, moralLesson })
      setAnalysis(analysis)
    } catch (e: any) {
      setAnalysis({ error: e?.message || 'Gagal menganalisis.' })
    }
  }

  const handleScript = async () => {
    if (!storyIdea.trim()) return toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Jelaskan ide plot terlebih dahulu.' })
    setScriptOpen(true)
    setScriptText('')
    try {
      const { script } = await callApi('/api/story/script', { genre, ageGroup, storyIdea, characterDesc, moralLesson })
      setScriptText(script || '')
    } catch (e: any) {
      setScriptText(`Gagal membuat naskah: ${e?.message || ''}`)
    }
  }

  const buildSceneText = (s: Scene): string => {
    const isEN = promptLanguage === 'EN'
    const L = {
      style: isEN ? 'A. VISUAL STYLE' : 'A. GAYA VISUAL',
      beat: isEN ? 'B. BEAT/GOAL' : 'B. BEAT/TUJUAN',
      visual: isEN ? 'C. VISUAL DESCRIPTION' : 'C. DESKRIPSI VISUAL',
      action: isEN ? 'D. KEY ACTION' : 'D. AKSI UTAMA',
      dialogue: isEN ? 'E. DIALOGUE' : 'E. DIALOG',
      audio: isEN ? 'F. AUDIO' : 'F. AUDIO',
      exit: isEN ? 'G. EXIT STATE' : 'G. EXIT STATE',
      transition: isEN ? 'H. TRANSITION' : 'H. TRANSISI',
      negative: isEN ? 'I. NEGATIVE PROMPT/FINAL INSTRUCTION' : 'I. NEGATIVE PROMPT/FINAL INSTRUCTION',
    }
    return [
      `${L.style}: ${s.style || '-'}`,
      `${L.beat}:\n${s.beat}`,
      `${L.visual}:\n${s.visual}`,
      `${L.action}:\n${s.aksi}`,
      `${L.dialogue}:\n${s.dialog || '-'}`,
      `${L.audio}:\n${s.audio}`,
      `${L.exit}:\n${s.exit}`,
      `${L.transition}:\n${s.transisi}`,
      `${L.negative}:\n${s.negative || '-'}`,
    ].join('\n')
  }

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border bg-emerald-50 p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold text-emerald-700">{value}</div>
    </div>
  )

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 text-center">
          <div className="inline-block rounded-2xl bg-card p-4 shadow">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Story Prompt Generator</h1>
          </div>
          <p className="mt-3 text-muted-foreground">Buat outline cerita animasi anak.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Pengaturan Prompt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Pilih Genre</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Dongeng','Petualangan','Fabel','Cerita Legenda','Humor Anak','Cerita bergambar'].map((g) => (
                    <Button key={g} type="button" variant={genre===g?'default':'outline'} className={cn('rounded-xl', genre===g?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setGenre(g)} disabled={loading}>{g}</Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Pilih Kelompok Usia</label>
                <div className="grid grid-cols-3 gap-2">
                  {['2-4','4-6','6-8','8-10','10-12','12-14'].map((a)=>(
                    <Button key={a} type="button" variant={ageGroup===a?'default':'outline'} className={cn('rounded-xl', ageGroup===a?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setAgeGroup(a)} disabled={loading}>{a}</Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Detail Cerita - Ide Plot</label>
                <Textarea rows={3} value={storyIdea} onChange={(e)=>setStoryIdea(e.target.value)} placeholder="Contoh: Seekor anak kucing pemberani yang ingin belajar terbang..." disabled={loading} />
                <div className="mt-2 flex gap-2">
                  <Button type="button" onClick={handleRandomIdea} className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white" disabled={loading}><Dice5 className="mr-2 h-4 w-4"/>Ide Acak</Button>
                  <Button type="button" onClick={handleDevelop} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white" disabled={loading}><Lightbulb className="mr-2 h-4 w-4"/>Kembangkan</Button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Jelaskan Karakter (opsional)</label>
                <Textarea rows={2} value={characterDesc} onChange={(e)=>setCharacterDesc(e.target.value)} placeholder="Contoh: Kiki, kucing oranye ceria & ceroboh. Budi, burung hantu bijaksana." disabled={loading} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Pelajaran/Moral (opsional)</label>
                <Textarea rows={2} value={moralLesson} onChange={(e)=>setMoralLesson(e.target.value)} placeholder="Contoh: Pentingnya keberanian untuk mencoba hal baru." disabled={loading} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Percakapan</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['ID','EN','JV','ES','FR','ZH','DE','AR'] as const).map((l)=>(
                    <Button key={l} type="button" variant={language===l?'default':'outline'} className={cn('rounded-xl', language===l?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setLanguage(l)} disabled={loading}>{l}</Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Pilihan Prompt</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button type="button" variant={promptLanguage==='JSON'?'default':'outline'} className={cn('rounded-xl', promptLanguage==='JSON'?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setPromptLanguage('JSON')} disabled={loading}>Enhanced JSON Prompt (English)</Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={promptLanguage==='EN'?'default':'outline'} className={cn('rounded-xl', promptLanguage==='EN'?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setPromptLanguage('EN')} disabled={loading}>EN Prompt</Button>
                    <Button type="button" variant={promptLanguage==='ID'?'default':'outline'} className={cn('rounded-xl', promptLanguage==='ID'?'bg-gradient-to-r from-purple-600 to-blue-600 text-white':'')} onClick={()=>setPromptLanguage('ID')} disabled={loading}>ID Prompt</Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Jumlah Scene</label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={numScenes}
                  onChange={(e)=>{
                    const v = parseInt(e.target.value || '1', 10)
                    const clamped = Math.min(99, Math.max(1, Number.isFinite(v) ? v : 1))
                    setNumScenes(clamped)
                  }}
                  disabled={loading}
                />
              </div>
              <div className="pt-2">
                <Button onClick={handleGenerate} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white" disabled={loading}>{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Wand2 className="h-4 w-4"/>} <span className="ml-2">Buat Prompt Detail</span></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Hasil Prompt Detail</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stat('Scene', scenes.length ? String(scenes.length) : '-')}
                {stat('Durasi', scenes.length ? formatDurationID(scenes.length * 8) : '-')}
                {stat('Dibuat', scenes.length ? new Date().toLocaleDateString('id-ID') : '-')}
                {stat('Genre', genre || '-')}
              </div>
              <Separator />
              {!loading && scenes.length===0?(
                <div className="py-16 text-center text-muted-foreground">Hasil detail prompt per-scene akan muncul di sini.</div>
              ):null}
              {loading?(
                <div className="py-16 text-center"><div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-primary/30 border-t-primary"/></div>
              ):null}
              {promptLanguage === 'JSON' && jsonEnhanced ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-2xl border bg-card p-4 shadow-sm bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background">
                    <h3 className="text-lg font-semibold">Enhanced JSON Result</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{String(jsonEnhanced?.prompt_meta?.title || 'Tanpa Judul')} • {String(jsonEnhanced?.prompt_meta?.total_scenes || scenes.length)} scene • {String(jsonEnhanced?.prompt_meta?.total_duration || `${scenes.length*8} detik`)}</p>
                    <div className="mt-4">
                      <Button variant="default" className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white" onClick={()=> setJsonDialogOpen(true)}>Lihat JSON</Button>
                    </div>
                  </div>
                </div>
              ) : (
                scenes.length>0? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenes.map((s,idx)=>(
                      <div key={idx} className="rounded-2xl border bg-card p-4 shadow-sm bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background">
                        <h3 className="text-lg font-semibold">Scene {idx+1}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">Durasi 8 Detik</p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="default" className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white" onClick={()=>{ setSelectedScene(s); setSceneDialogText(buildSceneText(s)); setSceneDialogOpen(true) }}>Lihat Prompt</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null
              )}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  onClick={handleSavePrompts}
                  disabled={loading || scenes.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" /> Simpan Prompt
                </Button>
                <Button onClick={handleScript} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">Buat Naskah Lengkap dengan AI</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button asChild variant="secondary" className="rounded-2xl"><Link href="/history?tool=storyprompt"><History className="h-4 w-4 mr-2"/>Riwayat Prompt</Link></Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleAnalyze}>Analisis Kelayakan</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
          <DialogContent className="rounded-2xl sm:max-w-xl">
            <DialogHeader><DialogTitle>Analisis Kelayakan</DialogTitle></DialogHeader>
            {analysis? (
              <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">{JSON.stringify(analysis,null,2)}</pre>
            ): (
              <div className="py-10 text-center text-muted-foreground">Memuat...</div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={sceneDialogOpen} onOpenChange={setSceneDialogOpen}>
          <DialogContent className="rounded-2xl sm:max-w-xl">
            <DialogHeader><DialogTitle>Detail Prompt Scene</DialogTitle></DialogHeader>
            {selectedScene ? (
              <div className="space-y-2 text-sm">
                <p><strong>{promptLanguage==='EN'?'A. VISUAL STYLE':'A. GAYA VISUAL'}:</strong><br/> {selectedScene.style || '-'}</p>
                <p><strong>{promptLanguage==='EN'?'B. BEAT/GOAL':'B. BEAT/TUJUAN'}:</strong><br/> {selectedScene.beat}</p>
                <p><strong>{promptLanguage==='EN'?'C. VISUAL DESCRIPTION':'C. DESKRIPSI VISUAL'}:</strong><br/> {selectedScene.visual}</p>
                <p><strong>{promptLanguage==='EN'?'D. KEY ACTION':'D. AKSI UTAMA'}:</strong><br/> {selectedScene.aksi}</p>
                <p><strong>{promptLanguage==='EN'?'E. DIALOGUE':'E. DIALOG'}:</strong><br/> {selectedScene.dialog || '-'}</p>
                <p><strong>F. AUDIO:</strong><br/> {selectedScene.audio}</p>
                <p><strong>G. EXIT STATE:</strong><br/> {selectedScene.exit}</p>
                <p><strong>{promptLanguage==='EN'?'H. TRANSITION':'H. TRANSISI'}:</strong><br/> {selectedScene.transisi}</p>
                <p><strong>I. NEGATIVE PROMPT/FINAL INSTRUCTION:</strong><br/> {selectedScene.negative || '-'}</p>
              </div>
            ) : null}
            <div className="text-right">
              <Button className="rounded-xl" onClick={()=>{ navigator.clipboard.writeText(sceneDialogText); toast({ title:'Disalin', description:'Prompt scene berhasil disalin.' }) }}>Salin</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
          <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Enhanced JSON</DialogTitle></DialogHeader>
            <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">{JSON.stringify(jsonEnhanced, null, 2)}</pre>
            <div className="text-right">
              <Button className="rounded-xl" onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(jsonEnhanced, null, 2)); toast({ title:'Disalin', description:'JSON berhasil disalin.' }) }}>Salin</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
          <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Detail Error</DialogTitle></DialogHeader>
            <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">{errorContent}</pre>
            <div className="text-right">
              <Button className="rounded-xl" onClick={()=>{ navigator.clipboard.writeText(errorContent); toast({ title:'Disalin', description:'Detail error berhasil disalin.' }) }}>Salin</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={scriptOpen} onOpenChange={setScriptOpen}>
          <DialogContent className="rounded-2xl sm:max-w-xl">
            <DialogHeader><DialogTitle>Naskah Lengkap</DialogTitle></DialogHeader>
            <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap">{scriptText}</pre>
          </DialogContent>
        </Dialog>

      </div>
    </section>
  )
}
