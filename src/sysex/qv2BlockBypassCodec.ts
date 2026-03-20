import { encode8BitTo2MidiBytes, decode8BitFrom2MidiBytes } from "./qv2Packing";

export interface QV2BlockBypassState {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
  7: boolean;
  8: boolean;
}

export function encodeBlockBypassRequest(): Uint8Array {
  return new Uint8Array(0);
}

export function decodeBlockBypassDump(payload: Uint8Array): QV2BlockBypassState {
  if (payload.length < 2) {
    throw new Error(`Invalid Block Bypass dump payload length: ${payload.length}`);
  }

  const raw8Bit = decode8BitFrom2MidiBytes(payload);

  // 1 = bypassed.
  // A0 = Block 1, ..., A7 = Block 8
  return {
    1: (raw8Bit & (1 << 0)) !== 0,
    2: (raw8Bit & (1 << 1)) !== 0,
    3: (raw8Bit & (1 << 2)) !== 0,
    4: (raw8Bit & (1 << 3)) !== 0,
    5: (raw8Bit & (1 << 4)) !== 0,
    6: (raw8Bit & (1 << 5)) !== 0,
    7: (raw8Bit & (1 << 6)) !== 0,
    8: (raw8Bit & (1 << 7)) !== 0
  };
}

export function encodeBlockBypassDump(state: QV2BlockBypassState): Uint8Array {
  let raw8Bit = 0;
  if (state[1]) raw8Bit |= (1 << 0);
  if (state[2]) raw8Bit |= (1 << 1);
  if (state[3]) raw8Bit |= (1 << 2);
  if (state[4]) raw8Bit |= (1 << 3);
  if (state[5]) raw8Bit |= (1 << 4);
  if (state[6]) raw8Bit |= (1 << 5);
  if (state[7]) raw8Bit |= (1 << 6);
  if (state[8]) raw8Bit |= (1 << 7);

  return encode8BitTo2MidiBytes(raw8Bit);
}
