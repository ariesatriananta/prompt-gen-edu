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

    const isEnhancedJson = String(promptLanguage).toUpperCase() === 'JSON'

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
      return parts.join(' ')
    }

    const totalDurationStr = formatDurationID(numScenes * 8)
    const prompt = isEnhancedJson
      ? `You are a careful JSON generator. Based on the following story details, return a SINGLE JSON object with two top-level keys: "prompt_meta" and "scenes".
STRICT RULES:
- Output MUST be valid JSON and nothing else.
- "scenes" MUST be an array with exactly ${numScenes} objects.
- For text fields inside each scene, use ${sceneLang}. Dialogue lines must use ${conversationLanguage}.
- Do NOT include markdown backticks.
- Keep every field concise: beat_goal ≤ 1 sentence, visual_description ≤ 2 sentences, key_action ≤ 1 sentence, audio ≤ 1 short phrase, exit_state ≤ 1 sentence, dialog ≤ 1 short line. Do not add extra explanations.

The JSON schema to follow exactly:
{
  "prompt_meta": {
    "title": "string",
    "genre": "string",
    "target_audience": "Children",
    "age_group": "${ageGroup} years old",
    "core_value": "string",
    "language": "${language}",
    "total_duration": "${totalDurationStr}",
    "total_scenes": ${numScenes},
    "creation_date": "${new Date().toISOString().slice(0,10)}",

    "animation_style": "3D Pixar-like, child-friendly, expressive faces",
    "technical": { "aspect_ratio": "16:9", "fps": 30, "resolution": "3840x2160" },
    "negative_prompt": "realistic gore, violence, blood, sharp teeth close-up, horror vibes, dark/gritty tone, excessive motion blur, shaky cam, text overlays, watermark, subtitles burned-in, brand logos, complex crowd scenes, night-time lighting, scary sound effects, blurry, distorted, watermark, subtitle, captions, unreadable letters, unclear letters, broken letters, messy letters, ugly, duplicate, morbid, mutilated, out of frame, poorly drawn, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, visible hair under hijab, incomplete hijab",
    "final_instruction": "Render all scenes in consistent 3D Pixar-like style with soft lighting and warm colors. Keep each scene ~8 seconds. Ensure child-safe content, readable compositions, smooth camera moves (no shaky cam), and gentle transitions. Maintain character continuity and props across scenes. No on-screen text unless specified in dialog; keep faces expressive and friendly."
  },
  "scenes": [
    {
      "scene_number": 1,
      "timecode": "0s–8s",
      "duration": "8 detik",
      "beat_goal": "string",
      "visual_description": "string",
      "key_action": "string",
      "dialog": "string (can be empty)",
      "audio": "string",
      "exit_state": "string",
      "transition": { "type": "cut|fade|dissolve|wipe", "to_scene": 2 },
      "negative_prompt": "string (optional)"
    }
  ]
}

Story Details:
- Title: ${storyIdea?.slice(0,50) || 'Untitled'}
- Genre: ${genre}
- Age Group: ${ageGroup}
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified, create creatively.'}
- Core Value/Moral: ${moralLesson || 'Not specified, create creatively.'}
Return ONLY the JSON.`
      : `Based on the following story details, generate a multi-scene story outline.
Generate a valid JSON array with exactly ${numScenes} scene objects.
CRITICAL INSTRUCTIONS FOR LANGUAGE:
1. All string values for keys "beat", "visual", "aksi", "audio", "exit", and "transisi" MUST be in ${sceneLang}.
2. The string value for the "dialog" key MUST be in ${conversationLanguage}. If no dialogue is needed, the value must be an empty string.

Each object in the array MUST follow this exact structure (exact keys):
{ "beat": "string", "visual": "string", "aksi": "string", "dialog": "string", "audio": "string", "exit": "string", "transisi": "string", "stability": "string" }.

Where "stability" is a short instruction to keep anatomy clean and camera stable (e.g., hands/fingers correct, no extra limbs, no shaky cam).

Story Details:
- Genre: ${genre}
- Target Audience: ${ageGroup} years old
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified, create creatively.'}
- Moral Lesson: ${moralLesson || 'Not specified, create creatively.'}
Return ONLY the JSON array.`

    const modelToUse = isEnhancedJson && model === 'gemini-2.5-flash-lite' ? 'gemini-2.5-flash' : model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`

    const looseParse = (raw: string): any | null => {
      try { return JSON.parse(raw) } catch {}
      try {
        const cleaned = raw
          .replace(/^```[a-zA-Z]*\n?/,'')
          .replace(/```\s*$/,'')
          .trim()
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          const inner = cleaned.slice(start, end + 1)
          return JSON.parse(inner)
        }
        const aStart = cleaned.indexOf('[')
        const aEnd = cleaned.lastIndexOf(']')
        if (aStart !== -1 && aEnd !== -1 && aEnd > aStart) {
          const innerA = cleaned.slice(aStart, aEnd + 1)
          return JSON.parse(innerA)
        }
      } catch {}
      return null
    }
    const callGemini = async (promptText: string) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: isEnhancedJson ? 6144 : 2048,
            responseMimeType: 'application/json',
          },
        }),
        cache: 'no-store',
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        const raw = await res.text()
        const msg = res.status === 429 ? 'Batas penggunaan tercapai. Coba lagi.' : `Gemini error ${res.status}`
        throw { message: msg, raw }
      }
      const data = await res.json()
      const parts: any[] = data?.candidates?.[0]?.content?.parts || []
      const text: string | undefined = parts.map((p: any) => p?.text || '').join('') || data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw { message: 'AI tidak mengembalikan hasil.' }
      return text
    }

    const pick = (obj: any, key: string) => (obj && typeof obj === 'object' ? obj[key] : undefined)
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    if (isEnhancedJson && numScenes > 10) {
      const chunkSize = 10
      const allScenes: any[] = []
      let meta: any = null

      for (let offset = 0; offset < numScenes; offset += chunkSize) {
        const count = Math.min(chunkSize, numScenes - offset)
        const enhancedPrompt = `You are a careful JSON generator. CONTINUE generating a SINGLE JSON object with two keys: "prompt_meta" and "scenes".
STRICT RULES:
- Output MUST be valid JSON ONLY (no markdown fences or explanations).
- Return exactly ${count} NEW scene objects in the "scenes" array for scene numbers ${offset + 1}..${offset + count} (inclusive) of ${numScenes} total.
- Language: use ${sceneLang} for all non-dialog fields; dialogue text in ${conversationLanguage}.
- Keep fields concise: beat_goal ≤ 1 sentence; visual_description ≤ 2 sentences; key_action ≤ 1 sentence; audio ≤ short phrase; exit_state ≤ 1 sentence; dialog ≤ 1 short line.

SCENE OBJECT SHAPE (exact keys and their order are recommended):
{
  "scene_number": number,
  "timecode": "${offset}s–${offset + 8}s" | "Xs–Ys",
  "duration": "8 detik",
  "beat_goal": "...",
  "visual_description": "...",
  "key_action": "...",
  "dialog": "...",
  "audio": "...",
  "exit_state": "...",
  "transition": { "type": "cut|fade|dissolve|wipe", "to_scene": number },
  "negative_prompt": "..." (optional)
}

META (include once; if not included, it's fine — server has defaults):
{
  "prompt_meta": {
    "title": "${(storyIdea || 'Untitled').slice(0,80)}",
    "genre": "${genre}",
    "target_audience": "Children",
    "age_group": "${ageGroup} years old",
    "core_value": "${moralLesson || ''}",
    "language": "${language}",
    "total_duration": "${numScenes * 8} detik",
    "total_scenes": ${numScenes},
    "creation_date": "${new Date().toISOString().slice(0,10)}",
    "animation_style": "3D Pixar-like, child-friendly, expressive faces",
    "technical": { "aspect_ratio": "16:9", "fps": 30, "resolution": "3840x2160" },
    "negative_prompt": "realistic gore, violence, blood, sharp teeth close-up, horror vibes, dark/gritty tone, excessive motion blur, shaky cam, text overlays, watermark, subtitles burned-in, brand logos, complex crowd scenes, night-time lighting, scary sound effects, blurry, distorted, watermark, subtitle, captions, unreadable letters, unclear letters, broken letters, messy letters, ugly, duplicate, morbid, mutilated, out of frame, poorly drawn, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, visible hair under hijab, incomplete hijab",
    "final_instruction": "Render all scenes in consistent 3D Pixar-like style with soft lighting and warm colors. Keep each scene ~8 seconds. Ensure child-safe content, readable compositions, smooth camera moves (no shaky cam), and gentle transitions. Maintain character continuity and props across scenes. No on-screen text unless specified in dialog; keep faces expressive and friendly."
  }
}

Story Details (context, do not echo back outside JSON):
- Title: ${storyIdea?.slice(0,50) || 'Untitled'}
- Genre: ${genre}
- Age Group: ${ageGroup}
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified, create creatively.'}
- Core Value/Moral: ${moralLesson || 'Not specified, create creatively.'}
Return ONLY the JSON.`

        let parsed: any = null
        let scenes: any[] | null = null
        let text = ''
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            text = await callGemini(enhancedPrompt)
          } catch (err: any) {
            if (attempt >= 3) {
              return NextResponse.json({ error: err?.message || 'Gagal memanggil AI', raw_ai_text: err?.raw || '' }, { status: 502 })
            }
            await sleep(500 * attempt)
            continue
          }
          parsed = looseParse(text)
          scenes = (pick(parsed, 'scenes') || pick(parsed, 'Scenes') || pick(parsed?.data || {}, 'scenes') || (Array.isArray(parsed) ? parsed : undefined)) as any[] | null
          if (Array.isArray(scenes)) break
          if (attempt < 3) await sleep(600 * attempt)
        }
        if (!Array.isArray(scenes)) {
          return NextResponse.json({ error: 'Format Enhanced JSON tidak valid.', raw_ai_text: text }, { status: 502, headers: { 'x-ai-text': encodeURIComponent(text || '') } })
        }
        if (!meta) meta = pick(parsed, 'prompt_meta') || pick(parsed, 'meta') || pick(parsed, 'promptMeta') || null
        allScenes.push(...scenes)
      }

      // Normalize numbering/timecodes and meta totals
      const merged = allScenes.slice(0, numScenes).map((s, i) => {
        const start = i * 8
        const end = (i + 1) * 8
        const timecode = `${start}s–${end}s`
        const toScene = i + 2 <= numScenes ? i + 2 : i + 1
        const transitionRaw: any = typeof s?.transition === 'object' ? s.transition : null
        const transition = {
          type: String(transitionRaw?.type || 'cut'),
          to_scene: Number.isFinite(transitionRaw?.to_scene) ? transitionRaw.to_scene : toScene,
        }
        return {
          scene_number: i + 1,
          timecode,
          duration: '8 detik',
          beat_goal: String(s?.beat_goal || s?.beat || ''),
          visual_description: String(s?.visual_description || s?.visual || ''),
          key_action: String(s?.key_action || s?.aksi || ''),
          dialog: String(s?.dialog || ''),
          audio: String(s?.audio || ''),
          exit_state: String(s?.exit_state || s?.exit || ''),
          transition,
          ...(s?.negative_prompt ? { negative_prompt: String(s.negative_prompt) } : {}),
        }
      })

      if (!meta) {
        meta = {
          title: String((storyIdea || 'Untitled')).slice(0, 80),
          genre,
          target_audience: 'Children',
          age_group: `${ageGroup} years old`,
          core_value: moralLesson || '',
          language,
          total_duration: `${formatDurationID(merged.length * 8)}`,
          total_scenes: merged.length,
          creation_date: new Date().toISOString().slice(0, 10),
          animation_style: '3D Pixar-like, child-friendly, expressive faces',
          technical: { aspect_ratio: '16:9', fps: 30, resolution: '3840x2160' },
          negative_prompt:
            'realistic gore, violence, blood, sharp teeth close-up, horror vibes, dark/gritty tone, excessive motion blur, shaky cam, text overlays, watermark, subtitles burned-in, brand logos, complex crowd scenes, night-time lighting, scary sound effects, blurry, distorted, watermark, subtitle, captions, unreadable letters, unclear letters, broken letters, messy letters, ugly, duplicate, morbid, mutilated, out of frame, poorly drawn, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, visible hair under hijab, incomplete hijab',
          final_instruction:
            'Render all scenes in consistent 3D Pixar-like style with soft lighting and warm colors. Keep each scene ~8 seconds. Ensure child-safe content, readable compositions, smooth camera moves (no shaky cam), and gentle transitions. Maintain character continuity and props across scenes. No on-screen text unless specified in dialog; keep faces expressive and friendly.',
        }
      } else {
        meta.total_scenes = merged.length
        meta.total_duration = `${formatDurationID(merged.length * 8)}`
      }

      return NextResponse.json({ scenes: merged, prompt_meta: meta })
    }

    // Enhanced JSON path (≤10 scenes): single call with retries
    if (isEnhancedJson) {
      let text = ''
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          text = await callGemini(prompt)
        } catch (err: any) {
          if (attempt >= 3) return NextResponse.json({ error: err?.message || 'Gagal memanggil AI', raw_ai_text: err?.raw || '' }, { status: 502 })
          await sleep(500 * attempt)
          continue
        }
        const parsed: any = looseParse(text)
        const scenes = (pick(parsed, 'scenes') || pick(parsed, 'Scenes') || (Array.isArray(parsed) ? parsed : undefined)) as any[] | undefined
        let meta = pick(parsed, 'prompt_meta') || pick(parsed, 'promptMeta') || pick(parsed, 'meta') || null
        if (Array.isArray(scenes)) {
          if (!meta) {
            meta = {
              title: String((storyIdea || 'Untitled')).slice(0, 80),
              genre,
              target_audience: 'Children',
              age_group: `${ageGroup} years old`,
              core_value: moralLesson || '',
              language,
              total_duration: `${formatDurationID((scenes as any[]).length * 8)}`,
              total_scenes: (scenes as any[]).length,
              creation_date: new Date().toISOString().slice(0, 10),
              animation_style: '3D Pixar-like, child-friendly, expressive faces',
              technical: { aspect_ratio: '16:9', fps: 30, resolution: '3840x2160' },
              negative_prompt:
                'realistic gore, violence, blood, sharp teeth close-up, horror vibes, dark/gritty tone, excessive motion blur, shaky cam, text overlays, watermark, subtitles burned-in, brand logos, complex crowd scenes, night-time lighting, scary sound effects, blurry, distorted, watermark, subtitle, captions, unreadable letters, unclear letters, broken letters, messy letters, ugly, duplicate, morbid, mutilated, out of frame, poorly drawn, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, visible hair under hijab, incomplete hijab',
              final_instruction:
                'Render all scenes in consistent 3D Pixar-like style with soft lighting and warm colors. Keep each scene ~8 seconds. Ensure child-safe content, readable compositions, smooth camera moves (no shaky cam), and gentle transitions. Maintain character continuity and props across scenes. No on-screen text unless specified in dialog; keep faces expressive and friendly.',
            }
          }
          return NextResponse.json({ scenes, prompt_meta: meta })
        }
        if (attempt < 3) await sleep(600 * attempt)
        else return NextResponse.json({ error: 'Format Enhanced JSON tidak valid.', raw_ai_text: text }, { status: 502 })
      }
    }

    // Non-enhanced path (EN/ID): apply batching when >10 scenes
    if (!isEnhancedJson && numScenes > 10) {
      const chunkSize = 10
      const allScenes: any[] = []
      for (let offset = 0; offset < numScenes; offset += chunkSize) {
        const count = Math.min(chunkSize, numScenes - offset)
        const batchPrompt = `Based on the following story details, generate a valid JSON array with EXACTLY ${count} scene objects.
CRITICAL LANGUAGE:
- All values for keys "beat", "visual", "aksi", "audio", "exit", and "transisi" MUST be in ${sceneLang}.
- The value for key "dialog" MUST be in ${conversationLanguage}. If no dialogue, use empty string.
STRUCTURE per item (exact keys): { "beat": "string", "visual": "string", "aksi": "string", "dialog": "string", "audio": "string", "exit": "string", "transisi": "string", "stability": "string" }.
"stability" should be a short instruction like: maintain correct anatomy (hands/fingers/limbs/face), avoid deformations/extra limbs, keep camera stable (no shaky cam), minimal motion blur.
Do NOT include markdown fences or explanations.
Context:
- Genre: ${genre}
- Target Audience: ${ageGroup} years old
- Plot Idea: ${storyIdea}
- Characters: ${characterDesc || 'Not specified, create creatively.'}
- Moral Lesson: ${moralLesson || 'Not specified, create creatively.'}
Return ONLY the JSON array.`

        let parsed: any = null
        let scenes: any[] | null = null
        let text = ''
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            text = await callGemini(batchPrompt)
          } catch (err: any) {
            if (attempt >= 3) {
              return NextResponse.json({ error: err?.message || 'Gagal memanggil AI', raw_ai_text: err?.raw || '' }, { status: 502 })
            }
            await sleep(500 * attempt)
            continue
          }
          parsed = looseParse(text)
          if (Array.isArray(parsed)) { scenes = parsed; break }
          if (parsed && Array.isArray(parsed.scenes)) { scenes = parsed.scenes; break }
          if (attempt < 3) await sleep(600 * attempt)
        }
        if (!Array.isArray(scenes)) {
          return NextResponse.json({ error: 'Format AI tidak valid.', raw_ai_text: text }, { status: 502 })
        }
        allScenes.push(...scenes)
      }
      return NextResponse.json({ scenes: allScenes.slice(0, numScenes) })
    }

    // Non-enhanced path: single call returns array of simple scenes, with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      let text: string
      try {
        text = await callGemini(prompt)
      } catch (err: any) {
        if (attempt >= 3) return NextResponse.json({ error: err?.message || 'Gagal memanggil AI', raw_ai_text: err?.raw || '' }, { status: 502 })
        await sleep(500 * attempt)
        continue
      }
      const parsed: any = looseParse(text)
      if (Array.isArray(parsed)) return NextResponse.json({ scenes: parsed })
      if (parsed && Array.isArray(parsed.scenes)) return NextResponse.json({ scenes: parsed.scenes })
      if (attempt < 3) await sleep(600 * attempt)
      else return NextResponse.json({ error: 'Format AI tidak valid.', raw_ai_text: text }, { status: 502 })
    }
    return NextResponse.json({ error: 'Format AI tidak valid.' }, { status: 502 })
  } catch (e: any) {
    const aborted = e?.name === 'AbortError'
    return NextResponse.json({ error: aborted ? 'Permintaan timeout. Coba lagi.' : e?.message || 'Internal error' }, { status: 500 })
  }
}
