export type DreamMetrics = {
  id: string;
  dream_run_id: string;
  created_at: string;
  input_count: number;
  output_count: number;
  compression_ratio: number | null;
  deduplication_count: number;
  conflict_candidates_created: number;
  stale_candidates_marked: number;
  provenance_coverage: number | null;
  average_confidence: number | null;
  low_confidence_output_rate: number | null;
  wrong_merge_flags: number;
  drift_flags: number;
  retention_flags: number;
  human_review_score: number | null;
  review_notes: string | null;
};
