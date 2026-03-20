import { encode16BitTo3MidiBytes, decode16BitFrom3MidiBytes } from "./qv2Packing";

export interface QV2MidiEditData {
  functionGroup: number;
  block: number;
  page: number;
  parameter: number;
  value: number;
}

/**
 * Encodes a MIDI Edit message payload (without envelope).
 * format: <function> <block> <page> <parameter> <data16-as-3-midi-bytes>
 */
export function encodeMidiEdit(data: QV2MidiEditData): Uint8Array {
  const bytes = new Uint8Array(7);
  bytes[0] = data.functionGroup & 0x7F;
  bytes[1] = data.block & 0x7F;
  bytes[2] = data.page & 0x7F;
  bytes[3] = data.parameter & 0x7F;

  const valBytes = encode16BitTo3MidiBytes(data.value);
  bytes[4] = valBytes[0];
  bytes[5] = valBytes[1];
  bytes[6] = valBytes[2];

  return bytes;
}

/**
 * Decodes a MIDI Edit message payload.
 */
export function decodeMidiEdit(payload: Uint8Array): QV2MidiEditData {
  if (payload.length < 7) {
    throw new Error(`Invalid MIDI Edit payload length: ${payload.length}`);
  }

  const value = decode16BitFrom3MidiBytes(payload, 4);

  return {
    functionGroup: payload[0],
    block: payload[1],
    page: payload[2],
    parameter: payload[3],
    value
  };
}
