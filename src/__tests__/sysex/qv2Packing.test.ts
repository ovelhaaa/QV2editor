import { describe, it, expect } from 'vitest';
import {
  encode16BitTo3MidiBytes,
  decode16BitFrom3MidiBytes,
  encode8BitTo2MidiBytes,
  decode8BitFrom2MidiBytes,
  encode9BitTo2MidiBytes,
  decode9BitFrom2MidiBytes
} from '../../sysex/qv2Packing';

describe('qv2Packing', () => {
  describe('16-bit to 3 bytes', () => {
    it('encodes and decodes correctly', () => {
      // Small positive
      const val1 = 5;
      const bytes1 = encode16BitTo3MidiBytes(val1);
      expect(bytes1.length).toBe(3);
      expect(decode16BitFrom3MidiBytes(bytes1)).toBe(val1);

      // Large positive
      const val2 = 30000;
      const bytes2 = encode16BitTo3MidiBytes(val2);
      expect(decode16BitFrom3MidiBytes(bytes2)).toBe(val2);

      // Small negative (two's complement)
      const val3 = -5;
      const bytes3 = encode16BitTo3MidiBytes(val3);
      expect(decode16BitFrom3MidiBytes(bytes3)).toBe(val3);

      // Edge cases
      const valMax = 32767;
      const valMin = -32768;

      expect(decode16BitFrom3MidiBytes(encode16BitTo3MidiBytes(valMax))).toBe(valMax);
      expect(decode16BitFrom3MidiBytes(encode16BitTo3MidiBytes(valMin))).toBe(valMin);
    });
  });

  describe('8-bit to 2 bytes', () => {
    it('encodes and decodes correctly', () => {
      const val = 0b10101010; // 170
      const bytes = encode8BitTo2MidiBytes(val);
      expect(bytes.length).toBe(2);
      expect(bytes[0]).toBe(0b00000001); // top bit
      expect(bytes[1]).toBe(0b00101010); // remaining 7 bits
      expect(decode8BitFrom2MidiBytes(bytes)).toBe(val);

      expect(decode8BitFrom2MidiBytes(encode8BitTo2MidiBytes(0))).toBe(0);
      expect(decode8BitFrom2MidiBytes(encode8BitTo2MidiBytes(255))).toBe(255);
    });
  });

  describe('9-bit to 2 bytes', () => {
    it('encodes and decodes correctly', () => {
      const val = 0b110101010; // 426
      const bytes = encode9BitTo2MidiBytes(val);
      expect(bytes.length).toBe(2);
      expect(bytes[0]).toBe(0b00000011); // top 2 bits
      expect(bytes[1]).toBe(0b00101010); // remaining 7 bits
      expect(decode9BitFrom2MidiBytes(bytes)).toBe(val);

      expect(decode9BitFrom2MidiBytes(encode9BitTo2MidiBytes(0))).toBe(0);
      expect(decode9BitFrom2MidiBytes(encode9BitTo2MidiBytes(511))).toBe(511);
    });
  });
});
