import { createClient } from '@/lib/supabase/server'
import AppointmentsList from './AppointmentsList'

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const [{ data: appointments }, { data: clients }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, clients(name)')
      .order('date_time', { ascending: true }),
    supabase.from('clients').select('id, name').eq('status', 'Active'),
  ])

  const appointmentsWithClientName = (appointments ?? []).map((a: any) => ({
    ...a,
    client_name: a.clients?.name ?? 'Unknown',
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 pt-10 lg:pt-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments?.length ?? 0} total appointments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <AppointmentsList appointments={appointmentsWithClientName} clients={clients ?? []} />
      </div>
    </div>
  )
}
