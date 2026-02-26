export type ResponseStatus =
  | 'Not Contacted'
  | 'Outreach Sent'
  | 'Follow Up Sent'
  | 'In Conversation'
  | 'Confirmed'
  | 'Declined'
  | 'No Response'

export type PartnerStatus =
  | 'Prospecting'
  | 'In Discussion'
  | 'Agreement Sent'
  | 'Confirmed'
  | 'Active'
  | 'Completed'
  | 'Declined'

export type AssetStatus = 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived'
export type PostStatus  = 'Draft' | 'Scheduled' | 'Posted'

export interface TeamMember {
  id: string
  created_at: string
  full_name: string
  role: string | null
  department: string | null
  company: string | null
  email: string | null
  phone: string | null
  timezone: string | null
  responsibilities: string | null
  notes: string | null
}

export interface Speaker {
  id: string
  created_at: string
  full_name: string
  organization: string | null
  title: string | null
  topic: string | null
  session_type: string | null
  contact_email: string | null
  contact_phone: string | null
  agent_name: string | null
  agent_email: string | null
  outreach_date: string | null
  outreach_method: string | null
  follow_up_date: string | null
  response_status: ResponseStatus
  confirmed: boolean
  confirmation_date: string | null
  contract_sent: boolean
  contract_signed: boolean
  bio_received: boolean
  headshot_received: boolean
  av_requirements: string | null
  session_date: string | null
  session_time_utc: string | null
  session_length_min: number | null
  honorarium: number | null
  travel_notes: string | null
  notes: string | null
}

export interface Partner {
  id: string
  created_at: string
  organization: string
  partnership_type: string | null
  primary_contact_name: string | null
  primary_contact_title: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  secondary_contact_name: string | null
  secondary_contact_email: string | null
  website: string | null
  social_handle: string | null
  partnership_status: PartnerStatus
  agreement_signed: boolean
  agreement_date: string | null
  deliverables: string | null
  our_commitments: string | null
  their_commitments: string | null
  logo_received: boolean
  assets_received: boolean
  payment_terms: string | null
  partnership_value: number | null
  notes: string | null
}

export interface Podcast {
  id: string
  created_at: string
  podcast_name: string
  host_name: string | null
  host_email: string | null
  show_website: string | null
  social_handle: string | null
  monthly_listeners: number | null
  audience_niche: string | null
  outreach_date: string | null
  outreach_method: string | null
  follow_up_date: string | null
  response_status: ResponseStatus
  confirmed: boolean
  recording_date: string | null
  recording_format: string | null
  publish_date: string | null
  episode_title: string | null
  episode_url: string | null
  talking_points: string | null
  assets_sent: boolean
  notes: string | null
}

export interface MarketingAsset {
  id: string
  created_at: string
  asset_name: string
  asset_type: string | null
  category: string | null
  platform: string | null
  file_name: string | null
  file_url: string | null
  format: string | null
  dimensions: string | null
  created_by: string | null
  version: string | null
  status: AssetStatus
  approved_by: string | null
  approval_date: string | null
  publish_date: string | null
  campaign_phase: string | null
  notes: string | null
}
