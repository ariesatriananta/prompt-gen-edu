import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { storyIdea = '', model = 'gemini-2.5-flash-preview-05-20' } = body || {}
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Server missing GEMINI_API_KEY' }, { status: 500 })
    if (!storyIdea) return NextResponse.json({ error: 'Missing storyIdea' }, { status: 400 })

    const prompt = `Berdasarkan ide cerita anak berikut: "${storyIdea}", kembangkan menjadi JSON dengan keys: plot (string, 1 paragraf singkat), characters (string, 1 kalimat), moral (string, 1 kalimat). Kembalikan HANYA JSON.`
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      const raw = await res.text()
      return NextResponse.json({ error: `Gemini error ${res.status}: ${raw}` }, { status: 502 })
    }
    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return NextResponse.json({ error: 'AI tidak mengembalikan hasil.' }, { status: 502 })
    let json: any = null
    try { json = JSON.parse(text) } catch {}
    if (!json || typeof json !== 'object') return NextResponse.json({ error: 'Format AI tidak valid.' }, { status: 502 })
    return NextResponse.json({ result: json })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
