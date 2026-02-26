'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MarketingAsset, AssetStatus } from '@/lib/types'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react'

const ASSET_TYPES = ['Graphic','Video','Copy','Email Template','Social Post','Press Release','Banner','Other']
const PLATFORMS   = ['Instagram','LinkedIn','Twitter/X','Facebook','TikTok','YouTube','Website','Email','General']
const STATUSES: AssetStatus[] = ['Draft','In Review','Approved','Published','Archived']

const emptyForm = {
  asset_name: '', asset_type: '', category: '', platform: '', file_name: '',
  file_url: '', format: '', dimensions: '', created_by: '', version: '',
  status: 'Draft' as AssetStatus, approved_by: '', approval_date: '',
  publish_date: '', campaign_phase: '', notes: '',
}

export default function MarketingPage() {
  const supabase = createClient()
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MarketingAsset | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAssets() }, [])

  async function fetchAssets() {
    setLoading(true)
    const { data } = await supabase.from('marketing_assets').select('*').order('created_at', { ascending: false })
    setAssets(data ?? [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(a: MarketingAsset) { setEditing(a); setForm({ ...a } as any); setShowModal(true) }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      approval_date: form.approval_date || null,
      publish_date:  form.publish_date  || null,
    }
    if (editing) {
      await supabase.from('marketing_assets').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('marketing_assets').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    fetchAssets()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this asset?')) return
    await supabase.from('marketing_assets').delete().eq('id', id)
    fetchAssets()
  }

  const filtered = assets.filter(a => {
    const matchSearch = `${a.asset_name} ${a.asset_type} ${a.platform} ${a.created_by} ${a.campaign_phase}`.toLowerCase().includes(search.toLowerCase())
    const matchType   = filterType   === 'All' || a.asset_type   === filterType
    const matchStatus = filterStatus === 'All' || a.status       === filterStatus
    return matchSearch && matchType && matchStatus
  })

  function fld(key: string, label: string, type = 'text', span2 = false) {
    return (
      <div key={key} className={span2 ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={(form as any)[key] ?? ''}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Assets</h1>
          <p className="text-gray-500 text-sm mt-0.5">{assets.length} assets logged</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm">
          <Plus size={16} /> Log Asset
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="All">All Types</option>
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No assets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Asset Name','Type','Platform','Created By','Version','Status','Phase','File',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.asset_name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.asset_type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.platform}</td>
                    <td className="px-4 py-3 text-gray-600">{a.created_by}</td>
                    <td className="px-4 py-3 text-gray-600">{a.version}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{a.campaign_phase}</td>
                    <td className="px-4 py-3">
                      {a.file_url ? (
                        <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:underline text-xs">
                          <ExternalLink size={12} /> Open
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">{a.file_name || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-gray-100 rounded transition text-gray-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded transition text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Asset' : 'Log Asset'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            {fld('asset_name','Asset Name *','text',true)}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Asset Type</label>
              <select value={form.asset_type ?? ''}
                onChange={e => setForm(p => ({ ...p, asset_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="">Select…</option>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Platform / Use Case</label>
              <select value={form.platform ?? ''}
                onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="">Select…</option>
                {PLATFORMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {fld('category','Category')}
            {fld('file_name','File Name')}
            {fld('file_url','File URL','url',true)}
            {fld('format','Format (PNG/MP4/…)')}
            {fld('dimensions','Dimensions / Specs')}
            {fld('created_by','Created By')}
            {fld('version','Version (v1/FINAL…)')}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as AssetStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {fld('campaign_phase','Campaign Phase')}
            {fld('approved_by','Approved By')}
            {fld('approval_date','Approval Date','date')}
            {fld('publish_date','Publish Date','date')}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={2} value={form.notes ?? ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.asset_name}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
