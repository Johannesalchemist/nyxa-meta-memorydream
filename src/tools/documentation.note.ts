import type { CandidateScope, CandidateSource, MemoryCandidate } from "../schema/candidates.js";

export type DocumentationNoteInput = {
  content: string;
  scope: CandidateScope;
  purpose: string;
  confidence?: number;
  importance?: number;
  source?: CandidateSource;
};

const ALLOWED_SCOPES: CandidateScope[] = ["personal", "project", "team", "organization"];
const ALLOWED_SOURCES: CandidateSource[] = ["user", "assistant", "agent", "tool", "system", "mcp"];

function clampUnit(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}

export function parseDocumentationNoteInput(input: Record<string, unknown>): DocumentationNoteInput {
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const purpose = typeof input.purpose === "string" ? input.purpose.trim() : "";
  const scope = typeof input.scope === "string" ? input.scope : "";
  const sourceRaw = typeof input.source === "string" ? input.source : "mcp";

  if (!content) {
    throw new Error("documentation_note_content_required");
  }

  if (!purpose) {
    throw new Error("documentation_note_purpose_required");
  }

  if (!ALLOWED_SCOPES.includes(scope as CandidateScope)) {
    throw new Error("documentation_note_scope_invalid");
  }

  if (!ALLOWED_SOURCES.includes(sourceRaw as CandidateSource)) {
    throw new Error("documentation_note_source_invalid");
  }

  return {
    content,
    purpose,
    scope: scope as CandidateScope,
    source: sourceRaw as CandidateSource,
    confidence: clampUnit(input.confidence as number | undefined, 1),
    importance: clampUnit(input.importance as number | undefined, 1)
  };
}

export function buildDocumentationCandidate(input: DocumentationNoteInput, id: string): MemoryCandidate {
  const now = new Date().toISOString();
  return {
    id,
    content: input.content,
    candidate_type: "documentation_note",
    source: input.source ?? "mcp",
    scope: input.scope,
    purpose: input.purpose,
    confidence: input.confidence ?? 1,
    importance: input.importance ?? 1,
    status: "pending",
    created_at: now,
    updated_at: now
  };
}
