import { describe, it, expect } from 'vitest';
import { encodeMidiEdit, decodeMidiEdit } from '../../sysex/qv2EditCodec';

describe('qv2EditCodec', () => {
  it('encodes and decodes MIDI Edit payload correctly', () => {
    const data = {
      functionGroup: 0, // PARAMETER
      block: 3,
      page: 1,
      parameter: 5,
      value: 1234
    };

    const encoded = encodeMidiEdit(data);
    expect(encoded.length).toBe(7);

    // Check first 4 bytes are direct mapping
    expect(encoded[0]).toBe(0);
    expect(encoded[1]).toBe(3);
    expect(encoded[2]).toBe(1);
    expect(encoded[3]).toBe(5);

    const decoded = decodeMidiEdit(encoded);
    expect(decoded).toEqual(data);
  });

  it('handles negative values correctly', () => {
    const data = {
      functionGroup: 1,
      block: 7,
      page: 2,
      parameter: 0,
      value: -500 // 2s complement test
    };

    const encoded = encodeMidiEdit(data);
    const decoded = decodeMidiEdit(encoded);
    expect(decoded).toEqual(data);
  });

  it('throws on short payloads', () => {
    expect(() => decodeMidiEdit(new Uint8Array(6))).toThrow();
  });
});
