import type { MidiCapability } from './midiTypes';

export type MidiMessageHandler = (data: Uint8Array) => void;

class WebMidiService {
  private midiAccess: MIDIAccess | null = null;
  private inputSubscriptions: Map<string, (e: MIDIMessageEvent) => void> = new Map();

  async requestAccess(): Promise<MidiCapability> {
    if (!navigator.requestMIDIAccess) {
      return {
        supported: false,
        sysexSupported: false,
        inputs: [],
        outputs: []
      };
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });

      const capability: MidiCapability = {
        supported: true,
        sysexSupported: this.midiAccess.sysexEnabled,
        inputs: Array.from(this.midiAccess.inputs.values()).map(input => ({
          id: input.id,
          name: input.name || `Input ${input.id}`
        })),
        outputs: Array.from(this.midiAccess.outputs.values()).map(output => ({
          id: output.id,
          name: output.name || `Output ${output.id}`
        }))
      };

      return capability;
    } catch (error) {
      console.warn("MIDI Access failed or denied", error);
      return {
        supported: true,
        sysexSupported: false,
        inputs: [],
        outputs: []
      };
    }
  }

  getInputs() {
    if (!this.midiAccess) return [];
    return Array.from(this.midiAccess.inputs.values());
  }

  getOutputs() {
    if (!this.midiAccess) return [];
    return Array.from(this.midiAccess.outputs.values());
  }

  send(outputId: string, data: Uint8Array): boolean {
    if (!this.midiAccess) return false;
    const output = this.midiAccess.outputs.get(outputId);
    if (!output) return false;

    try {
      output.send(data);
      return true;
    } catch (e) {
      console.error("Failed to send MIDI message", e);
      return false;
    }
  }

  subscribeToInput(inputId: string, handler: MidiMessageHandler): () => void {
    if (!this.midiAccess) return () => {};

    const input = this.midiAccess.inputs.get(inputId);
    if (!input) return () => {};

    // Remove existing subscription if any
    this.unsubscribeFromInput(inputId);

    const listener = (event: Event) => {
      const midiEvent = event as MIDIMessageEvent;
      if (midiEvent.data) {
        handler(midiEvent.data);
      }
    };

    input.addEventListener("midimessage", listener);
    this.inputSubscriptions.set(inputId, listener);

    return () => {
      this.unsubscribeFromInput(inputId);
    };
  }

  unsubscribeFromInput(inputId: string) {
    if (!this.midiAccess) return;

    const input = this.midiAccess.inputs.get(inputId);
    const listener = this.inputSubscriptions.get(inputId);

    if (input && listener) {
      input.removeEventListener("midimessage", listener);
    }
    this.inputSubscriptions.delete(inputId);
  }

  disconnect() {
    if (!this.midiAccess) return;

    // Cleanup all subscriptions
    for (const inputId of this.inputSubscriptions.keys()) {
      this.unsubscribeFromInput(inputId);
    }

    this.midiAccess = null;
  }
}

export const webMidiService = new WebMidiService();
