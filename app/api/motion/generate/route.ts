import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, model = 'gemini-2.5-flash-preview-05-20' } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Server missing GEMINI_API_KEY' }, { status: 500 })
    if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      // prevent cache issues
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Gemini error ${res.status}: ${text}` }, { status: 500 })
    }
    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return NextResponse.json({ text: text ?? '' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

