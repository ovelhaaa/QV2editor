import type { QV2SysexEnvelope } from "./qv2MessageTypes";

export const SYSEX_START = 0xF0;
export const SYSEX_END = 0xF7;
export const ALESIS_MANUFACTURER_ID = [0x00, 0x00, 0x0E];

/**
 * Checks if a byte array is a valid SysEx message (starts with F0, ends with F7).
 */
export function isSysexMessage(bytes: Uint8Array): boolean {
  if (bytes.length < 2) return false;
  return bytes[0] === SYSEX_START && bytes[bytes.length - 1] === SYSEX_END;
}

/**
 * Validates if the message is a valid Alesis QuadraVerb 2 SysEx envelope.
 * Checks manufacturer ID and Model/Family byte (0x0E or 0x0F).
 */
export function validateEnvelope(bytes: Uint8Array): boolean {
  if (!isSysexMessage(bytes)) return false;

  // Need at least: F0, M1, M2, M3, Model, Opcode, F7 = 7 bytes
  if (bytes.length < 7) return false;

  const m1 = bytes[1];
  const m2 = bytes[2];
  const m3 = bytes[3];

  if (m1 !== ALESIS_MANUFACTURER_ID[0] || m2 !== ALESIS_MANUFACTURER_ID[1] || m3 !== ALESIS_MANUFACTURER_ID[2]) {
    return false;
  }

  const modelByte = bytes[4];
  // Manual mentions both 0E and 0F
  if (modelByte !== 0x0E && modelByte !== 0x0F) {
    return false;
  }

  return true;
}

/**
 * Decodes a raw byte array into an envelope object.
 * Returns null if the envelope is invalid.
 */
export function decodeEnvelope(bytes: Uint8Array): QV2SysexEnvelope | null {
  if (!validateEnvelope(bytes)) {
    return null;
  }

  const modelByte = bytes[4];
  const opcode = bytes[5];

  // Extract payload (everything between opcode and F7)
  const payload = bytes.slice(6, bytes.length - 1);

  return {
    manufacturerId: ALESIS_MANUFACTURER_ID,
    familyOrModelByte: modelByte,
    opcode,
    payload
  };
}

/**
 * Encodes an envelope object into a raw byte array.
 */
export function encodeEnvelope(envelope: {
  opcode: number;
  payload?: Uint8Array;
  familyOrModelByte?: number;
}): Uint8Array {
  const modelByte = envelope.familyOrModelByte ?? 0x0F; // default to 0F
  const payloadLength = envelope.payload ? envelope.payload.length : 0;

  // F0 + 3 bytes ID + 1 byte model + 1 byte opcode + payload + F7
  const length = 1 + 3 + 1 + 1 + payloadLength + 1;
  const bytes = new Uint8Array(length);

  bytes[0] = SYSEX_START;
  bytes[1] = ALESIS_MANUFACTURER_ID[0];
  bytes[2] = ALESIS_MANUFACTURER_ID[1];
  bytes[3] = ALESIS_MANUFACTURER_ID[2];
  bytes[4] = modelByte;
  bytes[5] = envelope.opcode;

  if (envelope.payload) {
    bytes.set(envelope.payload, 6);
  }

  bytes[length - 1] = SYSEX_END;

  return bytes;
}
