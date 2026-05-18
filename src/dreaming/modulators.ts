import type { DreamModulator } from "../schema/dream.js";

export const BASELINE_MODULATOR: DreamModulator = {
  id: "modulator_baseline",
  name: "Baseline",
  description: "Control modulator with all Nyxa layers disabled. Used for ablation baseline runs.",
  provenance: false,
  confidence: false,
  conflict: false,
  retention: false,
  identity_drift: false,
  apprentice_process: false,
  audit_trace: false,
  active: true,
  created_at: "2026-05-18T00:00:00.000Z"
};

export const NYXA_FULL_MODULATOR: DreamModulator = {
  id: "modulator_nyxa_full",
  name: "Nyxa Full",
  description: "Full Nyxa modulator with all layers enabled.",
  provenance: true,
  confidence: true,
  conflict: true,
  retention: true,
  identity_drift: true,
  apprentice_process: true,
  audit_trace: true,
  active: false,
  created_at: "2026-05-18T00:00:00.000Z"
};

export const MODULATOR_REGISTRY: Record<string, DreamModulator> = {
  [BASELINE_MODULATOR.id]: BASELINE_MODULATOR,
  [NYXA_FULL_MODULATOR.id]: NYXA_FULL_MODULATOR
};

export function getModulator(id: string): DreamModulator | null {
  return MODULATOR_REGISTRY[id] ?? null;
}
