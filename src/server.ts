import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";
import { loadConfig, type NyxaConfig } from "./config/env.js";
import { ensureDir } from "./utils/ensureDir.js";
import { safeJsonStringify } from "./utils/safeJson.js";
import { AuditLog } from "./audit/AuditLog.js";
import { enforcePolicy } from "./policy/enforcePolicy.js";
import { LocalBackend } from "./backend/LocalBackend.js";
import { RemoteBackendStub } from "./backend/RemoteBackend.js";
import type { MemoryBackend } from "./backend/MemoryBackend.js";
import type { AuditEvent } from "./schema/audit.js";
import { buildSystemStatus } from "./tools/system.status.js";
import { buildPolicyMode } from "./tools/policy.mode.js";
import { buildAuditTrace, normalizeAuditTraceLimit } from "./tools/audit.trace.js";
import { buildDocumentationCandidate, parseDocumentationNoteInput } from "./tools/documentation.note.js";
import { buildStoredCandidate, parseStoreCandidateInput } from "./tools/memory.store_candidate.js";
import { parseRecallCandidatesInput } from "./tools/memory.recall_candidates.js";
import { parseWhyCandidateInput } from "./tools/memory.why_candidate.js";
import { parseRejectCandidateInput } from "./tools/memory.reject_candidate.js";

type ToolResultPayload = Record<string, unknown>;

function toolJsonResult(payload: ToolResultPayload) {
  return {
    content: [
      {
        type: "text" as const,
        text: safeJsonStringify(payload, 2)
      }
    ]
  };
}

export class NyxaGovernedMemoryServer {
  private readonly config: NyxaConfig;
  private readonly auditLog: AuditLog;
  private readonly backend: MemoryBackend;
  private readonly server: McpServer;

  public constructor() {
    this.config = loadConfig();
    this.auditLog = new AuditLog(this.config.dataDir);
    this.backend = this.createBackend(this.config);
    this.server = new McpServer({
      name: this.config.appName,
      version: this.config.version
    });
  }

  public async start(): Promise<void> {
    await ensureDir(this.config.dataDir);
    await this.auditLog.init();

    this.registerTools();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  private createBackend(config: NyxaConfig): MemoryBackend {
    if (config.memoryBackend === "local") {
      return new LocalBackend(config.dataDir);
    }

    return new RemoteBackendStub(config.memoryBackend);
  }

  private registerTools(): void {
    const serverAny = this.server as any;
    serverAny.tool("system.status", "Returns MCP status and feature flags.", {}, async () =>
      this.runTool("system.status", {}, async () => {
        const backendInfo = await this.backend.health();
        return {
          ...buildSystemStatus(this.config),
          backend_status: backendInfo.status
        };
      })
    );

    serverAny.tool("policy.mode", "Returns current policy mode with allowed and blocked capabilities.", {}, async () =>
      this.runTool("policy.mode", {}, async () => buildPolicyMode(this.config))
    );

    serverAny.tool(
      "audit.trace",
      "Returns recent audit events.",
      { limit: z.number().optional() },
      async (input: any) => {
        const decision = enforcePolicy("audit.trace", this.config.agentMode, this.config.version);

        if (!decision.allowed) {
          await this.audit("blocked", "audit.trace", {
            reason: decision.reason,
            input
          });

          return toolJsonResult({
            error: "policy_blocked",
            reason: decision.reason,
            tool: "audit.trace"
          });
        }

        await this.audit("allowed", "audit.trace", { input });
        const limit = normalizeAuditTraceLimit({ limit: input.limit });
        const events = await this.auditLog.recent(limit);
        return toolJsonResult(buildAuditTrace(events));
      }
    );

    serverAny.tool(
      "documentation.note",
      "Creates a documentation note candidate.",
      {
        content: z.string(),
        scope: z.string(),
        purpose: z.string(),
        confidence: z.number().optional(),
        importance: z.number().optional(),
        source: z.string().optional()
      },
      async (input: any) =>
        this.runTool("documentation.note", input, async () => {
          const parsed = parseDocumentationNoteInput(input);
          const id = randomUUID();
          const candidate = buildDocumentationCandidate(parsed, id);
          await this.backend.storeCandidate(candidate);

          return {
            id,
            status: "written",
            candidate,
            note: "This is a documentation candidate. Not authoritative memory."
          };
        })
    );

    serverAny.tool(
      "memory.store_candidate",
      "Stores a memory candidate.",
      {
        content: z.string(),
        candidate_type: z.string(),
        source: z.string(),
        scope: z.string(),
        purpose: z.string(),
        confidence: z.number(),
        importance: z.number()
      },
      async (input: any) =>
        this.runTool("memory.store_candidate", input, async () => {
          const parsed = parseStoreCandidateInput(input);
          const id = randomUUID();
          const candidate = buildStoredCandidate(parsed, id);
          await this.backend.storeCandidate(candidate);

          return {
            id,
            status: "candidate_stored",
            candidate,
            note: "This is a candidate only. Not authoritative memory. Requires human review before promotion."
          };
        })
    );

    serverAny.tool(
      "memory.recall_candidates",
      "Recalls memory candidates by query and filters.",
      {
        query: z.string().optional(),
        scope: z.string().optional(),
        candidate_type: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().optional()
      },
      async (input: any) =>
        this.runTool("memory.recall_candidates", input, async () => {
          const filter = parseRecallCandidatesInput(input);
          const candidates = await this.backend.recallCandidates(filter);

          return {
            candidates,
            total_returned: candidates.length,
            filter
          };
        })
    );

    serverAny.tool(
      "memory.why_candidate",
      "Returns provenance for a candidate id.",
      { candidate_id: z.string() },
      async (input: any) =>
        this.runTool("memory.why_candidate", input, async () => {
          const parsed = parseWhyCandidateInput(input);
          const candidate = await this.backend.getCandidateById(parsed.candidate_id);

          if (!candidate) {
            return {
              id: parsed.candidate_id,
              found: false,
              candidate: null,
              provenance: {
                created_at: "",
                source: "",
                purpose: "",
                confidence: 0,
                importance: 0,
                candidate_type: "",
                scope: "",
                status: ""
              }
            };
          }

          return {
            id: candidate.id,
            found: true,
            candidate,
            provenance: {
              created_at: candidate.created_at,
              source: candidate.source,
              purpose: candidate.purpose,
              confidence: candidate.confidence,
              importance: candidate.importance,
              candidate_type: candidate.candidate_type,
              scope: candidate.scope,
              status: candidate.status
            }
          };
        })
    );

    serverAny.tool(
      "memory.reject_candidate",
      "Rejects an existing candidate by appending a rejected state record.",
      { candidate_id: z.string(), reason: z.string().optional() },
      async (input: any) =>
        this.runTool("memory.reject_candidate", input, async () => {
          const parsed = parseRejectCandidateInput(input);
          const updated = await this.backend.rejectCandidate(parsed.candidate_id);

          if (!updated) {
            return {
              id: parsed.candidate_id,
              status: "not_found",
              updated_at: new Date().toISOString()
            };
          }

          return {
            id: updated.id,
            status: "rejected",
            updated_at: updated.updated_at
          };
        })
    );
  }

  private async runTool(
    toolName: string,
    input: Record<string, unknown>,
    action: () => Promise<ToolResultPayload>
  ) {
    const policyDecision = enforcePolicy(toolName, this.config.agentMode, this.config.version);

    if (!policyDecision.allowed) {
      await this.audit("blocked", toolName, {
        reason: policyDecision.reason,
        input
      });

      return toolJsonResult({
        error: "policy_blocked",
        reason: policyDecision.reason,
        tool: toolName
      });
    }

    try {
      const payload = await action();
      await this.audit("allowed", toolName, { input });
      return toolJsonResult(payload);
    } catch (error) {
      await this.audit("error", toolName, {
        input,
        error: error instanceof Error ? error.message : "unknown"
      });
      return toolJsonResult({
        error: "internal_error",
        tool: toolName
      });
    }
  }

  private async audit(
    result: AuditEvent["result"],
    toolName: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const event: AuditEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      actor: "mcp",
      action: "tool.call",
      tool: toolName,
      mode: this.config.agentMode,
      backend: this.config.memoryBackend,
      result
    };

    if (details) {
      event.details = details;
    }

    await this.auditLog.append(event);
  }
}
