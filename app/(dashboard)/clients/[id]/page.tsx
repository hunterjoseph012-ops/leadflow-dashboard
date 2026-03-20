import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const tierColour: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-700',
  Growth: 'bg-blue-100 text-blue-700',
  Scale: 'bg-purple-100 text-purple-700',
}

const statusColour: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Paused: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: leads }, { data: appointments }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('leads').select('*').eq('client_id', id).order('date_added', { ascending: false }),
    supabase.from('appointments').select('*').eq('client_id', id).order('date_time', { ascending: false }),
  ])

  if (!client) notFound()

  const leadStatusColour: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-yellow-100 text-yellow-700',
    Qualified: 'bg-purple-100 text-purple-700',
    Booked: 'bg-green-100 text-green-700',
    Lost: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 pt-10 lg:pt-0">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{client.business_type}</p>
          </div>
          <Link
            href={`/clients/${id}/edit`}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: '#2272C3' }}
          >
            Edit Client
          </Link>
        </div>
      </div>

      {/* Client details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Client Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-900 mt-0.5">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-900 mt-0.5">{client.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tier</p>
              <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${tierColour[client.tier]}`}>
                {client.tier}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColour[client.status]}`}>
                {client.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date Started</p>
              <p className="text-sm text-gray-900 mt-0.5">
                {new Date(client.date_started).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {client.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-700 mt-0.5">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Leads', value: leads?.length ?? 0, colour: '#2272C3' },
              { label: 'Booked', value: leads?.filter((l) => l.status === 'Booked').length ?? 0, colour: '#2EC4C4' },
              { label: 'Appointments', value: appointments?.length ?? 0, colour: '#1B2A6B' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: stat.colour }}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent leads */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Leads</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leads?.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No leads for this client</td></tr>
                  ) : (
                    leads?.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{lead.lead_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{lead.email}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${leadStatusColour[lead.status] ?? ''}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {new Date(lead.date_added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
