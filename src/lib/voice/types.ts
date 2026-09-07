export type VoiceUrgency = "low" | "normal" | "high";

export interface LeaveMessageInput {
  name: string;
  email?: string;
  phone?: string;
  topic: string;
  transcript_excerpt?: string;
  urgency?: VoiceUrgency;
}

export interface LeaveMessageRecord extends LeaveMessageInput {
  id: string;
  createdAt: string;
  ip?: string;
}

export interface EphemeralTokenResponse {
  value: string;
  expires_at: number;
}

export interface ProfileSearchResult {
  answer: string;
  details: string[];
}
