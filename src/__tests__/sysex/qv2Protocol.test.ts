import { describe, it, expect } from 'vitest';
import { decodeMessage, buildEnter } from '../../sysex/qv2Protocol';
import { SYSEX_START, SYSEX_END, ALESIS_MANUFACTURER_ID } from '../../sysex/qv2Envelope';

describe('qv2Protocol - DSP Error & Enter', () => {
  it('decodes DSP Error message correctly', () => {
    // DSP Error format: F0 00 00 0E 0F 0A <error_code> F7
    const payload = new Uint8Array([
      SYSEX_START,
      ...ALESIS_MANUFACTURER_ID,
      0x0F, // model
      0x0A, // DSP Error Opcode
      0x04, // error code: DSP_IS_FULL
      SYSEX_END
    ]);

    const decoded = decodeMessage(payload);

    expect(decoded.type).toBe("DSP_ERROR_MESSAGE");
    expect(decoded.parsed).toEqual({ errorCode: 4 });
  });

  it('builds Enter message correctly', () => {
    const enterMessage = buildEnter();

    expect(enterMessage).toEqual(new Uint8Array([
      SYSEX_START,
      ...ALESIS_MANUFACTURER_ID,
      0x0F, // model
      0x0B, // ENTER opcode
      SYSEX_END
    ]));
  });
});
