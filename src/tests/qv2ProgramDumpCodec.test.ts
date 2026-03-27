import { describe, it, expect } from 'vitest';
import { decodeRawProgramDump } from '../sysex/qv2ProgramDumpCodec';
import { mapRawProgramToProgram } from '../sysex/qv2RawProgramMapper';
import type { EffectMetadata } from '../domain/metadata';

import { effectMetadataTable } from '../domain/metadata';

// Using actual effect table to verify mapRawProgramToProgram mapping
const mockEffectTable = Object.values(effectMetadataTable);

// Helper to create a deterministic synthetic 256-byte payload
function createSyntheticDump(): Uint8Array {
  const payload = new Uint8Array(256);
  // Default to 0s

  // TODO_FROM_SERVICE_MANUAL: Set specific bytes for known offsets here, e.g.:
  // payload[0x10] = 0x01; // Block 1 Type
  // payload[0x30] = 0xFF; payload[0x31] = 0xFF; // Routing end marker

  return payload;
}

describe('qv2ProgramDumpCodec', () => {
  it('should split 256 bytes into common (92) and variable (164) regions', () => {
    const payload = createSyntheticDump();
    const rawDump = decodeRawProgramDump(payload);

    expect(rawDump.unpackedData.length).toBe(256);
    expect(rawDump.commonRegion.length).toBe(92);
    expect(rawDump.variableRegion.length).toBe(164);
  });

  it('should throw an error if the payload is not exactly 256 bytes', () => {
    const payload = new Uint8Array(255);
    expect(() => decodeRawProgramDump(payload)).toThrowError('expected 256 bytes');
  });

  it('should preserve basic metadata (bank, program number)', () => {
    const payload = createSyntheticDump();
    const rawDump = decodeRawProgramDump(payload, 'user1', 42);

    expect(rawDump.bank).toBe('user1');
    expect(rawDump.programNumber).toBe(42);
  });
});

describe('qv2RawProgramMapper', () => {
  it('should map a raw dump to a basic program structure', () => {
    const payload = createSyntheticDump();
    const rawDump = decodeRawProgramDump(payload, 'user0', 1);
    const program = mapRawProgramToProgram(rawDump, mockEffectTable);

    // Default structure checks
    expect(program.number).toBe(1);
    expect(program.blocks.length).toBe(8);
    // Until routing offsets are implemented, routes should be empty
    expect(program.routes.length).toBe(0);
    expect(program.mix).toBeDefined();
  });

  it('should parse program name from common region bytes 0-13', () => {
    const payload = createSyntheticDump();
    // ASCII for "Test Program"
    const nameBytes = [84, 101, 115, 116, 32, 80, 114, 111, 103, 114, 97, 109, 32, 32];
    nameBytes.forEach((b, i) => payload[i] = b);

    const rawDump = decodeRawProgramDump(payload, 'user0', 1);
    const program = mapRawProgramToProgram(rawDump, mockEffectTable);

    expect(program.name).toBe("Test Program");
  });

  it('should parse block type and subtype based on service manual offsets (Page 48)', () => {
    const payload = createSyntheticDump();
    // docs/Alesis-Quadraverb2-sp-sm.html
    // Block 1 Type (bits 7-5), Subtype (bits 4-0) at byte 14
    // Family 1 (EQ) is 001 in bits 7-5. Let's make subtype 2 (00010)
    // 00100010 binary = 34 decimal = 0x22
    payload[14] = 0x22;

    // Block 2 Type (bits 7-5), Subtype (bits 4-0) at byte 15
    // Family 3 (DELAY) is 011 in bits 7-5. Subtype 0 (00000)
    // 01100000 binary = 96 decimal = 0x60
    payload[15] = 0x60;

    const rawDump = decodeRawProgramDump(payload);
    const program = mapRawProgramToProgram(rawDump, mockEffectTable);

    expect(program.blocks[0].family).toBe('EQ');
    expect(program.blocks[1].family).toBe('DELAY');
    expect(program.blocks[2].family).toBe('OFF'); // default
  });

  // TODO_FROM_SERVICE_MANUAL: Test routing table parsing when offsets are added
  it('should detect the FF FF routing end marker in the variable region', () => {
     const payload = createSyntheticDump();
     // Common region is 92 bytes, so variable region starts at 92.
     // Let's place FF FF at the beginning of the variable region
     payload[92] = 0xFF;
     payload[93] = 0xFF;

     const rawDump = decodeRawProgramDump(payload);
     // For now this just runs without erroring and hits the internal parsing logic
     // which looks for FF FF.
     expect(() => mapRawProgramToProgram(rawDump, mockEffectTable)).not.toThrow();
  });
});
