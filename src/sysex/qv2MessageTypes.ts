import type { MidiCapability } from "../midi/midiTypes";

export type QV2SysexMessageType =
  | "MIDI_EDIT"
  | "USER_BANK0_PROGRAM_DUMP"
  | "USER_BANK0_PROGRAM_DUMP_REQUEST"
  | "GLOBAL_DATA_DUMP"
  | "GLOBAL_DATA_DUMP_REQUEST"
  | "BYPASS_OR_COMPARE"
  | "DSP_ERROR_MESSAGE"
  | "ENTER"
  | "USER_BANK1_PROGRAM_DUMP"
  | "USER_BANK1_PROGRAM_DUMP_REQUEST"
  | "BLOCK_BYPASS_DUMP"
  | "BLOCK_BYPASS_DUMP_REQUEST"
  | "PROGRAM_TABLE_DUMP"
  | "PROGRAM_TABLE_DUMP_REQUEST"
  | "UNKNOWN";

export interface QV2OpcodeDefinition {
  opcode: number;
  name: QV2SysexMessageType;
  direction: "toDevice" | "fromDevice" | "both";
  format: string;
  notes?: string;
}

export interface QV2SysexEnvelope {
  manufacturerId: number[];
  familyOrModelByte?: number;
  opcode: number;
  payload: Uint8Array;
}

export interface QV2DecodedMessage {
  type: QV2SysexMessageType;
  raw: Uint8Array;
  envelope: QV2SysexEnvelope;
  parsed?: unknown;
}

export { type MidiCapability };
