import { createClient } from '@/lib/supabase/server'
import LeadsTable from './LeadsTable'

export default async function LeadsPage() {
  const supabase = await createClient()

  const [{ data: leads }, { data: clients }] = await Promise.all([
    supabase
      .from('leads')
      .select('*, clients(name)')
      .order('date_added', { ascending: false }),
    supabase.from('clients').select('id, name').eq('status', 'Active'),
  ])

  const leadsWithClientName = (leads ?? []).map((lead: any) => ({
    ...lead,
    client_name: lead.clients?.name ?? 'Unknown',
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 pt-10 lg:pt-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads?.length ?? 0} total leads</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <LeadsTable leads={leadsWithClientName} clients={clients ?? []} />
      </div>
    </div>
  )
}
