-- LeadFlow Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────
create table public.clients (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  email         text not null,
  phone         text not null default '',
  business_type text not null,
  tier          text not null check (tier in ('Starter', 'Growth', 'Scale')),
  status        text not null default 'Active' check (status in ('Active', 'Paused', 'Cancelled')),
  notes         text,
  date_started  date not null default current_date,
  created_at    timestamptz default now()
);

alter table public.clients enable row level security;

create policy "Owner full access to clients"
  on public.clients
  for all
  using (auth.jwt() ->> 'email' = 'hunterjoseph012@gmail.com');

-- ─────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────
create table public.leads (
  id          uuid default uuid_generate_v4() primary key,
  client_id   uuid not null references public.clients(id) on delete cascade,
  lead_name   text not null,
  email       text not null default '',
  phone       text not null default '',
  status      text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Booked', 'Lost')),
  date_added  date not null default current_date,
  created_at  timestamptz default now()
);

alter table public.leads enable row level security;

create policy "Owner full access to leads"
  on public.leads
  for all
  using (auth.jwt() ->> 'email' = 'hunterjoseph012@gmail.com');

-- ─────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────
create table public.appointments (
  id             uuid default uuid_generate_v4() primary key,
  client_id      uuid not null references public.clients(id) on delete cascade,
  prospect_name  text not null,
  date_time      timestamptz not null,
  status         text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Cancelled', 'No Show')),
  notes          text,
  created_at     timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Owner full access to appointments"
  on public.appointments
  for all
  using (auth.jwt() ->> 'email' = 'hunterjoseph012@gmail.com');

-- ─────────────────────────────────────
-- INDEXES (for query performance)
-- ─────────────────────────────────────
create index leads_client_id_idx on public.leads(client_id);
create index leads_date_added_idx on public.leads(date_added);
create index appointments_client_id_idx on public.appointments(client_id);
create index appointments_date_time_idx on public.appointments(date_time);
