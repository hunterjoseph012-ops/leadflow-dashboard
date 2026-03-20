export type ClientTier = 'Starter' | 'Growth' | 'Scale'
export type ClientStatus = 'Active' | 'Paused' | 'Cancelled'
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Booked' | 'Lost'
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  business_type: string
  tier: ClientTier
  status: ClientStatus
  notes: string | null
  date_started: string
  created_at: string
}

export interface Lead {
  id: string
  client_id: string
  client_name?: string
  lead_name: string
  email: string
  phone: string
  status: LeadStatus
  date_added: string
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  client_name?: string
  prospect_name: string
  date_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
}
