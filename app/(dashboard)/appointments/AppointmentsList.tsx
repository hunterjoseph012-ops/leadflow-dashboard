'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Appointment, AppointmentStatus } from '@/lib/types'

const statusColour: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  'No Show': 'bg-red-100 text-red-700',
}

const STATUSES: AppointmentStatus[] = ['Scheduled', 'Completed', 'Cancelled', 'No Show']

interface AppointmentWithClient extends Appointment {
  client_name: string
}

interface SimpleClient {
  id: string
  name: string
}

export default function AppointmentsList({
  appointments: initialAppointments,
  clients,
}: {
  appointments: AppointmentWithClient[]
  clients: SimpleClient[]
}) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  const [newAppt, setNewAppt] = useState({
    client_id: '',
    prospect_name: '',
    date_time: '',
    status: 'Scheduled' as AppointmentStatus,
    notes: '',
  })

  const now = new Date()
  const displayed = appointments.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    const matchUpcoming = filter === 'all' || new Date(a.date_time) >= now
    return matchStatus && matchUpcoming
  })

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('appointments')
      .insert(newAppt)
      .select('*, clients(name)')
      .single()

    if (error) {
      setAddError(error.message)
      setAddLoading(false)
      return
    }

    const clientName = clients.find((c) => c.id === newAppt.client_id)?.name ?? 'Unknown'
    const newAppointment = { ...data, client_name: clientName }
    setAppointments([...appointments, newAppointment].sort(
      (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    ))
    setShowAddForm(false)
    setNewAppt({ client_id: '', prospect_name: '', date_time: '', status: 'Scheduled', notes: '' })
    setAddLoading(false)
    router.refresh()
  }

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const supabase = createClient()
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['upcoming', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                filter === f ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={filter === f ? { background: '#2272C3' } : {}}
            >
              {f === 'upcoming' ? 'Upcoming' : 'All'}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setShowAddForm(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: '#2272C3' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Appointment
        </button>
      </div>

      {/* Add appointment form */}
      {showAddForm && (
        <form onSubmit={handleAddAppointment} className="px-6 py-5 border-b border-gray-100 bg-blue-50/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New Appointment</h3>
          {addError && <p className="text-sm text-red-600 mb-3">{addError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
              <select required value={newAppt.client_id} onChange={(e) => setNewAppt({ ...newAppt, client_id: e.target.value })} className={inputClass}>
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prospect Name *</label>
              <input required type="text" placeholder="Jane Doe" value={newAppt.prospect_name} onChange={(e) => setNewAppt({ ...newAppt, prospect_name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time *</label>
              <input required type="datetime-local" value={newAppt.date_time} onChange={(e) => setNewAppt({ ...newAppt, date_time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={newAppt.status} onChange={(e) => setNewAppt({ ...newAppt, status: e.target.value as AppointmentStatus })} className={inputClass}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input type="text" placeholder="Any relevant notes..." value={newAppt.notes} onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={addLoading} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50" style={{ background: '#2272C3' }}>
              {addLoading ? 'Booking...' : 'Book Appointment'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Appointments list */}
      {displayed.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-gray-400">
          {filter === 'upcoming' ? 'No upcoming appointments.' : 'No appointments yet.'}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {displayed.map((appt) => {
            const apptDate = new Date(appt.date_time)
            const isUpcoming = apptDate >= now
            return (
              <div key={appt.id} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                {/* Date block */}
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white"
                  style={{ background: isUpcoming ? '#1B2A6B' : '#94a3b8' }}
                >
                  <span className="text-xs font-medium uppercase leading-none">
                    {apptDate.toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold leading-tight">
                    {apptDate.getDate()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{appt.prospect_name}</p>
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColour[appt.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-medium" style={{ color: '#2272C3' }}>{appt.client_name}</span>
                    {' · '}
                    {apptDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' at '}
                    {apptDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
