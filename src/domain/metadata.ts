import type { EffectMetadata } from './types';

// Placeholder effect tables with basic examples as requested
export const effectMetadataTable: Record<string, EffectMetadata> = {
  'EQ_3_BAND_PARAMETRIC': {
    id: 'EQ_3_BAND_PARAMETRIC',
    family: 'EQ',
    name: '3 Band Parametric EQ',
    dspCostPercent: 10,
    lfoCost: 0,
    effectMemoryMs: 0,
    usesMicroprocessorAssist: false
  },
  'PITCH_CHORUS': {
    id: 'PITCH_CHORUS',
    family: 'PITCH',
    name: 'Stereo Chorus',
    dspCostPercent: 15,
    lfoCost: 1,
    effectMemoryMs: 0,
    usesMicroprocessorAssist: false
  },
  'PITCH_PHASOR': {
    id: 'PITCH_PHASOR',
    family: 'PITCH',
    name: 'Phasor',
    dspCostPercent: 20,
    lfoCost: 1,
    effectMemoryMs: 0,
    usesMicroprocessorAssist: true,
    microAssistGroup: 'PHASOR'
  },
  'PITCH_STEREO_LEZLIE': {
    id: 'PITCH_STEREO_LEZLIE',
    family: 'PITCH',
    name: 'Stereo Lezlie',
    dspCostPercent: 25,
    lfoCost: 2,
    effectMemoryMs: 0,
    usesMicroprocessorAssist: true,
    microAssistGroup: 'STEREO_LEZLIE'
  },
  'PITCH_RING_MODULATOR': {
    id: 'PITCH_RING_MODULATOR',
    family: 'PITCH',
    name: 'Ring Modulator',
    dspCostPercent: 10,
    lfoCost: 0,
    effectMemoryMs: 0,
    usesMicroprocessorAssist: true,
    microAssistGroup: 'RING_MODULATOR'
  },
  'DELAY_MONO': {
    id: 'DELAY_MONO',
    family: 'DELAY',
    name: 'Mono Delay',
    dspCostPercent: 10,
    lfoCost: 0,
    effectMemoryMs: 0, // Calculated dynamically from parameters
    usesMicroprocessorAssist: false
  },
  'REVERB_HALL': {
    id: 'REVERB_HALL',
    family: 'REVERB',
    name: 'Hall Reverb',
    dspCostPercent: 40,
    lfoCost: 0, // some large reverbs use 1, hall could be 0 or 1
    effectMemoryMs: 0,
    usesMicroprocessorAssist: false
  }
};