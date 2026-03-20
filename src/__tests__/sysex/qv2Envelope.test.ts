import { describe, it, expect } from 'vitest';
import { isSysexMessage, validateEnvelope, encodeEnvelope, decodeEnvelope } from '../../sysex/qv2Envelope';

describe('qv2Envelope', () => {
  it('identifies basic sysex bounds', () => {
    expect(isSysexMessage(new Uint8Array([0xF0, 0x01, 0xF7]))).toBe(true);
    expect(isSysexMessage(new Uint8Array([0x90, 0x01, 0xF7]))).toBe(false);
    expect(isSysexMessage(new Uint8Array([0xF0, 0x01, 0x00]))).toBe(false);
  });

  it('validates correct Alesis QuadraVerb 2 envelopes', () => {
    // F0 00 00 0E 0E 08 F7 (Global Dump Request)
    const valid0E = new Uint8Array([0xF0, 0x00, 0x00, 0x0E, 0x0E, 0x08, 0xF7]);
    // F0 00 00 0E 0F 10 F7 (Block Bypass Request)
    const valid0F = new Uint8Array([0xF0, 0x00, 0x00, 0x0E, 0x0F, 0x10, 0xF7]);

    expect(validateEnvelope(valid0E)).toBe(true);
    expect(validateEnvelope(valid0F)).toBe(true);
  });

  it('rejects invalid envelopes', () => {
    // Wrong manufacturer ID
    const wrongManuf = new Uint8Array([0xF0, 0x00, 0x00, 0x0F, 0x0F, 0x10, 0xF7]);
    expect(validateEnvelope(wrongManuf)).toBe(false);

    // Wrong model byte (not 0E or 0F)
    const wrongModel = new Uint8Array([0xF0, 0x00, 0x00, 0x0E, 0x10, 0x10, 0xF7]);
    expect(validateEnvelope(wrongModel)).toBe(false);
  });

  it('encodes an envelope correctly', () => {
    const encoded = encodeEnvelope({
      opcode: 0x08,
      familyOrModelByte: 0x0E,
      payload: new Uint8Array([0x01, 0x02])
    });

    expect(encoded).toEqual(new Uint8Array([0xF0, 0x00, 0x00, 0x0E, 0x0E, 0x08, 0x01, 0x02, 0xF7]));
  });

  it('decodes an envelope correctly', () => {
    const raw = new Uint8Array([0xF0, 0x00, 0x00, 0x0E, 0x0F, 0x09, 0x05, 0xF7]);
    const decoded = decodeEnvelope(raw);

    expect(decoded).not.toBeNull();
    expect(decoded?.opcode).toBe(0x09);
    expect(decoded?.familyOrModelByte).toBe(0x0F);
    expect(decoded?.payload).toEqual(new Uint8Array([0x05]));
  });
});
