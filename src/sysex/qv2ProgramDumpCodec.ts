import { unpackProgramBytesFromMidiSafe } from "./qv2Packing";

export interface QV2RawProgramDump {
  bank: "user0" | "user1" | "edit"; // edit is inferred based on context/opcode
  programNumber: number;
  unpackedData: Uint8Array; // 256 bytes
  commonRegion: Uint8Array; // 92 bytes
  variableRegion: Uint8Array; // 164 bytes
  routingRegionValid?: boolean;
}

export function decodeRawProgramDump(
  bank: "user0" | "user1" | "edit",
  payload: Uint8Array
): QV2RawProgramDump {
  if (payload.length < 1) {
    throw new Error("Program Dump payload missing program number");
  }

  const programNumber = payload[0];
  const packedData = payload.slice(1);

  // Unpack MIDI-safe 7-bit chunks back into 256 bytes
  const unpackedData = unpackProgramBytesFromMidiSafe(packedData, 256);

  if (unpackedData.length < 256) {
    throw new Error(`Invalid unpacked length for Program Dump: ${unpackedData.length}`);
  }

  // Common region is first 92 bytes
  const commonRegion = unpackedData.slice(0, 92);

  // Variable region is remaining 164 bytes
  const variableRegion = unpackedData.slice(92, 256);

  // Detect routing region termination FF FF
  // TODO_FROM_SERVICE_MANUAL: Confirm exact offset of routing region
  // Usually it sits in the variable region or common.
  let routingRegionValid = false;

  for (let i = 0; i < unpackedData.length - 1; i++) {
    if (unpackedData[i] === 0xFF && unpackedData[i + 1] === 0xFF) {
      routingRegionValid = true;
      break;
    }
  }

  return {
    bank,
    programNumber,
    unpackedData,
    commonRegion,
    variableRegion,
    routingRegionValid
  };
}

// Higher-level parse functionality will wait for proper layout transcription
// TODO_FROM_SERVICE_MANUAL: Transcription of 256 byte full layout
