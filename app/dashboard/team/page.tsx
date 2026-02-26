'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TeamMember } from '@/lib/types'
import Modal from '@/components/Modal'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

const DEFAULT_ROLES = ['Coordinator','Manager','Director','Volunteer','Advisor','Speaker Liaison','Partner Liaison','Marketing','Tech','Operations']
const DEFAULT_DEPARTMENTS = ['Leadership','Operations','Marketing','Technology','Speaker Relations','Partner Relations','Volunteers']

const empty: Omit<TeamMember, 'id' | 'created_at'> = {
  full_name: '', role: '', department: '', company: '', email: '', phone: '',
  timezone: '', handle: '', responsibilities: '', notes: '',
}

export default function TeamPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES)
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS)

  useEffect(() => {
    fetchMembers()
    fetchOptions()
  }, [])

  async function fetchOptions() {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['team_roles', 'team_departments'])
    for (const row of data ?? []) {
      try {
        if (row.key === 'team_roles') setRoles(JSON.parse(row.value))
        if (row.key === 'team_departments') setDepartments(JSON.parse(row.value))
      } catch {}
    }
  }

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase.from('team_members').select('*').order('full_name')
    setMembers(data ?? [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(empty); setShowModal(true) }
  function openEdit(m: TeamMember) { setEditing(m); setForm({ ...m }); setShowModal(true) }

  async function handleSave() {
    setSaving(true)
    if (editing) {
      await supabase.from('team_members').update(form).eq('id', editing.id)
    } else {
      await supabase.from('team_members').insert(form)
    }
    setSaving(false)
    setShowModal(false)
    fetchMembers()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this team member?')) return
    await supabase.from('team_members').delete().eq('id', id)
    fetchMembers()
  }

  const filtered = members.filter(m =>
    `${m.full_name} ${m.role} ${m.department} ${m.company} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Directory</h1>
          <p className="text-gray-500 text-sm mt-0.5">{members.length} members</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team…"
          className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No team members yet. Add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name','Role','Department','Company','Email','Phone','Timezone','Handle',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.role}</td>
                  <td className="px-4 py-3 text-gray-600">{m.department}</td>
                  <td className="px-4 py-3 text-gray-600">{m.company}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{m.timezone}</td>
                  <td className="px-4 py-3 text-gray-600">{m.handle}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-gray-100 rounded transition text-gray-500">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-red-50 rounded transition text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Team Member' : 'Add Team Member'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input value={form.full_name ?? ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={form.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="">Select…</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <select value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="">Select…</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Company / Organisation</label>
              <input value={form.company ?? ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            {[
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Timezone', key: 'timezone' },
              { label: 'Slack/Discord Handle', key: 'handle' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input value={(form as any)[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Primary Responsibilities</label>
              <textarea rows={2} value={form.responsibilities ?? ''}
                onChange={e => setForm(f => ({ ...f, responsibilities: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={2} value={form.notes ?? ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.full_name}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
