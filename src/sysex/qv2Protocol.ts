import { decodeEnvelope, encodeEnvelope, validateEnvelope } from "./qv2Envelope";
import { getMessageTypeFromOpcode } from "./qv2Opcodes";
import { decodeMidiEdit, encodeMidiEdit } from "./qv2EditCodec";
import type { QV2MidiEditData } from "./qv2EditCodec";
import { decodeGlobalDump, encodeGlobalDumpRequest } from "./qv2GlobalCodec";
import { decodeBlockBypassDump, encodeBlockBypassRequest } from "./qv2BlockBypassCodec";
import { decodeProgramTableDump, encodeProgramTableRequest } from "./qv2ProgramTableCodec";
import { decodeRawProgramDump } from "./qv2ProgramDumpCodec";
import type { QV2DecodedMessage } from "./qv2MessageTypes";

/**
 * High-level API to decode incoming SysEx messages.
 */
export function decodeMessage(bytes: Uint8Array): QV2DecodedMessage {
  if (!validateEnvelope(bytes)) {
    return {
      type: "UNKNOWN",
      raw: bytes,
      envelope: { manufacturerId: [], opcode: 0, payload: new Uint8Array() }
    };
  }

  const envelope = decodeEnvelope(bytes)!;
  const type = getMessageTypeFromOpcode(envelope.opcode);
  let parsed: unknown;

  try {
    switch (type) {
      case "MIDI_EDIT":
        parsed = decodeMidiEdit(envelope.payload);
        break;
      case "GLOBAL_DATA_DUMP":
        parsed = decodeGlobalDump(envelope.payload);
        break;
      case "BLOCK_BYPASS_DUMP":
        parsed = decodeBlockBypassDump(envelope.payload);
        break;
      case "PROGRAM_TABLE_DUMP":
        parsed = decodeProgramTableDump(envelope.payload);
        break;
      case "USER_BANK0_PROGRAM_DUMP":
        parsed = decodeRawProgramDump("user0", envelope.payload);
        break;
      case "USER_BANK1_PROGRAM_DUMP":
        parsed = decodeRawProgramDump("user1", envelope.payload);
        break;
      case "DSP_ERROR_MESSAGE":
        parsed = {
          errorCode: envelope.payload[0]
        };
        break;
      default:
        parsed = undefined;
    }
  } catch (err) {
    console.error(`Failed to parse ${type} payload:`, err);
    parsed = { error: err instanceof Error ? err.message : "Unknown Error" };
  }

  return {
    type,
    raw: bytes,
    envelope,
    parsed
  };
}

/**
 * Encoders for requests to the device.
 */
export function buildGlobalDumpRequest(): Uint8Array {
  return encodeEnvelope({
    opcode: 0x08,
    payload: encodeGlobalDumpRequest(),
    familyOrModelByte: 0x0E // Global usually uses 0x0E based on format
  });
}

export function buildBlockBypassRequest(): Uint8Array {
  return encodeEnvelope({
    opcode: 0x10,
    payload: encodeBlockBypassRequest(),
    familyOrModelByte: 0x0F
  });
}

export function buildUserBank1ProgramDumpRequest(programNumber: number): Uint8Array {
  return encodeEnvelope({
    opcode: 0x0D,
    payload: new Uint8Array([programNumber & 0x7F]),
    familyOrModelByte: 0x0F
  });
}

export function buildUserBank0ProgramDumpRequest(programNumber: number): Uint8Array {
  // TODO_FROM_SERVICE_MANUAL: Confirm opcode for USER_BANK0_PROGRAM_DUMP_REQUEST
  // The service manual needs to be checked before defining this request opcode.
  throw new Error("USER_BANK0_PROGRAM_DUMP_REQUEST opcode not confirmed in manual yet.");
}

export function buildProgramTableRequest(): Uint8Array {
  // TODO_FROM_SERVICE_MANUAL: PROGRAM_TABLE_DUMP_REQUEST opcode needs confirmation
  // The service manual needs to be checked before defining this request opcode.
  throw new Error("PROGRAM_TABLE_DUMP_REQUEST opcode not confirmed in manual yet.");
}

export function buildEnter(): Uint8Array {
  return encodeEnvelope({
    opcode: 0x0B,
    payload: new Uint8Array(0),
    familyOrModelByte: 0x0F
  });
}

export function buildBypassOrCompare(type: number): Uint8Array {
  return encodeEnvelope({
    opcode: 0x09,
    payload: new Uint8Array([type & 0x7F]),
    familyOrModelByte: 0x0F
  });
}

export function buildMidiEdit(data: QV2MidiEditData): Uint8Array {
  return encodeEnvelope({
    opcode: 0x01,
    payload: encodeMidiEdit(data),
    familyOrModelByte: 0x0F
  });
}
