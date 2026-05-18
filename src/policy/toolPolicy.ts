import type { NyxaAgentMode } from "./modes.js";

export type ToolPolicy = {
  toolName: string;
  minimumMode: NyxaAgentMode;
  writesAuthoritativeMemory: boolean;
  requiresHumanApproval: boolean;
  executionRisk: "none" | "low" | "medium" | "high";
  allowedInV01: boolean;
};

export const TOOL_POLICIES: Record<string, ToolPolicy> = {
  "system.status": {
    toolName: "system.status",
    minimumMode: "observe_only",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "none",
    allowedInV01: true
  },
  "policy.mode": {
    toolName: "policy.mode",
    minimumMode: "observe_only",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "none",
    allowedInV01: true
  },
  "audit.trace": {
    toolName: "audit.trace",
    minimumMode: "observe_only",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "none",
    allowedInV01: true
  },
  "documentation.note": {
    toolName: "documentation.note",
    minimumMode: "document",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "low",
    allowedInV01: false
  },
  "memory.store_candidate": {
    toolName: "memory.store_candidate",
    minimumMode: "document",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "low",
    allowedInV01: false
  },
  "memory.recall_candidates": {
    toolName: "memory.recall_candidates",
    minimumMode: "observe_only",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "none",
    allowedInV01: false
  },
  "memory.why_candidate": {
    toolName: "memory.why_candidate",
    minimumMode: "observe_only",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "none",
    allowedInV01: false
  },
  "memory.reject_candidate": {
    toolName: "memory.reject_candidate",
    minimumMode: "document",
    writesAuthoritativeMemory: false,
    requiresHumanApproval: false,
    executionRisk: "low",
    allowedInV01: false
  }
};
