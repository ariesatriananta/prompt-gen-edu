"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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

  const updateProfile = async (id: string, patch: Partial<Profile> & { password?: string }) => {
    setLoadingId(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setLoadingId(null)
    const json = await res.json()
    if (res.ok && json.profile) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...json.profile } : p)))
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <div className="flex items-center justify-between p-3">
        <h2 className="text-sm font-medium text-muted-foreground">Kelola pengguna</h2>
        <CreateUserDialog onCreated={(p) => setProfiles((prev) => [p, ...prev])} />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="p-3">Email</th>
            <th className="p-3">Nama</th>
            <th className="p-3">Role</th>
            <th className="p-3">Trial Ends</th>
            <th className="p-3">Nonaktif</th>
            <th className="p-3">Tools</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.email}</td>
              <td className="p-3">
                <Input
                  defaultValue={p.full_name ?? ''}
                  onBlur={(e) => updateProfile(p.id, { full_name: e.currentTarget.value })}
                />
              </td>
              <td className="p-3">
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
              <td className="p-3">
                <Input
                  type="datetime-local"
                  defaultValue={p.trial_ends_at ? new Date(p.trial_ends_at).toISOString().slice(0, 16) : ''}
                  onBlur={(e) => updateProfile(p.id, { trial_ends_at: new Date(e.currentTarget.value).toISOString() as any })}
                />
              </td>
              <td className="p-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" defaultChecked={(p as any).disabled} onChange={(e) => updateProfile(p.id, { disabled: e.currentTarget.checked } as any)} />
                  <span>Disable</span>
                </label>
              </td>
              <td className="p-3">
                <ToolsDialog tools={tools} profileId={p.id} />
              </td>
              <td className="p-3 text-right">
                <Button disabled={loadingId === p.id} variant="outline" className="rounded-xl">
                  {loadingId === p.id ? 'Menyimpan…' : 'Simpan'}
                </Button>
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

  const load = async () => {
    const res = await fetch(`/api/admin/users/${profileId}/tools`)
    const json = await res.json()
    setSelected(json.toolIds || [])
  }

  const toggle = (toolId: string) => {
    setSelected((prev) => (prev.includes(toolId) ? prev.filter((i) => i !== toolId) : [...prev, toolId]))
  }

  const save = async () => {
    setLoading(true)
    await fetch(`/api/admin/users/${profileId}/tools`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolIds: selected }),
    })
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) load() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="rounded-xl">Kelola</Button>
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
          <Button disabled={loading} className="rounded-xl" onClick={save}>{loading ? 'Menyimpan…' : 'Simpan'}</Button>
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
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: name, role }),
    })
    const json = await res.json()
    setSaving(false)
    if (res.ok && json.profile) {
      onCreated(json.profile)
      setOpen(false)
      setEmail(''); setPassword(''); setName(''); setRole('member')
    } else {
      alert(json.error || 'Gagal membuat user')
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
