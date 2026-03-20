import type { QV2OpcodeDefinition, QV2SysexMessageType } from "./qv2MessageTypes";

// Opcodes confirmed from the prompt and service manual
export const OPCODES: Record<number, QV2OpcodeDefinition> = {
  0x01: {
    opcode: 0x01,
    name: "MIDI_EDIT",
    direction: "both", // Device sends on edit, can also receive
    format: "F0 00 00 0E 0F 01 <function> <block> <page> <parameter> <data16-as-3-midi-bytes> F7"
  },
  0x02: {
    opcode: 0x02,
    name: "USER_BANK0_PROGRAM_DUMP",
    direction: "both",
    format: "F0 00 00 0E 0F 02 <program_number> <data_256_as_midi_safe> F7"
  },

  0x07: {
    opcode: 0x07,
    name: "GLOBAL_DATA_DUMP",
    direction: "both",
    format: "F0 00 00 0E 0E 07 <14_bytes> F7" // Service manual uses 0E model byte here often
  },
  0x08: {
    opcode: 0x08,
    name: "GLOBAL_DATA_DUMP_REQUEST",
    direction: "toDevice",
    format: "F0 00 00 0E 0E 08 F7"
  },
  0x09: {
    opcode: 0x09,
    name: "BYPASS_OR_COMPARE",
    direction: "both",
    format: "F0 00 00 0E 0F 09 <type> F7"
  },
  0x0A: {
    opcode: 0x0A,
    name: "DSP_ERROR_MESSAGE",
    direction: "fromDevice",
    format: "F0 00 00 0E 0F 0A <error_code> F7"
  },
  0x0B: {
    opcode: 0x0B,
    name: "ENTER",
    direction: "toDevice",
    format: "F0 00 00 0E 0F 0B F7"
  },
  0x0C: {
    opcode: 0x0C,
    name: "USER_BANK1_PROGRAM_DUMP",
    direction: "both",
    format: "F0 00 00 0E 0F 0C <program_number> <data_256_as_midi_safe> F7"
  },
  0x0D: {
    opcode: 0x0D,
    name: "USER_BANK1_PROGRAM_DUMP_REQUEST",
    direction: "toDevice",
    format: "F0 00 00 0E 0F 0D <program_number> F7"
  },
  0x0F: {
    opcode: 0x0F,
    name: "BLOCK_BYPASS_DUMP",
    direction: "both",
    format: "F0 00 00 0E 0F 0F <state_as_2_bytes> F7"
  },
  0x10: {
    opcode: 0x10,
    name: "BLOCK_BYPASS_DUMP_REQUEST",
    direction: "toDevice",
    format: "F0 00 00 0E 0F 10 F7"
  },
  0x11: {
    opcode: 0x11,
    name: "PROGRAM_TABLE_DUMP",
    direction: "fromDevice", // usually from device
    format: "F0 00 00 0E 0F 11 <128_entries_as_256_bytes> F7"
  }
};

export function getOpcodeDefinition(opcode: number): QV2OpcodeDefinition | undefined {
  return OPCODES[opcode];
}

export function getMessageTypeFromOpcode(opcode: number): QV2SysexMessageType {
  const def = OPCODES[opcode];
  return def ? def.name : "UNKNOWN";
}
