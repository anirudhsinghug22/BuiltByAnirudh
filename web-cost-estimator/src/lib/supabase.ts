import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials exist
export const hasSupabaseConfig = () => {
  return supabaseUrl && supabaseAnonKey;
};

// Standard client instance
export const supabase = hasSupabaseConfig()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to save a quotation (stores in Supabase if active, otherwise falls back to LocalStorage CRM mock)
export async function saveQuotation(quotationData: any) {
  if (hasSupabaseConfig() && supabase) {
    const { data, error } = await supabase
      .from('quotations')
      .insert(quotationData)
      .select()
      .single();

    if (error) {
      console.error('Supabase DB Insert Error:', error);
      throw error;
    }
    return data;
  } else {
    // Local Simulation Mode
    console.warn('Supabase not configured. Saving quotation to local simulation database.');
    
    // Simulate API network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const simulatedRecord = {
      ...quotationData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to CRM list in LocalStorage
    try {
      const existing = localStorage.getItem('website_estimate_leads');
      const leads = existing ? JSON.parse(existing) : [];
      leads.unshift(simulatedRecord);
      localStorage.setItem('website_estimate_leads', JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to write lead to local CRM storage', e);
    }

    return simulatedRecord;
  }
}

// Helper to fetch single quotation by ID (public proposal display page)
export async function fetchQuotation(id: string) {
  if (hasSupabaseConfig() && supabase) {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase DB Fetch Error:', error);
      return null;
    }
    return data;
  } else {
    // Local Simulation Mode load
    try {
      const existing = localStorage.getItem('website_estimate_leads');
      const leads = existing ? JSON.parse(existing) : [];
      const match = leads.find((l: any) => l.id === id);
      return match || null;
    } catch (e) {
      console.error('Failed to read from local CRM storage', e);
      return null;
    }
  }
}

// Helper to fetch all quotations (CRM dashboard)
export async function fetchAllQuotations() {
  if (hasSupabaseConfig() && supabase) {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase DB Fetch All Error:', error);
      throw error;
    }
    return data;
  } else {
    // Local Simulation Mode load
    try {
      const existing = localStorage.getItem('website_estimate_leads');
      const leads = existing ? JSON.parse(existing) : [];
      return leads;
    } catch (e) {
      console.error('Failed to load local CRM storage leads', e);
      return [];
    }
  }
}

// Helper to update a quotation's status or details
export async function updateQuotation(id: string, updates: any) {
  if (hasSupabaseConfig() && supabase) {
    const { data, error } = await supabase
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase DB Update Error:', error);
      throw error;
    }
    return data;
  } else {
    // Local Simulation Mode update
    try {
      const existing = localStorage.getItem('website_estimate_leads');
      const leads = existing ? JSON.parse(existing) : [];
      const index = leads.findIndex((l: any) => l.id === id);
      
      if (index === -1) {
        throw new Error('Quotation not found in local mock database.');
      }

      const updatedRecord = {
        ...leads[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      leads[index] = updatedRecord;
      localStorage.setItem('website_estimate_leads', JSON.stringify(leads));
      return updatedRecord;
    } catch (e) {
      console.error('Failed to update local CRM storage', e);
      throw e;
    }
  }
}
