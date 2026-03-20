export type BlockFamily = 'OFF' | 'EQ' | 'PITCH' | 'DELAY' | 'REVERB';

export interface EffectMetadata {
  id: string; // e.g. "EQ_3_BAND_PARAMETRIC"
  family: BlockFamily;
  name: string;
  dspCostPercent: number;
  lfoCost: number;
  effectMemoryMs: number;
  usesMicroprocessorAssist: boolean;
  microAssistGroup?: string; // If applicable (e.g., PHASOR, STEREO_LEZLIE, RING_MODULATOR)
  parametersSchema?: any; // Placeholder for future parameter schema definitions
}

export type BlockId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Block {
  id: BlockId;
  family: BlockFamily;
  effectType: string | null; // matches EffectMetadata.id
  parameters: Record<string, any>;
}

export type RouteSource = 'L_IN' | 'R_IN' | `Block${BlockId}.L` | `Block${BlockId}.R` | `Block${BlockId}.M`;
export type RouteDestination = `Block${BlockId}` | 'L_OUT' | 'R_OUT';

export interface Route {
  id: string;
  source: RouteSource;
  destination: RouteDestination;
  levelDb: number | 'OFF'; // -48 to 0, or OFF
}

export interface MixSettings {
  // per-block level to LR out
  blockLevels: Record<BlockId, number | 'OFF'>;
  // direct level from input
  directLevel: number | 'OFF';
  // master effects level
  masterEffectsLevel: number | 'OFF';
}

export interface Modulation {
  id: string;
  source: string; // e.g., 'MIDI', 'LFO1'
  targetBlockId: BlockId;
  targetParameter: string;
  amplitude: number;
}

export interface Program {
  bank: 'preset' | 'user';
  number: number; // 0..99
  name: string; // max 14 chars
  blocks: Block[];
  routes: Route[];
  mix: MixSettings;
  modulations: Modulation[];
}