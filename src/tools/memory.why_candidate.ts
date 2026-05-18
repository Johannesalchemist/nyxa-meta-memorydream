export type WhyCandidateInput = {
  candidate_id: string;
};

export function parseWhyCandidateInput(input: Record<string, unknown>): WhyCandidateInput {
  const candidateId = typeof input.candidate_id === "string" ? input.candidate_id.trim() : "";

  if (!candidateId) {
    throw new Error("why_candidate_id_required");
  }

  return {
    candidate_id: candidateId
  };
}
