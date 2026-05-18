import type { DreamRun } from "../schema/dream.js";
import type { DreamMetrics } from "../schema/metrics.js";

export function calculateMetrics(
  _run: DreamRun,
  _inputCount: number,
  _outputCount: number
): DreamMetrics {
  throw new Error(
    "DreamMetrics calculation is not implemented in v0.2. This is a schema scaffolding stub."
  );
}

export function emptyMetrics(runId: string): DreamMetrics {
  return {
    id: `metrics_${runId}`,
    dream_run_id: runId,
    created_at: new Date().toISOString(),
    input_count: 0,
    output_count: 0,
    compression_ratio: null,
    deduplication_count: 0,
    conflict_candidates_created: 0,
    stale_candidates_marked: 0,
    provenance_coverage: null,
    average_confidence: null,
    low_confidence_output_rate: null,
    wrong_merge_flags: 0,
    drift_flags: 0,
    retention_flags: 0,
    human_review_score: null,
    review_notes: null
  };
}
