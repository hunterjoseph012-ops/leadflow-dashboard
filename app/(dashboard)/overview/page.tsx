import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalClients },
    { count: leadsThisMonth },
    { count: appointmentsThisMonth },
    { count: bookedLeads },
    { count: qualifiedOrAbove },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('date_added', firstOfMonth),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('date_time', firstOfMonth).eq('status', 'Scheduled'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('date_added', firstOfMonth).eq('status', 'Booked'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('date_added', firstOfMonth).in('status', ['Qualified', 'Booked']),
  ])

  const conversionRate =
    leadsThisMonth && leadsThisMonth > 0
      ? Math.round(((bookedLeads ?? 0) / leadsThisMonth) * 100)
      : 0

  return {
    totalClients: totalClients ?? 0,
    leadsThisMonth: leadsThisMonth ?? 0,
    appointmentsThisMonth: appointmentsThisMonth ?? 0,
    conversionRate,
  }
}

async function getRecentActivity() {
  const supabase = await createClient()

  const [{ data: recentLeads }, { data: upcomingAppointments }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, lead_name, status, date_added, clients(name)')
      .order('date_added', { ascending: false })
      .limit(5),
    supabase
      .from('appointments')
      .select('id, prospect_name, date_time, status, clients(name)')
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(5),
  ])

  return { recentLeads: recentLeads ?? [], upcomingAppointments: upcomingAppointments ?? [] }
}

const statusColour: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-purple-100 text-purple-700',
  Booked: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
  Scheduled: 'bg-teal-100 text-teal-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-600',
}

export default async function OverviewPage() {
  const stats = await getStats()
  const { recentLeads, upcomingAppointments } = await getRecentActivity()

  const statCards = [
    {
      label: 'Active Clients',
      value: stats.totalClients,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      colour: '#1B2A6B',
      bg: '#EEF1FB',
    },
    {
      label: 'Leads This Month',
      value: stats.leadsThisMonth,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      colour: '#2272C3',
      bg: '#EBF4FF',
    },
    {
      label: 'Appointments Booked',
      value: stats.appointmentsThisMonth,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      colour: '#2EC4C4',
      bg: '#E8FAFA',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      colour: '#059669',
      bg: '#ECFDF5',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 pt-10 lg:pt-0">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: card.bg, color: card.colour }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.colour }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <a href="/leads" className="text-sm font-medium" style={{ color: '#2272C3' }}>View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No leads yet</p>
            ) : (
              recentLeads.map((lead: any) => (
                <div key={lead.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.lead_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead.clients?.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColour[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <a href="/appointments" className="text-sm font-medium" style={{ color: '#2272C3' }}>View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingAppointments.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((appt: any) => (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appt.prospect_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {appt.clients?.name} · {new Date(appt.date_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColour[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
