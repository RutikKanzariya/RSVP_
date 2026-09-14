export type RSVPStatus = 'pending' | 'calling' | 'confirmed' | 'declined' | 'undecided' | 'failed';

export type CampaignStatus = 'draft' | 'running' | 'paused' | 'completed';

export interface Invitee {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  raw_row_valid: boolean;
  validation_errors: string[];
}

export interface Campaign {
  id: string;
  event_name: string;
  event_date: string;
  event_location: string;
  campaign_name: string;
  objective: string;
  status: CampaignStatus;
  created_at: string;
  total_invitees: number;
  max_retries: number;
}

export interface CampaignInvitee {
  id: string;
  campaign_id: string;
  invitee_id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  status: RSVPStatus;
  attempt_count: number;
  last_attempted_at?: string;
  captured_notes?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  dietary_requirements?: string;
}

export interface CallAttempt {
  id: string;
  campaign_invitee_id: string;
  invitee_name: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  outcome: RSVPStatus;
  raw_response: any;
  error_message?: string;
  transcript?: { speaker: 'AI' | 'Invitee'; message: string }[];
}

export interface ProcessingProgress {
  processed: number;
  total: number;
  confirmed: number;
  declined: number;
  undecided: number;
  failed: number;
  pending: number;
}
