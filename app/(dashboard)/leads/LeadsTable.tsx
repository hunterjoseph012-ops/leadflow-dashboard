'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lead, LeadStatus } from '@/lib/types'

const statusColour: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-purple-100 text-purple-700',
  Booked: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Booked', 'Lost']

interface LeadWithClient extends Lead {
  client_name: string
}

interface SimpleClient {
  id: string
  name: string
}

export default function LeadsTable({
  leads: initialLeads,
  clients,
}: {
  leads: LeadWithClient[]
  clients: SimpleClient[]
}) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [clientFilter, setClientFilter] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  const [newLead, setNewLead] = useState({
    client_id: '',
    lead_name: '',
    email: '',
    phone: '',
    status: 'New' as LeadStatus,
    date_added: new Date().toISOString().split('T')[0],
  })

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.lead_name.toLowerCase().includes(search.toLowerCase()) ||
      l.client_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || l.status === statusFilter
    const matchClient = clientFilter === 'All' || l.client_id === clientFilter
    return matchSearch && matchStatus && matchClient
  })

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .insert(newLead)
      .select('*, clients(name)')
      .single()

    if (error) {
      setAddError(error.message)
      setAddLoading(false)
      return
    }

    const clientName = clients.find((c) => c.id === newLead.client_id)?.name ?? 'Unknown'
    setLeads([{ ...data, client_name: clientName }, ...leads])
    setShowAddForm(false)
    setNewLead({ client_id: '', lead_name: '', email: '', phone: '', status: 'New', date_added: new Date().toISOString().split('T')[0] })
    setAddLoading(false)
    router.refresh()
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const supabase = createClient()
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      {/* Filters bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2"
        >
          <option value="All">All Clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: '#2272C3' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* Add lead form */}
      {showAddForm && (
        <form onSubmit={handleAddLead} className="px-6 py-5 border-b border-gray-100 bg-blue-50/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New Lead</h3>
          {addError && <p className="text-sm text-red-600 mb-3">{addError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
              <select required value={newLead.client_id} onChange={(e) => setNewLead({ ...newLead, client_id: e.target.value })} className={inputClass}>
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lead Name *</label>
              <input required type="text" placeholder="John Smith" value={newLead.lead_name} onChange={(e) => setNewLead({ ...newLead, lead_name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" placeholder="john@company.com" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" placeholder="+44 7700 000000" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={newLead.status} onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })} className={inputClass}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Added</label>
              <input type="date" value={newLead.date_added} onChange={(e) => setNewLead({ ...newLead, date_added: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={addLoading} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ background: '#2272C3' }}>
              {addLoading ? 'Adding...' : 'Add Lead'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Channel</th><th className="px-6 py-3">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                  {leads.length === 0 ? 'No leads yet.' : 'No leads match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.lead_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lead.channel || 'widget'}</td><td className="px-6 py-4 text-sm text-gray-600">{lead.client_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColour[lead.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(lead.date_added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
