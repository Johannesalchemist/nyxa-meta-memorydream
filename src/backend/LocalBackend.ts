import { appendFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CandidateRecallFilter, MemoryCandidate } from "../schema/candidates.js";
import { ensureDir } from "../utils/ensureDir.js";
import { safeJsonStringify } from "../utils/safeJson.js";
import type { BackendInfo, MemoryBackend } from "./MemoryBackend.js";

export class LocalBackend implements MemoryBackend {
  public readonly type = "local" as const;
  private readonly candidateFilePath: string;

  public constructor(private readonly dataDir: string) {
    this.candidateFilePath = join(this.dataDir, "memory_candidates.jsonl");
  }

  public async health(): Promise<BackendInfo> {
    return {
      type: this.type,
      status: "ready",
      detail: `local_backend_active:${this.dataDir}`
    };
  }

  public async storeCandidate(candidate: MemoryCandidate): Promise<void> {
    await this.ensureCandidateFile();
    const line = `${safeJsonStringify(candidate)}\n`;
    await appendFile(this.candidateFilePath, line, { encoding: "utf8" });
  }

  public async recallCandidates(filter: CandidateRecallFilter): Promise<MemoryCandidate[]> {
    const candidates = await this.readLatestCandidates();

    const queried = candidates.filter((candidate) => {
      if (filter.status && candidate.status !== filter.status) {
        return false;
      }

      if (filter.scope && candidate.scope !== filter.scope) {
        return false;
      }

      if (filter.candidate_type && candidate.candidate_type !== filter.candidate_type) {
        return false;
      }

      if (filter.query) {
        return candidate.content.toLowerCase().includes(filter.query.toLowerCase());
      }

      return true;
    });

    const sorted = queried.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return sorted.slice(0, filter.limit);
  }

  public async getCandidateById(candidateId: string): Promise<MemoryCandidate | null> {
    const candidates = await this.readLatestCandidates();
    const found = candidates.find((candidate) => candidate.id === candidateId);
    return found ?? null;
  }

  public async rejectCandidate(candidateId: string): Promise<MemoryCandidate | null> {
    const existing = await this.getCandidateById(candidateId);
    if (!existing) {
      return null;
    }

    const updated: MemoryCandidate = {
      ...existing,
      status: "rejected",
      updated_at: new Date().toISOString()
    };

    await this.storeCandidate(updated);
    return updated;
  }

  private async ensureCandidateFile(): Promise<void> {
    await ensureDir(this.dataDir);
    await writeFile(this.candidateFilePath, "", { flag: "a" });
  }

  private async readLatestCandidates(): Promise<MemoryCandidate[]> {
    try {
      const raw = await readFile(this.candidateFilePath, "utf8");
      const lines = raw.split("\n").filter((line) => line.trim().length > 0);
      const latestById = new Map<string, MemoryCandidate>();

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as MemoryCandidate;
          if (!parsed.id) {
            continue;
          }

          if (latestById.has(parsed.id)) {
            latestById.delete(parsed.id);
          }
          latestById.set(parsed.id, parsed);
        } catch {
          // Ignore malformed lines to keep recall deterministic.
        }
      }

      return [...latestById.values()];
    } catch {
      return [];
    }
  }
}
