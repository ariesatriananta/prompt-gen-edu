"use client"

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = useMemo(() => createClient(), [])
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const updateProfile = async (id: string, patch: Partial<Profile>) => {
    setLoadingId(id)
    const { error, data } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle()
    setLoadingId(null)
    if (!error && data) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="p-3">Email</th>
            <th className="p-3">Nama</th>
            <th className="p-3">Role</th>
            <th className="p-3">Trial Ends</th>
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
      <p className="p-3 text-xs text-muted-foreground">
        Catatan: Penambahan user baru dilakukan melalui proses signup. Setelah user mendaftar, data akan muncul di daftar ini.
      </p>
    </div>
  )
}

function ToolsDialog({ tools, profileId }: { tools: Tool[]; profileId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('member_tools')
      .select('tool_id')
      .eq('profile_id', profileId)
    setSelected((data ?? []).map((d: any) => d.tool_id))
  }

  const toggle = (toolId: string) => {
    setSelected((prev) => (prev.includes(toolId) ? prev.filter((i) => i !== toolId) : [...prev, toolId]))
  }

  const save = async () => {
    setLoading(true)
    // Fetch current, compute adds/removes
    const { data: current = [] } = await supabase
      .from('member_tools')
      .select('tool_id')
      .eq('profile_id', profileId)

    const currentIds = new Set((current as any[]).map((r) => r.tool_id))
    const desired = new Set(selected)

    const toAdd = [...desired].filter((id) => !currentIds.has(id)).map((tool_id) => ({ profile_id: profileId, tool_id }))
    const toRemove = [...currentIds].filter((id) => !desired.has(id))

    if (toAdd.length) {
      await supabase.from('member_tools').insert(toAdd)
    }
    if (toRemove.length) {
      await supabase.from('member_tools').delete().in('tool_id', toRemove).eq('profile_id', profileId)
    }

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

