import { decode9BitFrom2MidiBytes } from "./qv2Packing";

export type QV2ProgramTableEntry =
  | { bank: "preset"; program: number }
  | { bank: "user0"; program: number }
  | { bank: "user1"; program: number };

export function decodeProgramTableDump(payload: Uint8Array): QV2ProgramTableEntry[] {
  // 128 entries * 2 bytes = 256 bytes
  if (payload.length < 256) {
    throw new Error(`Invalid Program Table Dump payload length: ${payload.length}`);
  }

  const entries: QV2ProgramTableEntry[] = [];

  for (let i = 0; i < 128; i++) {
    const rawValue = decode9BitFrom2MidiBytes(payload, i * 2);

    // values:
    // 0..99 = Preset
    // 100..199 = User Bank 0
    // 200..299 = User Bank 1
    if (rawValue >= 0 && rawValue < 100) {
      entries.push({ bank: "preset", program: rawValue });
    } else if (rawValue >= 100 && rawValue < 200) {
      entries.push({ bank: "user0", program: rawValue - 100 });
    } else if (rawValue >= 200 && rawValue <= 299) { // Ensure within expected range
      entries.push({ bank: "user1", program: rawValue - 200 });
    } else {
      // Unmapped or invalid entry according to spec, returning user0 0 as fallback or handle explicitly
      console.warn(`Unexpected Program Table raw value: ${rawValue} at entry index ${i}`);
      entries.push({ bank: "preset", program: 0 });
    }
  }

  return entries;
}

// TODO_FROM_SERVICE_MANUAL: PROGRAM_TABLE_DUMP_REQUEST opcode needs confirmation
export function encodeProgramTableRequest(): Uint8Array {
  // Empty payload
  return new Uint8Array(0);
}
