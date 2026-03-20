export interface QV2GlobalData {
  lcdContrast: number;
  footswitchRangeHead: number;
  footswitchRangeTail: number;
  vuMeterPeakHold: number;
  inputAudioSource: number;
  sampleClockSource: number;
  digitalLeftInputChannel: number;
  digitalRightInputChannel: number;
  digitalLeftOutputChannel: number;
  digitalRightOutputChannel: number;
  digitalOutputMode: number;
  tapTempoFootswitch: number;
  globalDirectSignal: number;
  reserved: number;
}

export function encodeGlobalDumpRequest(): Uint8Array {
  // Payload is empty for requests
  return new Uint8Array(0);
}

export function decodeGlobalDump(payload: Uint8Array): QV2GlobalData {
  if (payload.length < 14) {
    throw new Error(`Invalid Global Data Dump length: ${payload.length}`);
  }

  // TODO_FROM_SERVICE_MANUAL: Validate exact byte offsets for global parameters.
  // Using direct mapping based on order in prompt, but manual should be checked.
  return {
    lcdContrast: payload[0] & 0x7F,
    footswitchRangeHead: payload[1] & 0x7F,
    footswitchRangeTail: payload[2] & 0x7F,
    vuMeterPeakHold: payload[3] & 0x7F,
    inputAudioSource: payload[4] & 0x7F,
    sampleClockSource: payload[5] & 0x7F,
    digitalLeftInputChannel: payload[6] & 0x7F,
    digitalRightInputChannel: payload[7] & 0x7F,
    digitalLeftOutputChannel: payload[8] & 0x7F,
    digitalRightOutputChannel: payload[9] & 0x7F,
    digitalOutputMode: payload[10] & 0x7F,
    tapTempoFootswitch: payload[11] & 0x7F,
    globalDirectSignal: payload[12] & 0x7F,
    reserved: payload[13] & 0x7F
  };
}

export function encodeGlobalDump(data: QV2GlobalData): Uint8Array {
  const payload = new Uint8Array(14);
  payload[0] = data.lcdContrast & 0x7F;
  payload[1] = data.footswitchRangeHead & 0x7F;
  payload[2] = data.footswitchRangeTail & 0x7F;
  payload[3] = data.vuMeterPeakHold & 0x7F;
  payload[4] = data.inputAudioSource & 0x7F;
  payload[5] = data.sampleClockSource & 0x7F;
  payload[6] = data.digitalLeftInputChannel & 0x7F;
  payload[7] = data.digitalRightInputChannel & 0x7F;
  payload[8] = data.digitalLeftOutputChannel & 0x7F;
  payload[9] = data.digitalRightOutputChannel & 0x7F;
  payload[10] = data.digitalOutputMode & 0x7F;
  payload[11] = data.tapTempoFootswitch & 0x7F;
  payload[12] = data.globalDirectSignal & 0x7F;
  payload[13] = data.reserved & 0x7F; // bits not used should be 0

  return payload;
}
