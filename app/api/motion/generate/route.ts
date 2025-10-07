import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, model = 'gemini-2.5-flash-preview-05-20' } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Server missing GEMINI_API_KEY' }, { status: 500 })
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000) // 20s timeout
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        cache: 'no-store',
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      const raw = await res.text()
      const msg = (() => {
        if (res.status === 401 || res.status === 403) return 'Kunci API tidak valid atau akses ditolak.'
        if (res.status === 429) return 'Batas penggunaan (rate limit) tercapai. Coba lagi nanti.'
        if (res.status >= 500) return 'Layanan Gemini sedang bermasalah. Coba beberapa saat lagi.'
        return `Gemini error ${res.status}: ${raw}`
      })()
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return NextResponse.json({ error: 'AI tidak mengembalikan hasil.' }, { status: 502 })
    return NextResponse.json({ text })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
