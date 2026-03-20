import { useEffect, useState } from "react";
import { webMidiService } from "../midi/webMidiService";
import type { MidiCapability } from "../midi/midiTypes";
import { decodeMessage, buildGlobalDumpRequest, buildBlockBypassRequest, buildEnter } from "../sysex/qv2Protocol";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

export function MidiDebugPanel() {
  const [capability, setCapability] = useState<MidiCapability | null>(null);
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");
  const [logs, setLogs] = useState<{ dir: "in" | "out"; hex: string; desc?: string }[]>([]);
  const [hexInput, setHexInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedInput) {
      const unsubscribe = webMidiService.subscribeToInput(selectedInput, (data) => {
        const decoded = decodeMessage(data);
        setLogs(prev => [...prev, {
          dir: "in" as const,
          hex: toHex(data),
          desc: `${decoded.type} ${decoded.parsed ? JSON.stringify(decoded.parsed) : ''}`
        }].slice(-20)); // Keep last 20
      });

      return () => {
        unsubscribe();
      };
    }
  }, [selectedInput]);

  const requestAccess = async () => {
    const cap = await webMidiService.requestAccess();
    setCapability(cap);
    if (cap.inputs.length > 0) setSelectedInput(cap.inputs[0].id);
    if (cap.outputs.length > 0) setSelectedOutput(cap.outputs[0].id);
  };

  const sendBytes = (bytes: Uint8Array, desc: string) => {
    if (!selectedOutput) return;
    webMidiService.send(selectedOutput, bytes);
    setLogs(prev => [...prev, { dir: "out" as const, hex: toHex(bytes), desc }].slice(-20));
  };

  const sendRawHex = () => {
    try {
      const cleanHex = hexInput.replace(/[^0-9A-Fa-f]/g, '');
      if (cleanHex.length % 2 !== 0) throw new Error("Invalid hex length");

      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
      }
      sendBytes(bytes, "Raw Hex");
    } catch (e) {
      alert("Invalid hex input");
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-0 right-0 m-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 transition"
        >
          Open MIDI Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full max-w-lg bg-white border border-gray-300 shadow-2xl z-50 rounded-tl-lg flex flex-col" style={{ height: '400px' }}>
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center rounded-tl-lg">
        <h3 className="font-semibold text-sm">MIDI / SysEx Diagnostics</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white px-2">✕</button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto text-sm space-y-4">
        {!capability ? (
          <button
            onClick={requestAccess}
            className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
          >
            Request MIDI Access
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Input Port</label>
                <select
                  className="w-full border p-1 rounded"
                  value={selectedInput}
                  onChange={e => setSelectedInput(e.target.value)}
                >
                  <option value="">None</option>
                  {capability.inputs.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Output Port</label>
                <select
                  className="w-full border p-1 rounded"
                  value={selectedOutput}
                  onChange={e => setSelectedOutput(e.target.value)}
                >
                  <option value="">None</option>
                  {capability.outputs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => sendBytes(buildGlobalDumpRequest(), "Global Request")} className="bg-gray-100 border px-3 py-1 text-xs rounded hover:bg-gray-200">
                Global Req
              </button>
              <button onClick={() => sendBytes(buildBlockBypassRequest(), "Bypass Request")} className="bg-gray-100 border px-3 py-1 text-xs rounded hover:bg-gray-200">
                Bypass Req
              </button>
              <button onClick={() => sendBytes(buildEnter(), "Enter Command")} className="bg-gray-100 border px-3 py-1 text-xs rounded hover:bg-gray-200">
                Enter
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="F0 ... F7"
                className="flex-1 border p-1 rounded text-xs font-mono"
                value={hexInput}
                onChange={e => setHexInput(e.target.value)}
              />
              <button onClick={sendRawHex} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">Send Hex</button>
            </div>

            <div className="bg-gray-50 border rounded p-2 h-40 overflow-y-auto font-mono text-[10px]">
              {logs.length === 0 && <span className="text-gray-400">No messages yet...</span>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1 border-b border-gray-100 pb-1">
                  <span className={log.dir === "in" ? "text-green-600" : "text-blue-600"}>
                    {log.dir === "in" ? "RX" : "TX"}:
                  </span>
                  <span className="ml-2 text-gray-700">{log.hex}</span>
                  {log.desc && <div className="text-gray-500 mt-1">{log.desc}</div>}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              SysEx Supported: {capability.sysexSupported ? "Yes ✅" : "No ❌"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
