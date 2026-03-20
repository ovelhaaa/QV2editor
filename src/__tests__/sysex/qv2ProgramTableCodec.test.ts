import { describe, it, expect } from 'vitest';
import { decodeProgramTableDump, encodeProgramTableRequest } from '../../sysex/qv2ProgramTableCodec';
import { encode9BitTo2MidiBytes } from '../../sysex/qv2Packing';

describe('qv2ProgramTableCodec', () => {
  it('creates empty payload for request', () => {
    expect(encodeProgramTableRequest()).toEqual(new Uint8Array(0));
  });

  it('decodes program table dump correctly', () => {
    const mockPayload = new Uint8Array(256); // 128 entries * 2 bytes

    // Entry 0: Preset 50 (value 50)
    mockPayload.set(encode9BitTo2MidiBytes(50), 0);

    // Entry 1: User0 25 (value 125)
    mockPayload.set(encode9BitTo2MidiBytes(125), 2);

    // Entry 2: User1 99 (value 299)
    mockPayload.set(encode9BitTo2MidiBytes(299), 4);

    const decoded = decodeProgramTableDump(mockPayload);

    expect(decoded.length).toBe(128);
    expect(decoded[0]).toEqual({ bank: 'preset', program: 50 });
    expect(decoded[1]).toEqual({ bank: 'user0', program: 25 });
    expect(decoded[2]).toEqual({ bank: 'user1', program: 99 });

    // Remaining are 0 (Preset 0)
    expect(decoded[3]).toEqual({ bank: 'preset', program: 0 });
    expect(decoded[127]).toEqual({ bank: 'preset', program: 0 });
  });

  it('throws on short payloads', () => {
    expect(() => decodeProgramTableDump(new Uint8Array(255))).toThrow();
  });
});
