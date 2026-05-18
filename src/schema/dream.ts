export type DreamRunType = "baseline" | "nyxa_modulated";

export type DreamStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed"
  | "cancelled";

export type DreamRun = {
  id: string;
  run_type: DreamRunType;
  status: DreamStatus;
  input_candidate_ids: string[];
  input_session_refs: string[];
  enabled_modulators: string[];
  model: string;
  instructions: string;
  output_candidate_ids: string[];
  metrics_id: string | null;
  created_at: string;
  completed_at: string | null;
};

export type DreamModulator = {
  id: string;
  name: string;
  description: string;
  provenance: boolean;
  confidence: boolean;
  conflict: boolean;
  retention: boolean;
  identity_drift: boolean;
  apprentice_process: boolean;
  audit_trace: boolean;
  active: boolean;
  created_at: string;
};
