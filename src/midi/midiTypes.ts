export interface MidiCapability {
  supported: boolean;
  sysexSupported: boolean;
  inputs: Array<{ id: string; name: string }>;
  outputs: Array<{ id: string; name: string }>;
}
