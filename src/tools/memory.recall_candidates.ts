import type {
  CandidateRecallFilter,
  CandidateScope,
  CandidateStatus,
  CandidateType
} from "../schema/candidates.js";

const ALLOWED_TYPES: CandidateType[] = [
  "observation",
  "documentation_note",
  "decision",
  "risk",
  "process_pattern",
  "preference",
  "open_question"
];
const ALLOWED_SCOPES: CandidateScope[] = ["personal", "project", "team", "organization"];
const ALLOWED_STATUS: CandidateStatus[] = ["pending", "rejected", "superseded"];

export function parseRecallCandidatesInput(input: Record<string, unknown>): CandidateRecallFilter {
  const query = typeof input.query === "string" ? input.query.trim() : "";
  const scope = typeof input.scope === "string" ? input.scope : "";
  const candidateType = typeof input.candidate_type === "string" ? input.candidate_type : "";
  const status = typeof input.status === "string" ? input.status : "pending";
  const rawLimit = typeof input.limit === "number" ? input.limit : 20;
  const limit = Math.max(1, Math.min(100, Math.floor(rawLimit)));

  if (scope && !ALLOWED_SCOPES.includes(scope as CandidateScope)) {
    throw new Error("recall_candidates_scope_invalid");
  }

  if (candidateType && !ALLOWED_TYPES.includes(candidateType as CandidateType)) {
    throw new Error("recall_candidates_type_invalid");
  }

  if (!ALLOWED_STATUS.includes(status as CandidateStatus)) {
    throw new Error("recall_candidates_status_invalid");
  }

  const filter: CandidateRecallFilter = {
    status: status as CandidateStatus,
    limit
  };

  if (query) {
    filter.query = query;
  }
  if (scope) {
    filter.scope = scope as CandidateScope;
  }
  if (candidateType) {
    filter.candidate_type = candidateType as CandidateType;
  }

  return filter;
}
