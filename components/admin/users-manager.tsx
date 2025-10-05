"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { RefreshCcw } from 'lucide-react'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'member'
  trial_ends_at: string
  created_at: string
}

type Tool = { id: string; key: string; name: string }

export default function UsersManager({
  initialProfiles,
  tools,
}: {
  initialProfiles: Profile[]
  tools: Tool[]
}) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refetchProfiles = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat daftar pengguna')
      setProfiles((json?.profiles || []).filter(Boolean))
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal memuat', description: e?.message || 'Tidak dapat memuat pengguna.' })
    } finally {
      setRefreshing(false)
    }
  }

  const updateProfile = async (id: string, patch: Partial<Profile> & { password?: string }) => {
    try {
      setLoadingId(id)
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan perubahan')
      if (json.profile) setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...json.profile } : p)))
      toast({ title: 'Tersimpan', description: 'Perubahan profil berhasil disimpan.' })
      await refetchProfiles()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan.' })
    } finally {
      setLoadingId(null)
    }
  }

  const deleteUser = async (id: string, email?: string | null) => {
    const ok = window.confirm(`Hapus user ${email || id}? Tindakan ini tidak dapat dibatalkan.`)
    if (!ok) return
    try {
      setLoadingId(id)
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menghapus user')
      setProfiles((prev) => prev.filter((x) => x.id !== id))
      toast({ title: 'Dihapus', description: 'User berhasil dihapus.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menghapus', description: e?.message || 'Terjadi kesalahan.' })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="relative overflow-x-auto rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between p-3">
        <h2 className="text-sm font-medium text-muted-foreground">Kelola pengguna</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={refetchProfiles}
            disabled={refreshing}
            aria-label="Segarkan"
            title="Segarkan"
          >
            <RefreshCcw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            <span className="sr-only">Segarkan</span>
          </Button>
          <CreateUserDialog onCreated={() => refetchProfiles()} />
        </div>
      </div>
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr className="text-left">
            <th className="p-3 whitespace-nowrap">Email</th>
            <th className="p-3 whitespace-nowrap">Nama</th>
            <th className="p-3 whitespace-nowrap">Role</th>
            <th className="p-3 whitespace-nowrap">Trial Ends</th>
            <th className="p-3 whitespace-nowrap text-center">Akses Tools</th>
            <th className="p-3 whitespace-nowrap">Nonaktif</th>
            <th className="p-3 whitespace-nowrap text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {profiles.filter((p): p is Profile => !!p).map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3 align-middle"><div className="max-w-[280px] truncate">{p.email}</div></td>
              <td className="p-3 align-middle">
                <Input
                  defaultValue={p.full_name ?? ''}
                  onBlur={(e) => updateProfile(p.id, { full_name: e.currentTarget.value })}
                />
              </td>
              <td className="p-3 align-middle">
                <Select
                  defaultValue={p.role}
                  onValueChange={(v: 'admin' | 'member') => updateProfile(p.id, { role: v })}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3 align-middle">
                <Input
                  type="datetime-local"
                  className="w-[220px]"
                  defaultValue={p.trial_ends_at ? new Date(p.trial_ends_at).toISOString().slice(0, 16) : ''}
                  onBlur={(e) => updateProfile(p.id, { trial_ends_at: new Date(e.currentTarget.value).toISOString() as any })}
                />
              </td>
              <td className="p-3 align-middle text-center">
                <ToolsDialog tools={tools} profileId={p.id} />
              </td>
              <td className="p-3 align-middle">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" defaultChecked={(p as any).disabled} onChange={(e) => updateProfile(p.id, { disabled: e.currentTarget.checked } as any)} />
                  <span>Disable</span>
                </label>
              </td>
              <td className="p-3 align-middle text-right">
                <div className="flex justify-end gap-2">
                  <Button disabled={loadingId === p.id} variant="outline" className="rounded-xl" onClick={() => updateProfile(p.id, {})}>
                    {loadingId === p.id ? 'Menyimpan…' : 'Simpan'}
                  </Button>
                  <Button variant="destructive" className="rounded-xl" onClick={async () => { await deleteUser(p.id, p.email); await refetchProfiles() }}>
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ToolsDialog({ tools, profileId }: { tools: Tool[]; profileId: string }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState<number | null>(null)

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/users/${profileId}/tools`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat tools')
      const list: string[] = json.toolIds || []
      setSelected(list)
      setCount(list.length)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal memuat', description: e?.message || 'Tidak dapat memuat tools.' })
    }
  }

  // Preload count on mount for label
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (toolId: string) => {
    setSelected((prev) => (prev.includes(toolId) ? prev.filter((i) => i !== toolId) : [...prev, toolId]))
  }

  const save = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${profileId}/tools`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolIds: selected }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan tools')
      toast({ title: 'Tersimpan', description: 'Akses tools berhasil diperbarui.' })
      setOpen(false)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) load() }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className={cn(
            'rounded-xl',
            count === 0 ? 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-100' : undefined,
          )}
        >
          {typeof count === 'number' ? `${count} Tools` : '…'}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Tools</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((t) => (
            <label key={t.id} className="flex items-center gap-2 rounded-xl border p-2">
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
                className="size-4 accent-indigo-600"
              />
              <span className="text-sm">{t.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={loading} className="rounded-xl" onClick={async () => { await save(); setCount(selected.length) }}>
            {loading ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateUserDialog({ onCreated }: { onCreated: (p: any) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')

  const submit = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name, role }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal membuat user')
      const fallbackProfile = {
        id: json?.user?.id || Math.random().toString(36).slice(2),
        email,
        full_name: name || null,
        role,
        trial_ends_at: '',
        created_at: new Date().toISOString(),
      } as Profile
      const createdProfile: Profile = (json?.profile as Profile) ?? fallbackProfile
      onCreated(createdProfile)
      setOpen(false)
      setEmail(''); setPassword(''); setName(''); setRole('member')
      toast({ title: 'User dibuat', description: `Akun ${email} berhasil dibuat.` })
      if (!json?.profile) {
        toast({ title: 'Sinkronisasi profil', description: 'Profil akan muncul lengkap setelah penyegaran data.' })
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal membuat user', description: e?.message || 'Terjadi kesalahan.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl">Tambah User</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input placeholder="Nama lengkap (opsional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={role} onValueChange={(v: any) => setRole(v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={saving} className="rounded-xl" onClick={submit}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
