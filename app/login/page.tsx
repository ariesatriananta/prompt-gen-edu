"use client"
import Link from 'next/link'
import { useEffect } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const LoginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi.' }).email({ message: 'Format email tidak valid.' }),
  password: z.string({ required_error: 'Kata sandi wajib diisi.' }).min(1, { message: 'Kata sandi wajib diisi.' }),
  remember: z.boolean().optional(),
})

export default function LoginPage() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.replace('/')
    })
  }, [])

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onTouched',
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
      if (error) throw error
      toast({ title: 'Masuk berhasil', description: `Selamat datang, ${values.email}` })
      window.location.href = '/'
    } catch (err: any) {
      const rawMsg = String(err?.message ?? '')
      const msg = rawMsg.toLowerCase().includes('invalid') ? 'Email atau kata sandi salah.' : rawMsg || 'Terjadi kesalahan pada server.'
      form.setError('password', { type: 'server', message: msg })
      // @ts-ignore
      if (form.setFocus) form.setFocus('password')
      toast({ variant: 'destructive', title: 'Login gagal', description: msg })
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700/60 via-indigo-700/60 to-blue-700/60" />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex aspect-square size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <Wand2 className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none text-slate-900">ClassToon</h1>
              <p className="mt-0.5 text-xs text-slate-500">Masuk untuk mulai berkarya</p>
            </div>
          </div>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nama@domain.com" className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-300 accent-indigo-600"
                    checked={form.watch('remember')}
                    onChange={(e) => form.setValue('remember', e.target.checked)}
                  />
                  Ingat saya
                </label>
                <Link href="/reset-password" className="text-indigo-700 underline-offset-4 hover:underline">Lupa sandi?</Link>
              </div>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 disabled:opacity-60"
              >
                {form.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </Form>

          {/* <p className="mt-4 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link href="#" className="text-indigo-700 underline-offset-4 hover:underline">Daftar</Link>
          </p> */}
        </div>
      </div>
    </main>
  )
}
