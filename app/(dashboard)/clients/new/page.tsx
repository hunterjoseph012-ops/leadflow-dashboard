import ClientForm from '../ClientForm'

export default function NewClientPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 pt-10 lg:pt-0">
        <a href="/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to add a new client to LeadFlow</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm max-w-2xl">
        <ClientForm />
      </div>
    </div>
  )
}
