# AGENTS.md — Pedoman Agen untuk Prompt-Gen-Edu

Dokumen ini memberi instruksi ringkas dan operasional untuk agen dalam repo ini.

Prioritas instruksi:
1) Instruksi langsung di chat > 2) AGENTS.md (file ini) > 3) README/konfigurasi lain.
Scope: berlaku untuk seluruh repo kecuali ada AGENTS.md yang lebih dalam (override).

## Gaya Kode & Teknologi
- Next.js App Router, TypeScript, React Server/Client Components.
- UI: shadcn/ui + Tailwind. Gunakan komponen yang sudah ada (Button, Dialog, Toast, Card, Input, dll.).
- Toast: WAJIB gunakan `import { toast } from '@/hooks/use-toast'` (bukan dari lokasi lain).
- Ikuti style yang sudah ada (gradien brand: `bg-gradient-to-r from-purple-600 to-blue-600 text-white`).
- Hindari komentar berlebihan dan perubahan yang tidak terkait task.

## Akses & Otentikasi
- Middleware melindungi semua halaman non‑publik. Jangan menonaktifkannya.
- Disabled/trial:
  - Jika `profiles.disabled = true` atau `profiles.trial_ends_at < now`, sesi harus di-kill, redirect ke login, dan tampilkan toast sesuai.
  - Cek ini sudah ditegakkan di `app/layout.tsx`. Pertahankan pola ini pada perubahan berikutnya.

## Hak Akses Tools (Member vs Admin)
- Admin: akses semua tools.
- Member: hanya tools yang tercatat di `member_tools` (kolom `profile_id`, `tool_id`).
- Sidebar harus mem-filter item Tools sesuai akses (sudah dilakukan di `components/sidebar.tsx` via props `allowedKeys`, `role`).
- Tool key ↔ path slug: key harus sama dengan slug terakhir URL (mis. `/tools/motionprompt` → key `motionprompt`). Jika beda, tambahkan mapping eksplisit.

### Guard Akses Halaman Tool (Server)
Gunakan layout server per tool dan util `enforceToolAccess(toolKey)` agar akses diverifikasi sebelum render (tanpa flicker):

```tsx
// app/tools/<tool>/layout.tsx
import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('<toolKey>')
  return <>{children}</>
}
```

Parent `app/tools/layout.tsx` hanya memastikan user sudah login. Status `disabled/trial` dicek global di `app/layout.tsx`.

## Pola Error & Notifikasi
- Gunakan toast destruktif untuk error (`variant: 'destructive'`).
- Hindari Alert banner permanen untuk error rutin; gunakan snackbar/toast.

## MotionPrompt
- Sumber toast dari `@/hooks/use-toast`.
- Ekspor “Simpan Prompt” menghasilkan 2 file TXT (ID & EN) + header metadata.
- Estimasi durasi tampil human‑friendly (detik→menit/jam) via util `formatDurationID`.

## Admin Users
- Gunakan toast untuk semua aksi (sukses/gagal): create, update, delete, kelola tools.
- Setelah aksi penting, panggil re-fetch daftar users (`GET /api/admin/users`) agar sinkron.
- Tombol Tools menampilkan jumlah tools yang dimiliki; highlight kuning jika `0 Tools`.

## Environment
Wajib tersedia di dev/prod:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## Jalankan Proyek
- `pnpm install`
- `pnpm dev` → http://localhost:3000

## Konvensi Lain
- Jangan menambahkan dependency baru tanpa kebutuhan kuat.
- Patch fokus pada task. Hindari refactor besar di luar lingkup.
- Bila menambah API, letakkan di `app/api/.../route.ts` dan selalu validasi input.
