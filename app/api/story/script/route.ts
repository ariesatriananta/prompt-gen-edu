import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      genre = 'Dongeng',
      ageGroup = '4-6',
      storyIdea = '',
      characterDesc = '',
      moralLesson = '',
      model = 'gemini-2.5-flash-preview-05-20',
    } = body || {}
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Server missing GEMINI_API_KEY' }, { status: 500 })

    const prompt = `Buatkan naskah video storytelling anak bergaya Pixar berdasarkan ide berikut.
**Ide Pokok:** ${storyIdea}
**Karakter Utama:** ${characterDesc || 'Tidak ditentukan, biarkan AI berkreasi.'}
**Pesan Moral:** ${moralLesson || 'Tidak ditentukan, biarkan AI berkreasi.'}
Genre: ${genre}. Target usia: ${ageGroup} tahun.
Gunakan format multi-scene. Setiap scene tulis dengan:
SCENE NUMBER, TITLE, DURATION (6–10 detik), CORE SCENE DESCRIPTION, CINEMATOGRAPHY, LIGHTING & COLOR, SOUND & AMBIENCE, TRANSITION TO NEXT SCENE.
Berhenti saat cerita selesai. Bahasa Indonesia naratif lembut.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
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
    return NextResponse.json({ script: text })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
