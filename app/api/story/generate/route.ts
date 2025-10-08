import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      genre = 'Dongeng',
      ageGroup = '4-6',
      language = 'ID', // dialog language
      promptLanguage = 'JSON', // 'JSON' | 'EN' | 'ID'
      storyIdea = '',
      characterDesc = '',
      moralLesson = '',
      numScenes = 8,
      model = 'gemini-2.5-flash-lite',
    } = body || {}
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Server missing GEMINI_API_KEY' }, { status: 500 })

    const langMap: Record<string, string> = { ID: 'Indonesian', EN: 'English', JV: 'Javanese', ES: 'Spanish', FR: 'French', ZH: 'Mandarin Chinese', DE: 'German', AR: 'Arabic' }
    const conversationLanguage = langMap[language] || 'Indonesian'

    const sceneLang = promptLanguage === 'EN' ? 'English' : 'Indonesian'

    const prompt = `Based on the following story details, generate a multi-scene story outline.
Generate a valid JSON array with exactly ${numScenes} scene objects.
CRITICAL INSTRUCTIONS FOR LANGUAGE:
1. All string values for keys "beat", "visual", "aksi", "audio", "exit", and "transisi" MUST be in ${sceneLang}.
2. The string value for the "dialog" key MUST be in ${conversationLanguage}. If no dialogue is needed, the value must be an empty string.

Each object in the array MUST follow this exact structure:
{ "beat": "string", "visual": "string", "aksi": "string", "dialog": "string", "audio": "string", "exit": "string", "transisi": "string" }.

Story Details:
- Genre: ${genre}
- Target Audience: ${ageGroup} years old
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified, create creatively.'}
- Moral Lesson: ${moralLesson || 'Not specified, create creatively.'}
Return ONLY the JSON array.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const raw = await res.text()
      const msg = res.status === 429 ? 'Batas penggunaan tercapai. Coba lagi.' : `Gemini error ${res.status}: ${raw}`
      return NextResponse.json({ error: msg }, { status: 502 })
    }
    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return NextResponse.json({ error: 'AI tidak mengembalikan hasil.' }, { status: 502 })
    let scenes: any = null
    try { scenes = JSON.parse(text) } catch {}
    if (!Array.isArray(scenes)) return NextResponse.json({ error: 'Format AI tidak valid.' }, { status: 502, headers: { 'x-ai-text': encodeURIComponent(text || '') } })
    return NextResponse.json({ scenes })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
