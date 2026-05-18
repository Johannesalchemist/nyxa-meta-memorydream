export type CandidateType =
  | "observation"
  | "documentation_note"
  | "decision"
  | "risk"
  | "process_pattern"
  | "preference"
  | "open_question";

export type CandidateSource = "user" | "assistant" | "agent" | "tool" | "system" | "mcp";

export type CandidateScope = "personal" | "project" | "team" | "organization";

export type CandidateStatus = "pending" | "rejected" | "superseded";

export type MemoryCandidate = {
  id: string;
  content: string;
  candidate_type: CandidateType;
  source: CandidateSource;
  scope: CandidateScope;
  purpose: string;
  confidence: number;
  importance: number;
  status: CandidateStatus;
  created_at: string;
  updated_at: string;
};

export type CandidateRecallFilter = {
  query?: string;
  scope?: CandidateScope;
  candidate_type?: CandidateType;
  status?: CandidateStatus;
  limit: number;
};
