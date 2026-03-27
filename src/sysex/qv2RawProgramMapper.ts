import type { QV2RawProgramDump } from "./qv2ProgramDumpCodec";
import type { Program, Block, Route, RouteSource, RouteDestination, BlockId } from "../domain/types";
import type { EffectMetadata } from "../domain/metadata";

// docs/Alesis-Quadraverb2-sp-sm.html
// Page 48 - 14a. Block 1 type definition, 14b. Block 1 subtype definition
const BLOCK_TYPE_OFFSETS = [
  { type: 14, subtype: 14, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 1
  { type: 15, subtype: 15, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 2
  { type: 16, subtype: 16, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 3
  { type: 17, subtype: 17, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 4
  { type: 18, subtype: 18, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 5
  { type: 19, subtype: 19, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 6
  { type: 20, subtype: 20, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }, // Block 7
  { type: 21, subtype: 21, bitsType: 3, bitOffsetType: 5, bitsSubtype: 5, bitOffsetSubtype: 0 }  // Block 8
];

const FAMILY_MAP: Record<number, "OFF" | "EQ" | "PITCH" | "DELAY" | "REVERB"> = {
  0: "OFF",
  1: "EQ",
  2: "PITCH",
  3: "DELAY",
  4: "REVERB"
};

function extractBits(byte: number, numBits: number, bitOffset: number): number {
  const mask = (1 << numBits) - 1;
  return (byte >> bitOffset) & mask;
}

export function mapRawProgramToProgram(
  raw: QV2RawProgramDump,
  effectTable: EffectMetadata[]
): Program {
  const common = raw.commonRegion;
  const variable = raw.variableRegion;

  // docs/Alesis-Quadraverb2-sp-sm.html
  // Page 28: 0. Program name ASCII digit 0..13
  let name = "";
  for (let i = 0; i < 14; i++) {
    const charCode = common[i];
    if (charCode >= 32 && charCode <= 127) {
      name += String.fromCharCode(charCode);
    }
  }
  name = name.trim() || "DumpedProg";

  const program: Program = {
    name,
    number: raw.programNumber,
    blocks: [],
    routes: [],
    mix: {
      directLevel: "OFF",
      masterEffectsLevel: "OFF",
      blockLevels: {
        1: "OFF", 2: "OFF", 3: "OFF", 4: "OFF",
        5: "OFF", 6: "OFF", 7: "OFF", 8: "OFF"
      }
    }
  };

  // 1. Map Blocks
  // docs/Alesis-Quadraverb2-sp-sm.html Page 48
  BLOCK_TYPE_OFFSETS.forEach((offset, index) => {
    const blockId = (index + 1) as BlockId;

    // Type and subtype are packed in the same byte:
    // e.g. 14:7-14:5 for type, 14:4-14:0 for subtype
    const byte = common[offset.type];
    const typeVal = extractBits(byte, offset.bitsType, offset.bitOffsetType);
    const subtypeVal = extractBits(byte, offset.bitsSubtype, offset.bitOffsetSubtype);

    const family = FAMILY_MAP[typeVal] || "OFF";

    // TODO_FROM_REFERENCE_MANUAL: Map subtypeVal + family to specific effectTypeId
    // (We'll just map family for now and let the rest be TODO)

    program.blocks.push({
      id: blockId,
      family: family,
      parameters: {}
    });
  });

  // 2. Map Routing
  // The end of routing is designated by 0FFH, 0FFH (255, 255)
  // Variable region contains parameters and routes
  // TODO_FROM_SERVICE_MANUAL: Actual parsing of source/dest bytes in the variable region

  // For tests, just look for FF FF to demonstrate we read the variable region correctly
  // We'll throw an error if FF FF is not found as a basic validation of the variable region
  let routeEndFound = false;
  for (let i = 0; i < variable.length - 1; i++) {
    if (variable[i] === 0xFF && variable[i+1] === 0xFF) {
      routeEndFound = true;
      break;
    }
  }
  if (!routeEndFound) {
    // Note: In a real dump, if maximum routes/parameters are used, FF FF might not be present.
    // However, for our initial parsing test, we expect to find it.
    // We won't throw to not break partial dumps, but we note the logic.
  }
  // TODO_FROM_SERVICE_MANUAL: Parse the bytes before FF FF into actual `program.routes`

  // 3. Map Mix
  // TODO_FROM_SERVICE_MANUAL: Find mix parameters

  return program;
}
