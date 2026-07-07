export type FeatureComplexity = 'low' | 'medium' | 'high' | 'very_high';

export type FeatureCategory =
  | 'design'
  | 'pages'
  | 'ecommerce'
  | 'checkout'
  | 'gateway'
  | 'shipping'
  | 'marketing'
  | 'seo'
  | 'admin'
  | 'advanced'
  | 'security'
  | 'hosting';

export interface Feature {
  id: string;
  name: string;
  category: FeatureCategory;
  min_cost: number;
  max_cost: number;
  dev_hours: number;
  complexity: FeatureComplexity;
  dependencies: string[];
  is_optional: boolean;
  is_default: boolean;
  is_enabled: boolean;
  description?: string;
  admin_notes?: string;
}

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'negotiation'
  | 'accepted'
  | 'rejected'
  | 'completed';

export interface Quotation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  business_name: string;
  industry?: string;
  business_description?: string;
  current_website?: string;
  competitor_websites?: string;
  target_audience?: string;
  monthly_visitors?: string;
  monthly_orders?: string;
  logo_available: boolean;
  brand_guidelines_available: boolean;
  preferred_colors?: string;
  selected_features: string[]; // List of selected feature IDs + custom pages represented as dynamic IDs
  custom_pages?: string[]; // Names of custom pages added by client
  estimated_cost_min: number;
  estimated_cost_max: number;
  estimated_hours: number;
  estimated_days: number;
  complexity: FeatureComplexity;
  status: QuotationStatus;
  follow_up_date?: string;
  notes?: string;
  lead_source: string;
  proposal_pdf_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StepInfo {
  number: number;
  title: string;
  description: string;
}
