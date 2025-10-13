"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

type Item = {
  id: string
  created_at: string
  tool_key: string
  subject?: string | null
  grade?: string | null
  style?: string | null
  topic?: string | null
  scene_count?: number | null
}

export default function HistoryPage() {
  const [tool, setTool] = useState('storyprompt')
  const [q, setQ] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState(0)
  const limit = 20
  const router = useRouter()

  const load = async (append = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tool, limit: String(limit), from: String(append ? from : 0) })
      if (q) params.set('q', q)
      if (start) params.set('start', start)
      if (end) params.set('end', end)
      const res = await fetch(`/api/history?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat riwayat')
      const list = json.items as Item[]
      setItems((prev) => (append ? [...prev, ...list] : list))
      if (append) setFrom(from + limit)
      else setFrom(limit)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal memuat', description: e?.message || 'Coba lagi nanti.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openDetail = (id: string) => router.push(`/history/${id}`)

  const loadIntoForm = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat detail')
      const item = json.item || {}
      const toolKey = (item.tool_key || '').toLowerCase()
      if (toolKey === 'storyprompt') {
        try { localStorage.setItem('story_history_prefill', JSON.stringify(item)) } catch {}
        router.push('/tools/storyprompt')
      } else if (toolKey === 'motionprompt') {
        try { localStorage.setItem('mp_history_prefill', JSON.stringify(item)) } catch {}
        router.push('/tools/motionprompt')
      } else {
        router.push(`/history/${id}`)
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: e?.message || 'Coba lagi.' })
    }
  }

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-background" />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-xl" onClick={() => router.back()} aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Riwayat Prompt</h1>
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-sm mb-1">Tool</label>
              <Select value={tool} onValueChange={setTool}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="storyprompt">StoryPrompt</SelectItem>
                  <SelectItem value="motionprompt">MotionPrompt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm mb-1">Cari Materi</label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="misal: daur air" className="rounded-xl" />
            </div>
            <div>
              <label className="block text-sm mb-1">Mulai</label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="block text-sm mb-1">Sampai</label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-xl" onClick={() => load(false)} disabled={loading}>Terapkan</Button>
            <Button className="rounded-xl" variant="outline" onClick={() => { setQ(''); setStart(''); setEnd(''); setFrom(0); load(false) }} disabled={loading}>Reset</Button>
          </div>
        </Card>

        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <div className="font-medium">{new Date(it.created_at).toLocaleString('id-ID')}</div>
                <div className="text-muted-foreground">{it.tool_key} • {it.subject || '-'} • {it.grade || '-'} • {it.scene_count || 0} scene • {it.topic || '-'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openDetail(it.id)}>Detail</Button>
                <Button size="sm" className="rounded-xl" onClick={() => loadIntoForm(it.id)}>Muat ke Form</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button variant="secondary" className="rounded-xl" onClick={() => load(true)} disabled={loading}>{loading ? 'Memuat...' : 'Load More'}</Button>
        </div>
      </main>
    </section>
  )
}

