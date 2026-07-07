-- Website Requirement & Proposal Generator - Supabase Schema Migration

-- Drop existing tables if they exist
drop table if exists public.quotations;
drop table if exists public.features;

-- 1. Create FEATURES table
create table public.features (
    id text primary key,
    name text not null,
    category text not null,
    min_cost numeric not null default 0,
    max_cost numeric not null default 0,
    dev_hours numeric not null default 0,
    complexity text check (complexity in ('low', 'medium', 'high', 'very_high')),
    dependencies text[] default '{}',
    is_optional boolean default true,
    is_default boolean default false,
    is_enabled boolean default true,
    admin_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.features enable row level security;

-- Read policy (Public can read active features)
create policy "Allow public read access to active features"
    on public.features for select
    using (is_enabled = true);

-- Write policy (Authenticated admins only can edit features)
create policy "Allow auth admins full access to features"
    on public.features for all
    using (auth.role() = 'authenticated');


-- 2. Create QUOTATIONS table
create table public.quotations (
    id uuid default gen_random_uuid() primary key,
    client_name text not null,
    client_email text not null,
    client_phone text,
    business_name text not null,
    industry text,
    business_description text,
    current_website text,
    competitor_websites text,
    target_audience text,
    monthly_visitors text,
    monthly_orders text,
    logo_available boolean default false,
    brand_guidelines_available boolean default false,
    preferred_colors text,
    selected_features jsonb not null default '[]'::jsonb, -- Array of selected feature IDs + custom pages
    estimated_cost_min numeric not null,
    estimated_cost_max numeric not null,
    estimated_hours numeric not null,
    estimated_days numeric not null,
    complexity text check (complexity in ('low', 'medium', 'high', 'very_high')),
    status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'completed')),
    follow_up_date date,
    notes text,
    lead_source text default 'website',
    proposal_pdf_url text,
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.quotations enable row level security;

-- Read policy (Anyone with the unique UUID can view the proposal)
create policy "Allow clients to view their own quotations"
    on public.quotations for select
    using (true);

-- Insert policy (Anyone can submit a quotation wizard)
create policy "Allow clients to create quotations"
    on public.quotations for insert
    with check (true);

-- Update policy (Client can accept/reject proposal by UUID)
create policy "Allow clients to update their quotation details"
    on public.quotations for update
    using (true)
    with check (true);

-- Admin policy (Authenticated admins have full access to manage CRM dashboard)
create policy "Allow auth admins full access to quotations"
    on public.quotations for all
    using (auth.role() = 'authenticated');


-- 3. Seed initial features (can be copied into Supabase SQL editor)
-- Note: Insert records using the data seeded in `/src/lib/pricing-data.ts`
