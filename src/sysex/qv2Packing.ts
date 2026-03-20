/**
 * QuadraVerb 2 SysEx Packing/Unpacking Helpers
 */

/**
 * Encodes a 16-bit integer into 3 MIDI-safe bytes.
 * The original 16-bit value is split into:
 * byte 1: bits 14..15
 * byte 2: bits 7..13
 * byte 3: bits 0..6
 *
 * NOTE: Negative numbers use two's complement.
 */
export function encode16BitTo3MidiBytes(value: number): Uint8Array {
  // Convert to signed 16-bit (two's complement)
  let val16 = value;
  if (val16 < 0) {
    val16 = (1 << 16) + val16;
  }
  val16 = val16 & 0xFFFF; // Ensure 16-bit boundaries

  const byte1 = (val16 >> 14) & 0x03; // top 2 bits
  const byte2 = (val16 >> 7) & 0x7F;  // middle 7 bits
  const byte3 = val16 & 0x7F;         // bottom 7 bits

  return new Uint8Array([byte1, byte2, byte3]);
}

/**
 * Decodes 3 MIDI-safe bytes back into a 16-bit integer.
 */
export function decode16BitFrom3MidiBytes(bytes: Uint8Array, offset: number = 0): number {
  if (bytes.length - offset < 3) throw new Error("Need 3 bytes to decode 16-bit value");

  const byte1 = bytes[offset] & 0x03;
  const byte2 = bytes[offset + 1] & 0x7F;
  const byte3 = bytes[offset + 2] & 0x7F;

  let val16 = (byte1 << 14) | (byte2 << 7) | byte3;

  // Convert two's complement 16-bit back to signed integer if necessary
  if (val16 & 0x8000) {
    val16 = val16 - (1 << 16);
  }

  return val16;
}

/**
 * Encodes an 8-bit integer into 2 MIDI-safe bytes.
 * byte 1: bit 7
 * byte 2: bits 0..6
 */
export function encode8BitTo2MidiBytes(value: number): Uint8Array {
  const byte1 = (value >> 7) & 0x01;
  const byte2 = value & 0x7F;
  return new Uint8Array([byte1, byte2]);
}

/**
 * Decodes 2 MIDI-safe bytes back into an 8-bit integer.
 */
export function decode8BitFrom2MidiBytes(bytes: Uint8Array, offset: number = 0): number {
  if (bytes.length - offset < 2) throw new Error("Need 2 bytes to decode 8-bit value");
  const byte1 = bytes[offset] & 0x01;
  const byte2 = bytes[offset + 1] & 0x7F;
  return (byte1 << 7) | byte2;
}

/**
 * Encodes a 9-bit integer into 2 MIDI-safe bytes.
 * Used for Program Table Dump where 128 entries (9 bits each) are sent as 2 bytes each.
 * byte 1: bits 7..8
 * byte 2: bits 0..6
 */
export function encode9BitTo2MidiBytes(value: number): Uint8Array {
  const byte1 = (value >> 7) & 0x03; // top 2 bits
  const byte2 = value & 0x7F;        // bottom 7 bits
  return new Uint8Array([byte1, byte2]);
}

/**
 * Decodes 2 MIDI-safe bytes back into a 9-bit integer.
 */
export function decode9BitFrom2MidiBytes(bytes: Uint8Array, offset: number = 0): number {
  if (bytes.length - offset < 2) throw new Error("Need 2 bytes to decode 9-bit value");
  const byte1 = bytes[offset] & 0x03;
  const byte2 = bytes[offset + 1] & 0x7F;
  return (byte1 << 7) | byte2;
}

/**
 * Packs 256 bytes of internal data into MIDI-safe 7-bit chunks.
 * TODO_FROM_SERVICE_MANUAL: Validate the exact 7-to-8 or 8-to-7 mapping from the service manual
 * for the 256 byte raw program dumps.
 * This is a placeholder structure pending the exact table transcription.
 */
export function packProgramBytesToMidiSafe(data: Uint8Array): Uint8Array {
  // Typical Alesis 8-to-7 packing takes 7 bytes of 8-bit data
  // and splits it into 8 bytes of 7-bit data (first byte holds MSBs of the 7 bytes).
  // Assuming this standard format for now until manual confirms.

  const packedLength = Math.ceil((data.length * 8) / 7);
  const packed = new Uint8Array(packedLength);

  let pIdx = 0;
  for (let i = 0; i < data.length; i += 7) {
    const chunkLength = Math.min(7, data.length - i);
    let msbByte = 0;

    // First byte of the 8-byte chunk holds the MSBs
    for (let j = 0; j < chunkLength; j++) {
      if (data[i + j] & 0x80) {
        msbByte |= (1 << j);
      }
    }

    packed[pIdx++] = msbByte;

    // Remaining bytes are the lower 7 bits
    for (let j = 0; j < chunkLength; j++) {
      packed[pIdx++] = data[i + j] & 0x7F;
    }
  }

  return packed.slice(0, pIdx);
}

/**
 * Unpacks MIDI-safe 7-bit chunks back into 256 bytes of internal data.
 * TODO_FROM_SERVICE_MANUAL: Validate the exact packing layout from the service manual.
 */
export function unpackProgramBytesFromMidiSafe(midiBytes: Uint8Array, expectedLength: number = 256): Uint8Array {
  const unpacked = new Uint8Array(expectedLength);

  let mIdx = 0;
  let uIdx = 0;

  while (mIdx < midiBytes.length && uIdx < expectedLength) {
    const msbByte = midiBytes[mIdx++];

    const chunkLength = Math.min(7, expectedLength - uIdx);

    for (let j = 0; j < chunkLength; j++) {
      if (mIdx >= midiBytes.length) break;

      let val = midiBytes[mIdx++];
      if (msbByte & (1 << j)) {
        val |= 0x80;
      }

      unpacked[uIdx++] = val;
    }
  }

  return unpacked;
}
