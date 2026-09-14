import { Invitee, Campaign, CampaignInvitee, CallAttempt } from '@/types';

// Global mock state for persistent local manipulation
class MemoryStore {
  public invitees: Invitee[] = [
    { id: '1', name: 'Rahul Sharma', phone: '+919876543210', email: 'rahul.sharma@techcorp.in', company: 'TechCorp India', raw_row_valid: true, validation_errors: [] },
    { id: '2', name: 'Priya Shah', phone: '+919812345678', email: 'priya.shah@innovate.com', company: 'Innovate Solutions', raw_row_valid: true, validation_errors: [] },
    { id: '3', name: 'Amit Patel', phone: '+919999999999', email: 'amit.patel@globalvoxinc.com', company: 'GlobalVox', raw_row_valid: true, validation_errors: [] },
    { id: '4', name: 'Sneha Verma', phone: '+919822001122', email: 'sneha.v@growthlabs.io', company: 'GrowthLabs', raw_row_valid: true, validation_errors: [] },
    { id: '5', name: 'Vikram Malhotra', phone: '+919711223344', email: 'vikram@enterprise.net', company: 'Enterprise Systems', raw_row_valid: true, validation_errors: [] },
    { id: '6', name: 'Ananya Roy', phone: '+919833445566', email: 'ananya@fintech.co', company: 'FinTech Corp', raw_row_valid: true, validation_errors: [] },
    { id: '7', name: 'Karan Joshi', phone: '+919844556677', email: 'karan.j@synergy.org', company: 'Synergy Media', raw_row_valid: true, validation_errors: [] },
    { id: '8', name: 'Rohan Mehta', phone: '+919855667788', email: 'rohan@apex.com', company: 'Apex Global', raw_row_valid: true, validation_errors: [] },
    { id: '9', name: 'Deepika Padukone', phone: '+919866778899', email: 'deepika@cinema.in', company: 'Bollywood Studio', raw_row_valid: true, validation_errors: [] },
    { id: '10', name: 'Invalid User Phone', phone: '1234', email: 'badphone@test.com', company: 'Invalid Inc', raw_row_valid: false, validation_errors: ['Invalid phone format (must have standard country code & 10 digits)'] },
  ];

  public campaigns: Campaign[] = [
    {
      id: 'camp_001',
      event_name: 'GlobalVox Annual Business Meet 2026',
      event_date: '2026-10-25',
      event_location: 'Ahmedabad Convention Centre, Gujarat',
      campaign_name: 'Annual Business Meet — RSVP Calling',
      objective: 'Determine attendance, dietary requirements, and VIP seating preferences for annual meet.',
      status: 'running',
      created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      total_invitees: 9,
      max_retries: 3,
    }
  ];

  public campaignInvitees: Record<string, CampaignInvitee[]> = {
    'camp_001': [
      { id: 'ci_1', campaign_id: 'camp_001', invitee_id: '1', name: 'Rahul Sharma', phone: '+919876543210', email: 'rahul.sharma@techcorp.in', company: 'TechCorp India', status: 'confirmed', attempt_count: 1, last_attempted_at: new Date(Date.now() - 1800000).toISOString(), captured_notes: 'Attending with +1 colleague. Requested vegetarian meal.', sentiment: 'positive', dietary_requirements: 'Vegetarian' },
      { id: 'ci_2', campaign_id: 'camp_001', invitee_id: '2', name: 'Priya Shah', phone: '+919812345678', email: 'priya.shah@innovate.com', company: 'Innovate Solutions', status: 'declined', attempt_count: 1, last_attempted_at: new Date(Date.now() - 1500000).toISOString(), captured_notes: 'Out of country for international summit on event date.', sentiment: 'negative' },
      { id: 'ci_3', campaign_id: 'camp_001', invitee_id: '3', name: 'Amit Patel', phone: '+919999999999', email: 'amit.patel@globalvoxinc.com', company: 'GlobalVox', status: 'undecided', attempt_count: 1, last_attempted_at: new Date(Date.now() - 1200000).toISOString(), captured_notes: 'Checking schedule with management team. Requested follow-up SMS.', sentiment: 'neutral' },
      { id: 'ci_4', campaign_id: 'camp_001', invitee_id: '4', name: 'Sneha Verma', phone: '+919822001122', email: 'sneha.v@growthlabs.io', company: 'GrowthLabs', status: 'pending', attempt_count: 0 },
      { id: 'ci_5', campaign_id: 'camp_001', invitee_id: '5', name: 'Vikram Malhotra', phone: '+919711223344', email: 'vikram@enterprise.net', company: 'Enterprise Systems', status: 'failed', attempt_count: 3, last_attempted_at: new Date(Date.now() - 900000).toISOString(), captured_notes: 'Network unreachable / subscriber switched off across 3 attempts.' },
      { id: 'ci_6', campaign_id: 'camp_001', invitee_id: '6', name: 'Ananya Roy', phone: '+919833445566', email: 'ananya@fintech.co', company: 'FinTech Corp', status: 'pending', attempt_count: 0 },
      { id: 'ci_7', campaign_id: 'camp_001', invitee_id: '7', name: 'Karan Joshi', phone: '+919844556677', email: 'karan.j@synergy.org', company: 'Synergy Media', status: 'pending', attempt_count: 0 },
      { id: 'ci_8', campaign_id: 'camp_001', invitee_id: '8', name: 'Rohan Mehta', phone: '+919855667788', email: 'rohan@apex.com', company: 'Apex Global', status: 'pending', attempt_count: 0 },
      { id: 'ci_9', campaign_id: 'camp_001', invitee_id: '9', name: 'Deepika Padukone', phone: '+919866778899', email: 'deepika@cinema.in', company: 'Bollywood Studio', status: 'pending', attempt_count: 0 },
    ]
  };

  public callAttempts: Record<string, CallAttempt[]> = {
    'ci_1': [
      {
        id: 'ca_1',
        campaign_invitee_id: 'ci_1',
        invitee_name: 'Rahul Sharma',
        started_at: new Date(Date.now() - 1800000).toISOString(),
        ended_at: new Date(Date.now() - 1800000 + 45000).toISOString(),
        duration_sec: 45,
        outcome: 'confirmed',
        raw_response: { provider_call_id: 'voc_9921', status: 'completed', confidence: 0.98 },
        transcript: [
          { speaker: 'AI', message: 'Hello Rahul! Calling from GlobalVox regarding the Annual Business Meet on 25th October in Ahmedabad. Will you be attending?' },
          { speaker: 'Invitee', message: 'Yes, I will definitely be attending! Can I bring one colleague?' },
          { speaker: 'AI', message: 'Absolutely, we have reserved your seat. Do you have any dietary preferences?' },
          { speaker: 'Invitee', message: 'Vegetarian meal please.' },
          { speaker: 'AI', message: 'Recorded! Looking forward to welcoming you in Ahmedabad. Have a great day!' }
        ]
      }
    ],
    'ci_2': [
      {
        id: 'ca_2',
        campaign_invitee_id: 'ci_2',
        invitee_name: 'Priya Shah',
        started_at: new Date(Date.now() - 1500000).toISOString(),
        ended_at: new Date(Date.now() - 1500000 + 32000).toISOString(),
        duration_sec: 32,
        outcome: 'declined',
        raw_response: { provider_call_id: 'voc_9922', status: 'completed', confidence: 0.95 },
        transcript: [
          { speaker: 'AI', message: 'Hi Priya, this is GlobalVox Voice Assistant reaching out for your RSVP for the Annual Business Meet.' },
          { speaker: 'Invitee', message: 'Thanks for reaching out, but I will be traveling out of India during that week, so I cannot attend.' },
          { speaker: 'AI', message: 'Understood, thanks for letting us know. We will miss you!' }
        ]
      }
    ],
    'ci_3': [
      {
        id: 'ca_3',
        campaign_invitee_id: 'ci_3',
        invitee_name: 'Amit Patel',
        started_at: new Date(Date.now() - 1200000).toISOString(),
        ended_at: new Date(Date.now() - 1200000 + 28000).toISOString(),
        duration_sec: 28,
        outcome: 'undecided',
        raw_response: { provider_call_id: 'voc_9923', status: 'completed', confidence: 0.89 },
        transcript: [
          { speaker: 'AI', message: 'Hello Amit! Calling from GlobalVox for the Annual Business Meet. Are you able to confirm your attendance?' },
          { speaker: 'Invitee', message: 'I need to check my team travel schedule. Can you follow up later or send details?' },
          { speaker: 'AI', message: 'Sure, we have marked your status as undecided and sent event summary notes.' }
        ]
      }
    ],
    'ci_5': [
      { id: 'ca_51', campaign_invitee_id: 'ci_5', invitee_name: 'Vikram Malhotra', started_at: new Date(Date.now() - 3600000).toISOString(), ended_at: new Date(Date.now() - 3600000 + 10000).toISOString(), duration_sec: 10, outcome: 'failed', error_message: 'NO_ANSWER / TIMEOUT', raw_response: { provider_status: 'FAILED_TIMEOUT' } },
      { id: 'ca_52', campaign_invitee_id: 'ci_5', invitee_name: 'Vikram Malhotra', started_at: new Date(Date.now() - 1800000).toISOString(), ended_at: new Date(Date.now() - 1800000 + 8000).toISOString(), duration_sec: 8, outcome: 'failed', error_message: 'BUSY_SIGNAL', raw_response: { provider_status: 'FAILED_BUSY' } },
      { id: 'ca_53', campaign_invitee_id: 'ci_5', invitee_name: 'Vikram Malhotra', started_at: new Date(Date.now() - 900000).toISOString(), ended_at: new Date(Date.now() - 900000 + 5000).toISOString(), duration_sec: 5, outcome: 'failed', error_message: 'SUBSCRIBER_UNREACHABLE (Exhausted 3 retries)', raw_response: { provider_status: 'FAILED_UNREACHABLE' } }
    ]
  };
}

export const db = new MemoryStore();
