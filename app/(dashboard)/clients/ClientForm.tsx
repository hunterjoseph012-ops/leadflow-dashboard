'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Client, ClientTier, ClientStatus } from '@/lib/types'

interface ClientFormProps {
  client?: Client
  isEdit?: boolean
}

export default function ClientForm({ client, isEdit }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    business_type: client?.business_type ?? '',
    tier: (client?.tier ?? 'Starter') as ClientTier,
    status: (client?.status ?? 'Active') as ClientStatus,
    notes: client?.notes ?? '',
    date_started: client?.date_started ?? new Date().toISOString().split('T')[0],
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (isEdit && client) {
      const { error } = await supabase
        .from('clients')
        .update(form)
        .eq('id', client.id)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('clients').insert(form)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push('/clients')
    router.refresh()
  }

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Client Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Acme Ltd"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Business Type *</label>
          <input
            type="text"
            required
            value={form.business_type}
            onChange={(e) => set('business_type', e.target.value)}
            placeholder="SaaS / Recruitment / Finance..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="contact@company.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+44 7700 000000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Tier *</label>
          <select
            required
            value={form.tier}
            onChange={(e) => set('tier', e.target.value)}
            className={inputClass}
          >
            <option value="Starter">Starter</option>
            <option value="Growth">Growth</option>
            <option value="Scale">Scale</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status *</label>
          <select
            required
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className={inputClass}
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Date Started *</label>
          <input
            type="date"
            required
            value={form.date_started}
            onChange={(e) => set('date_started', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any additional notes about this client..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#2272C3' }}
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Client'}
        </button>
        <a
          href="/clients"
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
