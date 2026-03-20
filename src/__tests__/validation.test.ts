import { describe, it, expect } from 'vitest';
import { validateProgram } from '../domain/validation';
import type { Program, Block } from '../domain/types';

describe('Validation Engine', () => {
  const getEmptyProgram = (): Program => {
    const blocks: Block[] = [];
    for (let i = 1; i <= 8; i++) {
      blocks.push({ id: i as any, family: 'OFF', effectType: null, parameters: {} });
    }
    return {
      bank: 'user',
      number: 0,
      name: 'Test',
      blocks,
      routes: [],
      mix: { blockLevels: { 1: 'OFF', 2: 'OFF', 3: 'OFF', 4: 'OFF', 5: 'OFF', 6: 'OFF', 7: 'OFF', 8: 'OFF' }, directLevel: 'OFF', masterEffectsLevel: 0 },
      modulations: []
    };
  };

  it('validates empty program', () => {
    const p = getEmptyProgram();
    const result = validateProgram(p);
    expect(result.isValid).toBe(true);
    expect(result.metrics.dspUsedPercent).toBe(0);
  });

  it('detects DSP_IS_FULL correctly and calculates route costs', () => {
    const p = getEmptyProgram();
    // 3 x Hall Reverb = 120% DSP -> DSP_IS_FULL
    p.blocks[0] = { id: 1, family: 'REVERB', effectType: 'REVERB_HALL', parameters: {} };
    p.blocks[1] = { id: 2, family: 'REVERB', effectType: 'REVERB_HALL', parameters: {} };
    p.blocks[2] = { id: 3, family: 'REVERB', effectType: 'REVERB_HALL', parameters: {} };

    // Add 0dB route (+1%) and attenuated route (+2%)
    p.routes.push({ id: 'r1', source: 'Block1.L', destination: 'Block2', levelDb: 0 });
    p.routes.push({ id: 'r2', source: 'Block2.L', destination: 'Block3', levelDb: -6 });

    const result = validateProgram(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'DSP_IS_FULL')).toBe(true);
    expect(result.metrics.dspUsedPercent).toBe(120 + 1 + 2); // 123
  });

  it('detects BLOCK_COMBINATION_NOT_ALLOWED for multiple microprocessor assists', () => {
    const p = getEmptyProgram();
    p.blocks[0] = { id: 1, family: 'PITCH', effectType: 'PITCH_PHASOR', parameters: {} }; // Uses assist
    p.blocks[1] = { id: 2, family: 'PITCH', effectType: 'PITCH_STEREO_LEZLIE', parameters: {} }; // Uses assist

    const result = validateProgram(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'BLOCK_COMBINATION_NOT_ALLOWED')).toBe(true);
  });

  it('detects OUT_OF_LFOs', () => {
    const p = getEmptyProgram();
    // 3 x Stereo Lezlie (2 LFOs each) = 6 LFOs -> OUT_OF_LFOs
    p.blocks[0] = { id: 1, family: 'PITCH', effectType: 'PITCH_STEREO_LEZLIE', parameters: {} };
    p.blocks[1] = { id: 2, family: 'PITCH', effectType: 'PITCH_STEREO_LEZLIE', parameters: {} }; // Duplicate allowed for test purposes
    p.blocks[2] = { id: 3, family: 'PITCH', effectType: 'PITCH_STEREO_LEZLIE', parameters: {} };
    // Ignore the microprocessor assist error for this specific assertion
    const result = validateProgram(p);
    expect(result.errors.some(e => e.type === 'OUT_OF_LFOs')).toBe(true);
    expect(result.metrics.lfosUsed).toBe(6);
  });

  it('detects EFFECT_MEMORY_IS_FULL for single delay line over 5000ms', () => {
    const p = getEmptyProgram();
    p.blocks[0] = { id: 1, family: 'DELAY', effectType: 'DELAY_MONO', parameters: { delayTimeMs: 5001 } };

    const result = validateProgram(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'EFFECT_MEMORY_IS_FULL')).toBe(true);
  });

  it('detects EFFECT_MEMORY_IS_FULL for total delay memory over 5455.9ms', () => {
    const p = getEmptyProgram();
    p.blocks[0] = { id: 1, family: 'DELAY', effectType: 'DELAY_MONO', parameters: { delayTimeMs: 4000 } };
    p.blocks[1] = { id: 2, family: 'DELAY', effectType: 'DELAY_MONO', parameters: { delayTimeMs: 2000 } }; // 6000ms total

    const result = validateProgram(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.type === 'EFFECT_MEMORY_IS_FULL')).toBe(true);
    expect(result.metrics.delayMemoryUsedMs).toBe(6000);
  });

  it('detects inaudible blocks via graph traversal', () => {
    const p = getEmptyProgram();
    p.blocks[0] = { id: 1, family: 'EQ', effectType: 'EQ_3_BAND_PARAMETRIC', parameters: {} };
    p.blocks[1] = { id: 2, family: 'EQ', effectType: 'EQ_3_BAND_PARAMETRIC', parameters: {} };

    // Block 1 has input but no output
    p.routes.push({ id: 'r1', source: 'L_IN', destination: 'Block1', levelDb: 0 });

    // Block 2 has output but no input
    p.routes.push({ id: 'r2', source: 'Block2.L', destination: 'L_OUT', levelDb: 0 });

    const result = validateProgram(p);
    expect(result.metrics.inaudibleBlocks).toContain(1);
    expect(result.metrics.inaudibleBlocks).toContain(2);
  });

  it('passes audibility when block is correctly routed', () => {
    const p = getEmptyProgram();
    p.blocks[0] = { id: 1, family: 'EQ', effectType: 'EQ_3_BAND_PARAMETRIC', parameters: {} };

    p.routes.push({ id: 'r1', source: 'L_IN', destination: 'Block1', levelDb: 0 });
    p.routes.push({ id: 'r2', source: 'Block1.L', destination: 'L_OUT', levelDb: 0 });

    const result = validateProgram(p);
    expect(result.metrics.inaudibleBlocks).not.toContain(1);
  });

  it('detects clipping risks when multiple routes hit same destination', () => {
    const p = getEmptyProgram();
    p.routes.push({ id: 'r1', source: 'L_IN', destination: 'Block1', levelDb: 0 });
    p.routes.push({ id: 'r2', source: 'R_IN', destination: 'Block1', levelDb: 0 });

    const result = validateProgram(p);
    expect(result.metrics.clippingRisks).toContain('Block1');
  });

  it('detects feedback loops via DFS', () => {
    const p = getEmptyProgram();
    p.routes.push({ id: 'r1', source: 'Block1.L', destination: 'Block2', levelDb: 0 });
    p.routes.push({ id: 'r2', source: 'Block2.L', destination: 'Block1', levelDb: 0 });

    const result = validateProgram(p);
    expect(result.warnings.some(w => w.type === 'FEEDBACK_LOOP')).toBe(true);
  });
});