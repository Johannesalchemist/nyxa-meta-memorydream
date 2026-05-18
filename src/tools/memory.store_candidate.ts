import type {
  CandidateScope,
  CandidateSource,
  CandidateType,
  MemoryCandidate
} from "../schema/candidates.js";

export type StoreCandidateInput = {
  content: string;
  candidate_type: CandidateType;
  source: CandidateSource;
  scope: CandidateScope;
  purpose: string;
  confidence: number;
  importance: number;
};

const ALLOWED_TYPES: CandidateType[] = [
  "observation",
  "documentation_note",
  "decision",
  "risk",
  "process_pattern",
  "preference",
  "open_question"
];
const ALLOWED_SOURCES: CandidateSource[] = ["user", "assistant", "agent", "tool", "system", "mcp"];
const ALLOWED_SCOPES: CandidateScope[] = ["personal", "project", "team", "organization"];

function clampUnit(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function parseStoreCandidateInput(input: Record<string, unknown>): StoreCandidateInput {
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const candidateType = typeof input.candidate_type === "string" ? input.candidate_type : "";
  const source = typeof input.source === "string" ? input.source : "";
  const scope = typeof input.scope === "string" ? input.scope : "";
  const purpose = typeof input.purpose === "string" ? input.purpose.trim() : "";
  const confidence = typeof input.confidence === "number" ? input.confidence : Number.NaN;
  const importance = typeof input.importance === "number" ? input.importance : Number.NaN;

  if (!content) {
    throw new Error("store_candidate_content_required");
  }
  if (!ALLOWED_TYPES.includes(candidateType as CandidateType)) {
    throw new Error("store_candidate_type_invalid");
  }
  if (!ALLOWED_SOURCES.includes(source as CandidateSource)) {
    throw new Error("store_candidate_source_invalid");
  }
  if (!ALLOWED_SCOPES.includes(scope as CandidateScope)) {
    throw new Error("store_candidate_scope_invalid");
  }
  if (!purpose) {
    throw new Error("store_candidate_purpose_required");
  }
  if (!Number.isFinite(confidence)) {
    throw new Error("store_candidate_confidence_required");
  }
  if (!Number.isFinite(importance)) {
    throw new Error("store_candidate_importance_required");
  }

  return {
    content,
    candidate_type: candidateType as CandidateType,
    source: source as CandidateSource,
    scope: scope as CandidateScope,
    purpose,
    confidence: clampUnit(confidence),
    importance: clampUnit(importance)
  };
}

export function buildStoredCandidate(input: StoreCandidateInput, id: string): MemoryCandidate {
  const now = new Date().toISOString();
  return {
    id,
    content: input.content,
    candidate_type: input.candidate_type,
    source: input.source,
    scope: input.scope,
    purpose: input.purpose,
    confidence: input.confidence,
    importance: input.importance,
    status: "pending",
    created_at: now,
    updated_at: now
  };
}
