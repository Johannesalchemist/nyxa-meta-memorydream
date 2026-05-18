import type { CandidateRecallFilter, MemoryCandidate } from "../schema/candidates.js";
import type { BackendInfo, MemoryBackend, MemoryBackendType } from "./MemoryBackend.js";

export class RemoteBackendStub implements MemoryBackend {
  public constructor(public readonly type: Exclude<MemoryBackendType, "local">) {}

  public async health(): Promise<BackendInfo> {
    return {
      type: this.type,
      status: "stub",
      detail: `${this.type}_backend_reserved_for_future_versions`
    };
  }

  public async storeCandidate(_candidate: MemoryCandidate): Promise<void> {
    throw new Error("remote_candidate_storage_not_implemented_in_v02");
  }

  public async recallCandidates(_filter: CandidateRecallFilter): Promise<MemoryCandidate[]> {
    return [];
  }

  public async getCandidateById(_candidateId: string): Promise<MemoryCandidate | null> {
    return null;
  }

  public async rejectCandidate(_candidateId: string): Promise<MemoryCandidate | null> {
    return null;
  }
}
