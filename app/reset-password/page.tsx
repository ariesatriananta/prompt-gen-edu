"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'

const RequestSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi.' }).email({ message: 'Format email tidak valid.' }),
})

const UpdateSchema = z
  .object({
    password: z.string().min(8, 'Minimal 8 karakter'),
    confirm: z.string().min(8, 'Minimal 8 karakter'),
  })
  .refine((val) => val.password === val.confirm, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirm'],
  })

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const search = useSearchParams()
  const router = useRouter()
  const [mode, setMode] = useState<'request' | 'update'>('request')
  const [busy, setBusy] = useState(false)

  // Exchange code from email link into a session, then allow updating password
  useEffect(() => {
    const code = search.get('code')
    const err = search.get('error')
    const errDesc = search.get('error_description')

    if (err) {
      toast({ variant: 'destructive', title: 'Tautan tidak valid/expired', description: decodeURIComponent(errDesc ?? String(err)) })
      setMode('request')
    }

    const handleHashTokens = async () => {
      // Handle legacy/hash style: #access_token=...&refresh_token=...&type=recovery
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (!hash?.includes('access_token')) return false
      const params = new URLSearchParams(hash.slice(1))
      const access_token = params.get('access_token') || ''
      const refresh_token = params.get('refresh_token') || ''
      const type = params.get('type')
      if (!access_token || !refresh_token || type !== 'recovery') return false
      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error
      return true
    }

    const doExchange = async () => {
      try {
        setBusy(true)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setMode('update')
          return
        }
        const ok = await handleHashTokens()
        if (ok) {
          setMode('update')
          return
        }
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Tautan tidak valid', description: e?.message ?? 'Gagal memproses tautan.' })
      } finally {
        setBusy(false)
      }
    }
    doExchange()
  }, [search, supabase])

  // Request reset email form
  const reqForm = useForm<z.infer<typeof RequestSchema>>({ resolver: zodResolver(RequestSchema), defaultValues: { email: '' } })
  const submitRequest = async (values: z.infer<typeof RequestSchema>) => {
    try {
      setBusy(true)
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast({ title: 'Email terkirim', description: 'Periksa kotak masuk untuk ubah kata sandi.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal mengirim email', description: e?.message ?? 'Coba lagi nanti.' })
    } finally {
      setBusy(false)
    }
  }

  // Update password form
  const updForm = useForm<z.infer<typeof UpdateSchema>>({ resolver: zodResolver(UpdateSchema), defaultValues: { password: '', confirm: '' } })
  const submitUpdate = async (values: z.infer<typeof UpdateSchema>) => {
    try {
      setBusy(true)
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) throw error
      toast({ title: 'Kata sandi diperbarui', description: 'Silakan login kembali.' })
      router.replace('/login')
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal memperbarui', description: e?.message ?? 'Coba lagi.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700/60 via-indigo-700/60 to-blue-700/60" />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-md">
          {mode === 'request' ? (
            <div>
              <h1 className="mb-1 text-lg font-semibold text-slate-900">Reset Kata Sandi</h1>
              <p className="mb-5 text-sm text-slate-600">Masukkan email akunmu. Kami akan mengirim tautan untuk mengubah kata sandi.</p>
              <Form {...reqForm}>
                <form onSubmit={reqForm.handleSubmit(submitRequest)} className="space-y-4" noValidate>
                  <FormField
                    control={reqForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="nama@domain.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90">
                    {busy ? 'Mengirim…' : 'Kirim Tautan'}
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <div>
              <h1 className="mb-1 text-lg font-semibold text-slate-900">Buat Kata Sandi Baru</h1>
              <p className="mb-5 text-sm text-slate-600">Masukkan kata sandi baru untuk akunmu.</p>
              <Form {...updForm}>
                <form onSubmit={updForm.handleSubmit(submitUpdate)} className="space-y-4" noValidate>
                  <FormField
                    control={updForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata sandi baru</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updForm.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ulangi kata sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90">
                    {busy ? 'Menyimpan…' : 'Simpan Kata Sandi'}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
