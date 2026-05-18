export type RejectCandidateInput = {
  candidate_id: string;
  reason?: string;
};

export function parseRejectCandidateInput(input: Record<string, unknown>): RejectCandidateInput {
  const candidateId = typeof input.candidate_id === "string" ? input.candidate_id.trim() : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";

  if (!candidateId) {
    throw new Error("reject_candidate_id_required");
  }

  if (!reason) {
    return {
      candidate_id: candidateId
    };
  }

  return {
    candidate_id: candidateId,
    reason
  };
}
