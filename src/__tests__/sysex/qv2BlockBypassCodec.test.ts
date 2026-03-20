import { describe, it, expect } from 'vitest';
import { encodeBlockBypassRequest, encodeBlockBypassDump, decodeBlockBypassDump } from '../../sysex/qv2BlockBypassCodec';

describe('qv2BlockBypassCodec', () => {
  it('creates empty payload for request', () => {
    expect(encodeBlockBypassRequest()).toEqual(new Uint8Array(0));
  });

  it('encodes and decodes block bypass dump payload correctly', () => {
    const state = {
      1: true,
      2: false,
      3: true,
      4: false,
      5: false,
      6: true,
      7: false,
      8: true
    };

    const encoded = encodeBlockBypassDump(state);
    expect(encoded.length).toBe(2);

    const decoded = decodeBlockBypassDump(encoded);
    expect(decoded).toEqual(state);
  });

  it('throws on short payloads', () => {
    expect(() => decodeBlockBypassDump(new Uint8Array(1))).toThrow();
  });
});
