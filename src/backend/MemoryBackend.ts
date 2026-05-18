import type { CandidateRecallFilter, MemoryCandidate } from "../schema/candidates.js";

export type MemoryBackendType =
  | "local"
  | "remote"
  | "dedicated_node"
  | "customer_owned";

export type BackendInfo = {
  type: MemoryBackendType;
  status: "ready" | "stub";
  detail: string;
};

export interface MemoryBackend {
  readonly type: MemoryBackendType;
  health(): Promise<BackendInfo>;
  storeCandidate(candidate: MemoryCandidate): Promise<void>;
  recallCandidates(filter: CandidateRecallFilter): Promise<MemoryCandidate[]>;
  getCandidateById(candidateId: string): Promise<MemoryCandidate | null>;
  rejectCandidate(candidateId: string): Promise<MemoryCandidate | null>;
}
