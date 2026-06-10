export interface Business {
  id: number;
  campaign_id: number | null;
  name: string;
  category: string;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  google_rating: number | null;
  reviews_count: number | null;
  description: string | null;
  source: string;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessCreate {
  campaign_id?: number | null;
  name: string;
  category: string;
  location: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  description?: string | null;
}

export interface DiscoverRequest {
  sector: string;
  location: string;
  limit: number;
}

export interface DiscoverResponse {
  leads: Business[];
  total: number;
  message: string;
}
