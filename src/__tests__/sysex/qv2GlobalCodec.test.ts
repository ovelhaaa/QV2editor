import { describe, it, expect } from 'vitest';
import { encodeGlobalDump, decodeGlobalDump, encodeGlobalDumpRequest } from '../../sysex/qv2GlobalCodec';

describe('qv2GlobalCodec', () => {
  it('creates empty payload for request', () => {
    expect(encodeGlobalDumpRequest()).toEqual(new Uint8Array(0));
  });

  it('encodes and decodes global dump payload correctly', () => {
    const data = {
      lcdContrast: 50,
      footswitchRangeHead: 10,
      footswitchRangeTail: 120,
      vuMeterPeakHold: 1,
      inputAudioSource: 0,
      sampleClockSource: 1,
      digitalLeftInputChannel: 2,
      digitalRightInputChannel: 3,
      digitalLeftOutputChannel: 4,
      digitalRightOutputChannel: 5,
      digitalOutputMode: 0,
      tapTempoFootswitch: 1,
      globalDirectSignal: 1,
      reserved: 0
    };

    const encoded = encodeGlobalDump(data);
    expect(encoded.length).toBe(14);

    const decoded = decodeGlobalDump(encoded);
    expect(decoded).toEqual(data);
  });

  it('throws on short payloads', () => {
    expect(() => decodeGlobalDump(new Uint8Array(13))).toThrow();
  });
});
