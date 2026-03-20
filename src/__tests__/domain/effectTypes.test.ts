import { describe, it, expect } from 'vitest';
import { effectTypes } from '../../domain/effectTypes';
import { getEffectTypesByFamily, buildDefaultParameters, changeBlockFamily, changeBlockEffectType, sanitizeParameters } from '../../domain/parameterHelpers';
import type { Block } from '../../domain/types';

describe('parameterHelpers', () => {
  const mockTable = effectTypes;

  describe('getEffectTypesByFamily', () => {
    it('returns empty array for OFF', () => {
      expect(getEffectTypesByFamily('OFF', mockTable)).toEqual([]);
    });

    it('returns only EQ effects for EQ family', () => {
      const eqEffects = getEffectTypesByFamily('EQ', mockTable);
      expect(eqEffects.length).toBeGreaterThan(0);
      expect(eqEffects.every(e => e.family === 'EQ')).toBe(true);
    });
  });

  describe('buildDefaultParameters', () => {
    it('returns empty object for undefined effect', () => {
      expect(buildDefaultParameters(undefined)).toEqual({});
    });

    it('returns defaults matching schema', () => {
      const eqLowpass = mockTable.find(e => e.id === 'EQ_LOWPASS_FILTER');
      const params = buildDefaultParameters(eqLowpass);
      expect(params).toHaveProperty('lowpassFcHz');
      // min is 20
      expect(params.lowpassFcHz).toBe(20);
    });

    it('returns defaults for enum', () => {
      const pitchChorus = mockTable.find(e => e.id === 'PITCH_MONO_CHORUS');
      const params = buildDefaultParameters(pitchChorus);
      expect(params.chorusShape).toBe('Sine'); // first enum value
    });

    it('returns 0 if 0 is between min and max', () => {
      const eqShelf = mockTable.find(e => e.id === 'EQ_LOWPASS_SHELF');
      const params = buildDefaultParameters(eqShelf);
      // gain is -14 to 14, default should be 0
      expect(params.gainDb).toBe(0);
    });
  });

  describe('sanitizeParameters', () => {
    it('removes unknown keys', () => {
      const eqLowpass = mockTable.find(e => e.id === 'EQ_LOWPASS_FILTER');
      const result = sanitizeParameters({ unknownKey: 123, lowpassFcHz: 100 }, eqLowpass);
      expect(result).not.toHaveProperty('unknownKey');
      expect(result).toHaveProperty('lowpassFcHz', 100);
    });

    it('clamps values correctly', () => {
      const eqLowpass = mockTable.find(e => e.id === 'EQ_LOWPASS_FILTER');
      const result = sanitizeParameters({ lowpassFcHz: 50000 }, eqLowpass);
      expect(result.lowpassFcHz).toBe(10000); // Max is 10kHz
    });

    it('reverts to default enum if invalid enum value provided', () => {
      const pitchChorus = mockTable.find(e => e.id === 'PITCH_MONO_CHORUS');
      const result = sanitizeParameters({ chorusShape: 'InvalidShape', speed: 10 }, pitchChorus);
      expect(result.chorusShape).toBe('Sine'); // Default enum value
      expect(result.speed).toBe(10);
    });
  });

  describe('changeBlockFamily', () => {
    const defaultBlock: Block = {
      id: 1,
      family: 'EQ',
      effectType: 'EQ_LOWPASS_FILTER',
      parameters: { lowpassFcHz: 1000 }
    };

    it('clears state when changing to OFF', () => {
      const result = changeBlockFamily(defaultBlock, 'OFF', mockTable);
      expect(result.family).toBe('OFF');
      expect(result.effectType).toBeNull();
      expect(result.parameters).toEqual({});
    });

    it('clears effectType and params when changing to different family', () => {
      const result = changeBlockFamily(defaultBlock, 'PITCH', mockTable);
      expect(result.family).toBe('PITCH');
      expect(result.effectType).toBeNull();
      expect(result.parameters).toEqual({});
    });

    it('keeps effectType if changing to same family', () => {
      const result = changeBlockFamily(defaultBlock, 'EQ', mockTable);
      expect(result.family).toBe('EQ');
      expect(result.effectType).toBe('EQ_LOWPASS_FILTER');
      expect(result.parameters).toEqual({ lowpassFcHz: 1000 });
    });
  });

  describe('changeBlockEffectType', () => {
    const defaultBlock: Block = {
      id: 1,
      family: 'EQ',
      effectType: 'EQ_LOWPASS_FILTER',
      parameters: { lowpassFcHz: 1000 }
    };

    it('merges existing matching parameters into new default params', () => {
      // Changing from Lowpass Filter to Lowpass Shelf
      // Both have lowpassFcHz
      const result = changeBlockEffectType(defaultBlock, 'EQ_LOWPASS_SHELF', mockTable);
      expect(result.effectType).toBe('EQ_LOWPASS_SHELF');
      expect(result.parameters.lowpassFcHz).toBe(1000); // Carried over
      expect(result.parameters.gainDb).toBe(0); // Default applied for new field
    });
  });
});
