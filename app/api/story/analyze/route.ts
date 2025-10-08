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

    const prompt = `You are a professional script consultant specializing in children's animated content for platforms like YouTube. Analyze the provided story idea based on key feasibility metrics. Provide a concise, constructive, and encouraging analysis.

CRITICAL INSTRUCTIONS:
1. Output Format: Your response MUST be a single, valid JSON object. Do not include any text or markdown before or after it.
2. Language: The analysis text within the JSON MUST be in Indonesian.

JSON KEYS (schema):
- overall_score: number (1-10)
- summary: string (ringkasan 1 kalimat)
- strengths: string[]
- weaknesses: string[]
- recommendations: string[]

Story Details:
- Genre: ${genre}
- Target Audience: ${ageGroup} years old
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified.'}
- Moral Lesson: ${moralLesson || 'Not specified.'}

Analyze the idea and provide your feedback in the specified JSON structure.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 35000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
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
    return NextResponse.json({ analysis: json })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
