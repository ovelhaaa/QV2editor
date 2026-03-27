export interface QV2RawProgramDump {
  bank: "user0" | "user1" | "edit";
  programNumber: number;
  unpackedData: Uint8Array; // 256 bytes
  commonRegion: Uint8Array; // 92 bytes
  variableRegion: Uint8Array; // 164 bytes
}

/**
 * Decodes a 256-byte unpacked Program Dump payload into its two main regions
 * and extracts basic metadata if possible.
 *
 * Sources:
 * - docs/Alesis-Quadraverb2-sp-sm.html (MIDI User Bank 1 Program Dump Request / 0C Program Dump)
 */
export function decodeRawProgramDump(
  bytes256: Uint8Array,
  bank: "user0" | "user1" | "edit" = "edit", // Normally derived from the SysEx header which is not in the 256-byte payload
  programNumber: number = 0 // Normally derived from the SysEx header
): QV2RawProgramDump {
  if (bytes256.length !== 256) {
    throw new Error(`Invalid unpacked payload length: expected 256 bytes, got ${bytes256.length}`);
  }

  // Common Parameter Region (0..91)
  const commonRegion = bytes256.slice(0, 92);

  // Variable Parameter Region (92..255)
  const variableRegion = bytes256.slice(92, 256);

  // TODO_FROM_SERVICE_MANUAL: Extract bank/program metadata from payload if embedded inside the 256 bytes,
  // rather than just passing it in from the SysEx header parser.
  // docs/Alesis-Quadraverb2-sp-sm.html (Page 58-61 approximate)

  return {
    bank,
    programNumber,
    unpackedData: bytes256,
    commonRegion,
    variableRegion
  };
}
