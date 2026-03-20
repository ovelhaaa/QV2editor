import type { EffectTypeDefinition, ParameterDefinition } from "./parameterSchemas";

// Helper to define parameters concisely
function pInt(id: string, label: string, min: number, max: number, page: string, unit?: string): ParameterDefinition {
  return { id, label, type: "int", min, max, page, unit, required: true };
}

function pFloat(id: string, label: string, min: number, max: number, page: string, unit?: string, step?: number): ParameterDefinition {
  return { id, label, type: "float", min, max, page, unit, step, required: true };
}

function pEnum(id: string, label: string, enumValues: string[], page: string): ParameterDefinition {
  return { id, label, type: "enum", enumValues, page, required: true };
}


export const effectTypes: EffectTypeDefinition[] = [
  // ==========================================
  // EQ
  // ==========================================
  {
    id: "EQ_LOWPASS_FILTER",
    family: "EQ",
    displayName: "Lowpass Filter",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 6, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("lowpassFcHz", "Lowpass Fc", 20, 10000, "1", "Hz")
    ]
  },
  {
    id: "EQ_BANDPASS_FILTER",
    family: "EQ",
    displayName: "Bandpass Filter",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 15, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("bandpassFcHz", "Bandpass Fc", 200, 10000, "1", "Hz"),
      pFloat("bandwidthOctaves", "BW", 0.20, 2.50, "1", "Octaves", 0.01)
    ]
  },
  {
    id: "EQ_HIGHPASS_FILTER",
    family: "EQ",
    displayName: "Highpass Filter",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 6, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("highpassFcHz", "Highpass Fc", 100, 20000, "1", "Hz")
    ]
  },
  {
    id: "EQ_LOWPASS_SHELF",
    family: "EQ",
    displayName: "Lowpass Shelf",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 8, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("lowpassFcHz", "Lowpass Fc", 20, 10000, "1", "Hz"),
      pFloat("gainDb", "Gain", -14, 14, "1", "dB", 0.1)
    ]
  },
  {
    id: "EQ_HIGHPASS_SHELF",
    family: "EQ",
    displayName: "Highpass Shelf",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 8, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("highpassFcHz", "Highpass Fc", 100, 20000, "1", "Hz"),
      pFloat("gainDb", "Gain", -14, 14, "1", "dB", 0.1)
    ]
  },
  {
    id: "EQ_1_BAND_LOW_PARAMETRIC",
    family: "EQ",
    displayName: "1 Band Low Parametric",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 15, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("bandpassFcHz", "Bandpass Fc", 20, 2000, "1", "Hz"),
      pFloat("gainDb", "Gain", -14, 14, "1", "dB", 0.1),
      pFloat("bandwidthOctaves", "BW", 0.20, 2.00, "1", "Octaves", 0.01)
    ]
  },
  {
    id: "EQ_1_BAND_HIGH_PARAMETRIC",
    family: "EQ",
    displayName: "1 Band High Parametric",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 7, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("bandpassFcHz", "Bandpass Fc", 200, 10000, "1", "Hz"),
      pFloat("gainDb", "Gain", -14, 14, "1", "dB", 0.1),
      pFloat("bandwidthOctaves", "BW", 0.20, 2.50, "1", "Octaves", 0.01)
    ]
  },
  {
    id: "EQ_2_BAND_SWEEP_SHELF",
    family: "EQ",
    displayName: "2 Band Sweep Shelf",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 15, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("lowpassFcHz", "Lowpass Fc", 20, 10000, "1", "Hz"),
      pFloat("lowpassGainDb", "Gain", -14, 14, "1", "dB", 0.1),
      pInt("highpassFcHz", "Highpass Fc", 100, 20000, "2", "Hz"),
      pFloat("highpassGainDb", "Gain", -14, 14, "2", "dB", 0.1)
    ]
  },
  {
    id: "EQ_3_BAND_PARAMETRIC",
    family: "EQ",
    displayName: "3 Band Parametric",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 30, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("lowpassFcHz", "Lowpass Fc", 20, 10000, "1", "Hz"),
      pFloat("lowpassGainDb", "Gain", -14, 14, "1", "dB", 0.1),
      pInt("midBandFcHz", "Mid Band Fc", 200, 10000, "2", "Hz"),
      pFloat("midBandGainDb", "Gain", -14, 14, "2", "dB", 0.1),
      pFloat("midBandwidthOctaves", "BW", 0.20, 2.50, "2", "Octaves", 0.01),
      pInt("highpassFcHz", "Highpass Fc", 100, 20000, "3", "Hz"),
      pFloat("highpassGainDb", "Gain", -14, 14, "3", "dB", 0.1)
    ]
  },
  {
    id: "EQ_4_BAND_PARAMETRIC",
    family: "EQ",
    displayName: "4 Band Parametric",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 35, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("lowpassFcHz", "Lowpass Fc", 20, 10000, "1", "Hz"),
      pFloat("lowpassGainDb", "Gain", -14, 14, "1", "dB", 0.1),
      pInt("lowMidFcHz", "Low Mid Fc", 20, 2000, "2", "Hz"),
      pFloat("lowMidGainDb", "Gain", -14, 14, "2", "dB", 0.1),
      pFloat("lowMidBandwidthOctaves", "BW", 0.20, 2.00, "2", "Octaves", 0.01),
      pInt("highMidFcHz", "High Mid Fc", 1500, 10000, "3", "Hz"),
      pFloat("highMidGainDb", "Gain", -14, 14, "3", "dB", 0.1),
      pFloat("highMidBandwidthOctaves", "BW", 0.20, 2.50, "3", "Octaves", 0.01),
      pInt("highpassFcHz", "Highpass Fc", 100, 20000, "4", "Hz"),
      pFloat("highpassGainDb", "Gain", -14, 14, "4", "dB", 0.1)
    ]
  },
  {
    id: "EQ_5_BAND_GRAPHIC",
    family: "EQ",
    displayName: "5 Band Graphic",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 34, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pFloat("gain63HzDb", "63Hz", -14, 14, "1", "dB", 0.1),
      pFloat("gain250HzDb", "250Hz", -14, 14, "1", "dB", 0.1),
      pFloat("gain1kHzDb", "1kHz", -14, 14, "1", "dB", 0.1),
      pFloat("gain4kHzDb", "4kHz", -14, 14, "1", "dB", 0.1),
      pFloat("gain16kHzDb", "16kHz", -14, 14, "1", "dB", 0.1)
    ]
  },
  {
    id: "EQ_RESONATOR",
    family: "EQ",
    displayName: "Resonator",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 3, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pEnum("resonatorTuning", "Resonator Tuning", ["A0", "A#0", "B0", "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1", "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5"], "1"),
      pInt("decay", "Decay", 0, 99, "1")
    ]
  },
  {
    id: "EQ_MONO_TREMOLO",
    family: "EQ",
    displayName: "Mono Tremolo",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 3, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pEnum("shape", "Shape", ["Soft", "Hard"], "1")
    ]
  },
  {
    id: "EQ_STEREO_TREMOLO",
    family: "EQ",
    displayName: "Stereo Tremolo",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 7, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pEnum("shape", "Shape", ["Soft", "Hard"], "1")
    ]
  },
  {
    id: "EQ_STEREO_SIMULATOR",
    family: "EQ",
    displayName: "Stereo Simulator",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 14, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("stereoSpreadDegrees", "Stereo Spread", 0, 99, "1", "Degrees")
    ]
  },

  // ==========================================
  // PITCH
  // ==========================================
  {
    id: "PITCH_MONO_CHORUS",
    family: "PITCH",
    displayName: "Mono Chorus",
    outputs: ["M"],
    resourceUsage: { dspPercentBase: 4, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pInt("feedback", "Feedback", 0, 99, "1"),
      pInt("chorusPreDelayMs", "Chorus PreDelay", 0, 100, "2", "mS"),
      pEnum("chorusShape", "Chorus Shape", ["Sine", "Square"], "3")
    ]
  },
  {
    id: "PITCH_STEREO_CHORUS",
    family: "PITCH",
    displayName: "Stereo Chorus",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 8, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pInt("feedback", "Feedback", 0, 99, "1"),
      pInt("preDelayChorus1Ms", "PreDelay Chorus 1", 0, 100, "2", "mS"),
      pInt("preDelayChorus2Ms", "PreDelay Chorus 2", 0, 100, "2", "mS"),
      pEnum("chorusShape", "Chorus Shape", ["Sine", "Square"], "3")
    ]
  },
  {
    id: "PITCH_QUAD_CHORUS",
    family: "PITCH",
    displayName: "Quad Chorus",
    outputs: ["L", "R"], // Outputs sum to stereo typically
    resourceUsage: { dspPercentBase: 20, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pInt("feedback", "Feedback", 0, 99, "1"),
      pInt("preDelayChorus1Ms", "PreDelay Chorus 1", 0, 100, "2", "mS"),
      pInt("preDelayChorus2Ms", "PreDelay Chorus 2", 0, 100, "2", "mS"),
      pInt("preDelayChorus3Ms", "PreDelay Chorus 3", 0, 100, "3", "mS"),
      pInt("preDelayChorus4Ms", "PreDelay Chorus 4", 0, 100, "3", "mS")
    ]
  },
  {
    id: "PITCH_MONO_FLANGING",
    family: "PITCH",
    displayName: "Mono Flanging",
    outputs: ["M"],
    resourceUsage: { dspPercentBase: 3, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pInt("feedback", "Feedback", 0, 99, "1"),
      pEnum("flangingShape", "Flanging Shape", ["Sine", "Triangle"], "2")
    ]
  },
  {
    id: "PITCH_STEREO_FLANGING",
    family: "PITCH",
    displayName: "Stereo Flanging",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 8, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("speed", "Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1"),
      pInt("feedback", "Feedback", 0, 99, "1"),
      pEnum("flangingShape", "Flanging Shape", ["Sine", "Triangle"], "2")
    ]
  },
  {
    id: "PITCH_PHASOR",
    family: "PITCH",
    displayName: "Phasor",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 17, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: true, microAssistGroup: 'PHASOR' },
    parameterSchema: [
      pInt("phasorSpeed", "Phasor Speed", 0, 99, "1"),
      pInt("depth", "Depth", 0, 99, "1")
    ]
  },
  {
    id: "PITCH_MONO_LEZLIE",
    family: "PITCH",
    displayName: "Mono Lezlie",
    outputs: ["M"],
    resourceUsage: { dspPercentBase: 10, lfoCountBase: 2, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pEnum("lezlieMotor", "Lezlie Motor", ["On", "Off"], "1"),
      pEnum("speed", "Speed", ["Slow", "Fast"], "1"),
      pInt("highRotorLevelDb", "High Rotor Level", -12, 6, "2", "dB")
    ]
  },
  {
    id: "PITCH_STEREO_LEZLIE",
    family: "PITCH",
    displayName: "Stereo Lezlie",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 16, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: true, microAssistGroup: 'STEREO_LEZLIE' },
    parameterSchema: [
      pEnum("lezlieMotor", "Lezlie Motor", ["On", "Off"], "1"),
      pEnum("speed", "Speed", ["Slow", "Fast"], "1"),
      pInt("highRotorLevelDb", "High Rotor Level", -12, 6, "2", "dB"),
      pInt("stereoSeparation", "Stereo Separation", 0, 99, "3")
    ]
  },
  {
    id: "PITCH_PITCH_SHIFT",
    family: "PITCH",
    displayName: "Pitch Shift",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 7, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("fine", "Fine", 0, 99, "1"),
      pInt("coarse", "Coarse", -12, 12, "1", "semi tone")
    ]
  },
  {
    id: "PITCH_PITCH_DETUNE",
    family: "PITCH",
    displayName: "Pitch Detune",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 7, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    parameterSchema: [
      pInt("detuneAmount", "Detune Amount", -99, 99, "1")
    ]
  },
  {
    id: "PITCH_RING_MODULATOR",
    family: "PITCH",
    displayName: "Ring Modulator",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 15, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: true, microAssistGroup: 'RING_MODULATOR' },
    parameterSchema: [
      pInt("spectrumShift", "Spectrum Shift", -100, 100, "1")
    ]
  },

  // ==========================================
  // DELAY
  // ==========================================
  // For delays, beat count is enum: 1/2, 1/4., 1/4, 1/4T, 1/8., 1/8, 1/8T, 1/16, 1/32
  {
    id: "DELAY_MONO_DELAY",
    family: "DELAY",
    displayName: "Mono Delay",
    outputs: ["M"],
    resourceUsage: { dspPercentBase: 2, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.delayTimeMs === 'number' ? params.delayTimeMs : 0
    }),
    parameterSchema: [
      pFloat("delayTimeMs", "Delay Time", 0.1, 5000, "1", "mS", 0.1),
      pEnum("beatCount", "Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "1"),
      pInt("feedback", "Feedback", 0, 99, "2")
    ]
  },
  {
    id: "DELAY_STEREO_DELAY",
    family: "DELAY",
    displayName: "Stereo Delay",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 4, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: (typeof params.leftDelayMs === 'number' ? params.leftDelayMs : 0) + (typeof params.rightDelayMs === 'number' ? params.rightDelayMs : 0)
    }),
    parameterSchema: [
      pFloat("leftDelayMs", "Left Delay", 0.1, 5000, "1", "mS", 0.1),
      pEnum("leftBeatCount", "Left Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "1"),
      pInt("leftFeedback", "Left Feedback", 0, 99, "2"),
      pFloat("rightDelayMs", "Right Delay", 0.1, 5000, "3", "mS", 0.1),
      pEnum("rightBeatCount", "Right Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "3"),
      pInt("rightFeedback", "Right Feedback", 0, 99, "4")
    ]
  },
  {
    id: "DELAY_PING_PONG_DELAY",
    family: "DELAY",
    displayName: "Ping Pong Delay",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 3, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.delayTimeMs === 'number' ? params.delayTimeMs : 0
    }),
    parameterSchema: [
      pFloat("delayTimeMs", "Delay Time", 0.1, 5000, "1", "mS", 0.1),
      pEnum("beatCount", "Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "1"),
      pInt("feedback", "Feedback", 0, 99, "2")
    ]
  },
  {
    id: "DELAY_MULTI_TAP_DELAY",
    family: "DELAY",
    displayName: "Multi Tap Delay",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 15, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false }, // Max 3 per program
    dynamicResourceUsage: (params: Record<string, any>) => {
      let maxDelay = 0;
      for (let i = 1; i <= 5; i++) {
        const val = params[`tap${i}DelayMs`];
        if (typeof val === 'number' && val > maxDelay) maxDelay = val;
      }
      return { effectMemoryMs: maxDelay };
    },
    parameterSchema: [
      ...([1, 2, 3, 4, 5].map(i => [
        pFloat(`tap${i}DelayMs`, `Tap ${i} Delay`, 0.1, 5000, `${i}`, "mS", 0.1),
        // Volume: Off/-48-0dB => Will model as int from -49 to 0, where -49 means Off for simplicity in renderer.
        pInt(`tap${i}VolumeDb`, `Tap ${i} Volume`, -49, 0, `${i}`, "dB"),
        pInt(`tap${i}Pan`, `Tap ${i} L<->R`, -99, 99, `${i}`), // <99-<50>-99 => -99 to 99
        pInt(`tap${i}Feedback`, `Tap ${i} Feedback`, 0, 99, `${i}`)
      ]).flat()),
      pInt("masterFeedback", "Master Feedback", 0, 99, "6")
    ]
  },
  {
    id: "DELAY_TAP_TEMPO_MONO_DELAY",
    family: "DELAY",
    displayName: "Tap Tempo Mono Delay",
    outputs: ["M"],
    resourceUsage: { dspPercentBase: 2, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.delayTimeMs === 'number' ? params.delayTimeMs : 0
    }),
    parameterSchema: [
      pFloat("delayTimeMs", "Delay Time", 0.1, 5000, "1", "mS", 0.1),
      pEnum("beatCount", "Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "1"),
      pInt("feedback", "Feedback", 0, 99, "2")
    ]
  },
  {
    id: "DELAY_TAP_TEMPO_PING_PONG",
    family: "DELAY",
    displayName: "Tap Tempo Ping Pong Delay",
    outputs: ["L", "R"],
    resourceUsage: { dspPercentBase: 3, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.delayTimeMs === 'number' ? params.delayTimeMs : 0
    }),
    parameterSchema: [
      pFloat("delayTimeMs", "Delay Time", 0.1, 5000, "1", "mS", 0.1),
      pEnum("beatCount", "Beat Count", ["1/2", "1/4.", "1/4", "1/4T", "1/8.", "1/8", "1/8T", "1/16", "1/32"], "1"),
      pInt("feedback", "Feedback", 0, 99, "2")
    ]
  },

  // ==========================================
  // REVERB
  // ==========================================
  // Helper for common reverb parameters
  ...(["ROOM_1", "HALL_1", "PLATE_1", "CHAMBER_1", "ROOM_2", "HALL_2", "PLATE_2", "CHAMBER_2"].map(type => {
    // 1st tier (Room 1, Hall 1, Plate 1, Chamber 1): DSP ~33-40, LFO 0
    // 2nd tier (Room 2, Hall 2, Plate 2, Chamber 2): DSP ~61-76, LFO 1
    const isTier2 = type.endsWith("_2");

    const dspCosts: Record<string, number> = {
      "ROOM_1": 33,
      "HALL_1": 33,
      "PLATE_1": 33,
      "CHAMBER_1": 40,
      "ROOM_2": 76,
      "HALL_2": 61,
      "PLATE_2": 64,
      "CHAMBER_2": 64,
    };

    const dsp = dspCosts[type];
    const baseId = `REVERB_${type}`;
    const displayName = type.replace("_", " ");

    const params: ParameterDefinition[] = [
      pInt("decay", "Decay", 0, 99, "1"),
      pInt("dampingHi", "Damping Hi", 0, 99, "1"),
      pInt("dampingLo", "Damping Lo", 0, 99, "1"),
      pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
      pInt("diffusion", "Diffusion", 0, 99, "2"),
      pInt("highFrequencyRollOffHz", "High Frequency Roll Off", 200, 20000, "3", "Hz"),
      pInt("predelayMs", "Predelay", 1, 250, "4", "mS"),
      pInt("mix", "Mix", -99, 99, "4"),
    ];

    if (isTier2) {
      params.push(
        pInt("reflectionLevel", "Reflection Level", 0, 99, "5"),
        pInt("spread", "Spread", 0, 99, "5")
      );
      if (type === "ROOM_2" || type === "PLATE_2" || type === "CHAMBER_2") {
        params.push(pInt("reverberationAttack", "Reverberation Attack", 0, 99, "6"));
      } else if (type === "HALL_2") {
        params.push(pInt("reverberationSwirl", "Reverberation Swirl", 0, 99, "6"));
      }

      params.push(
        pEnum("gateTrig", "Gate Trig", ["Off", "Left", "Right", "L&R"], "7"),
        pInt("gateHoldMs", "Hold", 10, 500, "7", "mS"),
        pInt("gateReleaseTimeMs", "Gate Release Time", 0, 500, "8", "mS"),
        pInt("gateLevel", "Gate Level", 0, 99, "9")
      );
    } else {
      params.push(
        pEnum("gateTrig", "Gate Trig", ["Off", "Left", "Right", "L&R"], "5"),
        pInt("gateHoldMs", "Hold", 10, 500, "5", "mS"),
        pInt("gateReleaseTimeMs", "Gate Release Time", 0, 500, "6", "mS"),
        pInt("gateLevel", "Gate Level", 0, 99, "7")
      );
    }

    return {
      id: baseId,
      family: "REVERB" as const,
      displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase(),
      outputs: ["L", "R"] as Array<"L" | "R" | "M">,
      resourceUsage: { dspPercentBase: dsp, lfoCountBase: isTier2 ? 1 : 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
      dynamicResourceUsage: (params: Record<string, any>) => ({
        effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
      }),
      parameterSchema: params
    };
  })),

  {
    id: "REVERB_MONO_ROOM",
    family: "REVERB" as const,
    displayName: "Mono Room",
    outputs: ["M"] as Array<"L" | "R" | "M">,
    resourceUsage: { dspPercentBase: 28, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
    }),
    parameterSchema: [
      pInt("decay", "Decay", 0, 99, "1"),
      pInt("dampingHi", "Damping Hi", 0, 99, "1"),
      pInt("dampingLo", "Damping Lo", 0, 99, "1"),
      pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
      pInt("diffusion", "Diffusion", 0, 99, "2"),
      pInt("highFrequencyRollOffHz", "High Frequency Roll Off", 200, 20000, "3", "Hz"),
      pInt("predelayMs", "Predelay", 1, 250, "4", "mS"),
      pInt("mix", "Mix", -99, 99, "4"),
      pEnum("gateTrig", "Gate Trig", ["Off", "Left", "Right", "L&R"], "5"),
      pInt("gateHoldMs", "Hold", 10, 500, "5", "mS"),
      pInt("gateReleaseTimeMs", "Gate Release Time", 0, 500, "6", "mS"),
      pInt("gateLevel", "Gate Level", 0, 99, "7")
    ]
  },

  // Large Plate and Large Room
  ...(["LARGE_PLATE", "LARGE_ROOM"].map(type => {
    return {
      id: `REVERB_${type}`,
      family: "REVERB" as const,
      displayName: type === "LARGE_PLATE" ? "Large Plate" : "Large Room",
      outputs: ["L", "R"] as Array<"L" | "R" | "M">,
      resourceUsage: { dspPercentBase: type === "LARGE_PLATE" ? 67 : 91, lfoCountBase: 1, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
      dynamicResourceUsage: (params: Record<string, any>) => ({
        effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
      }),
      parameterSchema: [
        pInt("decay", "Decay", 0, 99, "1"),
        pInt("dampingHi", "Damping Hi", 0, 99, "1"),
        pInt("dampingLo", "Damping Lo", 0, 99, "1"),
        pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
        pInt("diffusion", "Diffusion", 0, 99, "2"),
        pInt("highFrequencyRollOffHz", "High Frequency Roll Off", 200, 20000, "3", "Hz"),
        pInt("predelayMs", "Predelay", 1, 250, "4", "mS"),
        pInt("mix", "Mix", -99, 99, "4"),
        pInt("reflectionLevel", "Reflection Level", 0, 99, "5"),
        pInt("spread", "Spread", 0, 99, "5"),
        pInt("reverberationSwirl", "Reverberation Swirl", 0, 99, "6"),
        pEnum("gateTrig", "Gate Trig", ["Off", "Left", "Right", "L&R"], "7"),
        pInt("gateHoldMs", "Hold", 10, 500, "7", "mS"),
        pInt("gateReleaseTimeMs", "Gate Release Time", 0, 500, "8", "mS"),
        pInt("gateLevel", "Gate Level", 0, 99, "9")
      ]
    };
  })),

  {
    id: "REVERB_SPRING",
    family: "REVERB" as const,
    displayName: "Spring",
    outputs: ["L", "R"] as Array<"L" | "R" | "M">,
    resourceUsage: { dspPercentBase: 41, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
    }),
    parameterSchema: [
      pInt("decay", "Decay", 0, 99, "1"),
      pInt("dampingHi", "Damping Hi", 0, 99, "1"),
      pInt("dampingLo", "Damping Lo", 0, 99, "1"),
      pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
      pInt("diffusion", "Diffusion", 0, 99, "2"),
      pInt("highFrequencyRollOffHz", "High Frequency Roll Off", 200, 20000, "4", "Hz"), // Manual skips 3? Yes, listed as 4
      pInt("predelayMs", "Predelay", 1, 250, "5", "mS"),
      pInt("mix", "Mix", -99, 99, "5"),
      pEnum("gateTrig", "Gate Trig", ["Off", "Left", "Right", "L&R"], "7"),
      pInt("gateHoldMs", "Hold", 10, 500, "7", "mS"),
      pInt("gateReleaseTimeMs", "Gate Release Time", 0, 500, "8", "mS"),
      pInt("gateLevel", "Gate Level", 0, 99, "9")
    ]
  },
  {
    id: "REVERB_NONLINEAR",
    family: "REVERB" as const,
    displayName: "Nonlinear",
    outputs: ["L", "R"] as Array<"L" | "R" | "M">,
    resourceUsage: { dspPercentBase: 38, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
    }),
    parameterSchema: [
      pInt("gateHoldTime", "Gate Hold Time", 0, 99, "1"),
      pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
      pInt("diffusion", "Diffusion", 0, 99, "2"),
      pInt("inputHighFrequencyRollOffHz", "Input High Frequency Roll Off", 200, 20000, "3", "Hz"),
      pInt("predelayMs", "Predelay", 1, 250, "3", "mS"), // Added to page 3, though manual mixes up pages sometimes
      pInt("mix", "Mix", -99, 99, "3")
    ]
  },
  {
    id: "REVERB_REVERSE",
    family: "REVERB" as const,
    displayName: "Reverse",
    outputs: ["L", "R"] as Array<"L" | "R" | "M">,
    resourceUsage: { dspPercentBase: 38, lfoCountBase: 0, effectMemoryBaseMs: 0, usesMicroprocessorAssist: false },
    dynamicResourceUsage: (params: Record<string, any>) => ({
      effectMemoryMs: typeof params.predelayMs === 'number' ? params.predelayMs : 0
    }),
    parameterSchema: [
      pInt("reverseTime", "Reverse Time", 0, 99, "1"),
      pInt("reverbDensity", "Reverb Density", 0, 99, "2"),
      pInt("diffusion", "Diffusion", 0, 99, "2"),
      pInt("inputHighFrequencyRollOffHz", "Input High Frequency Roll Off", 200, 20000, "3", "Hz"),
      pInt("predelayMs", "Predelay", 1, 250, "3", "mS"),
      pInt("mix", "Mix", -99, 99, "3")
    ]
  }
];
