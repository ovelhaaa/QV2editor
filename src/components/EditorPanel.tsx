import type { BlockId, Program, Route, RouteDestination, RouteSource } from '../domain/types';
import { effectMetadataTable } from '../domain/metadata';

interface EditorPanelProps {
  program: Program;
  selectedBlockId: BlockId | null;
  selectedOutputNode: boolean;
  globalDirectMute: boolean;
  setGlobalDirectMute: (b: boolean) => void;
  onUpdateProgram: (p: Program) => void;
}

export function EditorPanel({
  program,
  selectedBlockId,
  selectedOutputNode,
  globalDirectMute,
  setGlobalDirectMute,
  onUpdateProgram
}: EditorPanelProps) {
  const updateProgram = (updates: Partial<Program>) => {
    onUpdateProgram({ ...program, ...updates });
  };

  const block = selectedBlockId
    ? program.blocks.find(b => b.id === selectedBlockId)
    : null;

  return (
    <div className="w-80 h-full border-l border-gray-300 bg-gray-50 flex flex-col overflow-y-auto">
      <div className="p-4 bg-white border-b shadow-sm">
        <h2 className="text-lg font-bold">Program Editor</h2>
        <div className="mt-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Name (Max 14)</label>
          <input
            type="text"
            className="w-full border rounded p-1 text-sm"
            maxLength={14}
            value={program.name}
            onChange={e => updateProgram({ name: e.target.value })}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {block && (
          <BlockEditor
            block={block}
            program={program}
            onUpdateProgram={onUpdateProgram}
          />
        )}

        {selectedOutputNode && (
          <OutputMixEditor
            program={program}
            onUpdateProgram={onUpdateProgram}
          />
        )}

        {!block && !selectedOutputNode && (
          <div className="text-center text-sm text-gray-500 py-10 italic">
            Select a block or OUTPUT to edit settings and routing.
          </div>
        )}

        {/* Global Mix Settings */}
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <h3 className="font-bold mb-2">Global Mix</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label>Direct Mute:</label>
              <input
                type="checkbox"
                checked={globalDirectMute}
                onChange={e => setGlobalDirectMute(e.target.checked)}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <label>Direct Lvl:</label>
              <LevelSelect
                value={program.mix.directLevel}
                onChange={val => updateProgram({ mix: { ...program.mix, directLevel: val }})}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <label>Master FX Lvl:</label>
              <LevelSelect
                value={program.mix.masterEffectsLevel}
                onChange={val => updateProgram({ mix: { ...program.mix, masterEffectsLevel: val }})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, program, onUpdateProgram }: { block: Program['blocks'][0], program: Program, onUpdateProgram: (p: Program) => void }) {
  const updateBlock = (updates: Partial<Program['blocks'][0]>) => {
    const newBlocks = program.blocks.map(b => b.id === block.id ? { ...b, ...updates } : b);
    onUpdateProgram({ ...program, blocks: newBlocks });
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const family = e.target.value as any;
    let effectType = null;

    // Auto-select first available effect for the new family to simplify UI for now
    if (family !== 'OFF') {
      const available = Object.values(effectMetadataTable).filter(m => m.family === family);
      if (available.length > 0) {
        effectType = available[0].id;
      }
    }

    updateBlock({ family, effectType, parameters: {} });
  };

  const availableEffects = Object.values(effectMetadataTable).filter(m => m.family === block.family);

  // Routes where this block is the destination
  const blockDestId: RouteDestination = `Block${block.id}`;
  const incomingRoutes = program.routes.filter(r => r.destination === blockDestId);

  const addIncomingRoute = () => {
    // Default source that is not itself
    let defaultSource: RouteSource = 'L_IN';
    if (block.id === 1) defaultSource = 'L_IN';
    else defaultSource = `Block1.L`;

    const newRoute: Route = {
      id: crypto.randomUUID(),
      source: defaultSource,
      destination: blockDestId,
      levelDb: -6 // default patch cord
    };
    onUpdateProgram({ ...program, routes: [...program.routes, newRoute] });
  };

  const removeRoute = (routeId: string) => {
    onUpdateProgram({ ...program, routes: program.routes.filter(r => r.id !== routeId) });
  };

  const updateRoute = (routeId: string, updates: Partial<Route>) => {
    const newRoutes = program.routes.map(r => r.id === routeId ? { ...r, ...updates } : r);
    onUpdateProgram({ ...program, routes: newRoutes });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded shadow-sm border border-blue-200">
        <h3 className="font-bold text-blue-700 border-b pb-1 mb-2">Block {block.id}</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Family</label>
            <select className="w-full text-sm border rounded p-1" value={block.family} onChange={handleFamilyChange}>
              <option value="OFF">OFF</option>
              <option value="EQ">EQ</option>
              <option value="PITCH">PITCH</option>
              <option value="DELAY">DELAY</option>
              <option value="REVERB">REVERB</option>
            </select>
          </div>

          {block.family !== 'OFF' && (
            <div>
              <label className="text-xs font-semibold text-gray-600">Effect Type</label>
              <select
                className="w-full text-sm border rounded p-1"
                value={block.effectType || ''}
                onChange={e => updateBlock({ effectType: e.target.value })}
              >
                {availableEffects.map(efx => (
                  <option key={efx.id} value={efx.id}>{efx.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow-sm border border-green-200">
        <h3 className="font-bold text-green-700 border-b pb-1 mb-2">Inputs (Routing)</h3>
        {incomingRoutes.map((r, i) => (
          <div key={r.id} className="flex flex-col mb-3 border bg-gray-50 rounded p-2">
            <div className="flex justify-between items-center mb-1">
               <span className="text-xs font-bold text-gray-500">Source {i+1}</span>
               <button onClick={() => removeRoute(r.id)} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
            <select
              className="text-sm border p-1 mb-1 w-full"
              value={r.source}
              onChange={e => updateRoute(r.id, { source: e.target.value as RouteSource })}
            >
               <optgroup label="Inputs">
                 <option value="L_IN">Left In</option>
                 <option value="R_IN">Right In</option>
               </optgroup>
               <optgroup label="Blocks">
                 {[1,2,3,4,5,6,7,8].map(id => (
                   <option key={`Block${id}.L`} value={`Block${id}.L`}>Block {id} (L)</option>
                 ))}
                 {[1,2,3,4,5,6,7,8].map(id => (
                   <option key={`Block${id}.R`} value={`Block${id}.R`}>Block {id} (R)</option>
                 ))}
                 {[1,2,3,4,5,6,7,8].map(id => (
                   <option key={`Block${id}.M`} value={`Block${id}.M`}>Block {id} (M)</option>
                 ))}
               </optgroup>
            </select>
            <LevelSelect
               value={r.levelDb}
               onChange={val => updateRoute(r.id, { levelDb: val })}
               label="Lvl:"
            />
          </div>
        ))}

        <button
          className="w-full text-xs bg-green-100 hover:bg-green-200 text-green-800 font-bold py-1 px-2 rounded border border-green-300"
          onClick={addIncomingRoute}
        >
          + Add Input Source
        </button>
      </div>

      <div className="bg-white p-3 rounded shadow-sm border border-purple-200">
        <h3 className="font-bold text-purple-700 border-b pb-1 mb-2">Output Mix</h3>
        <div className="flex justify-between items-center text-sm">
           <label>Level to L/R Out:</label>
           <LevelSelect
             value={program.mix.blockLevels[block.id as BlockId] ?? 'OFF'}
             onChange={val => {
               const newBlockLevels = { ...program.mix.blockLevels, [block.id]: val };
               onUpdateProgram({ ...program, mix: { ...program.mix, blockLevels: newBlockLevels }});
             }}
           />
        </div>
      </div>

    </div>
  );
}

function OutputMixEditor({ program, onUpdateProgram }: { program: Program, onUpdateProgram: (p: Program) => void }) {
  const incomingL = program.routes.filter(r => r.destination === 'L_OUT');
  const incomingR = program.routes.filter(r => r.destination === 'R_OUT');

  const removeRoute = (routeId: string) => {
    onUpdateProgram({ ...program, routes: program.routes.filter(r => r.id !== routeId) });
  };

  const updateRoute = (routeId: string, updates: Partial<Route>) => {
    const newRoutes = program.routes.map(r => r.id === routeId ? { ...r, ...updates } : r);
    onUpdateProgram({ ...program, routes: newRoutes });
  };

  const addIncomingRoute = (dest: 'L_OUT' | 'R_OUT') => {
    const newRoute: Route = {
      id: crypto.randomUUID(),
      source: 'Block8.L', // Default
      destination: dest,
      levelDb: -6
    };
    onUpdateProgram({ ...program, routes: [...program.routes, newRoute] });
  };

  const renderRoutes = (routes: Route[], dest: 'L_OUT' | 'R_OUT', label: string) => (
    <div className="bg-white p-3 rounded shadow-sm border border-blue-200 mb-4">
      <h3 className="font-bold text-blue-700 border-b pb-1 mb-2">{label} Inputs</h3>
      {routes.map((r, i) => (
        <div key={r.id} className="flex flex-col mb-3 border bg-gray-50 rounded p-2">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-bold text-gray-500">Source {i+1}</span>
             <button onClick={() => removeRoute(r.id)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          <select
            className="text-sm border p-1 mb-1 w-full"
            value={r.source}
            onChange={e => updateRoute(r.id, { source: e.target.value as RouteSource })}
          >
             <optgroup label="Inputs">
               <option value="L_IN">Left In</option>
               <option value="R_IN">Right In</option>
             </optgroup>
             <optgroup label="Blocks">
               {[1,2,3,4,5,6,7,8].map(id => (
                 <option key={`Block${id}.L`} value={`Block${id}.L`}>Block {id} (L)</option>
               ))}
               {[1,2,3,4,5,6,7,8].map(id => (
                 <option key={`Block${id}.R`} value={`Block${id}.R`}>Block {id} (R)</option>
               ))}
               {[1,2,3,4,5,6,7,8].map(id => (
                 <option key={`Block${id}.M`} value={`Block${id}.M`}>Block {id} (M)</option>
               ))}
             </optgroup>
          </select>
          <LevelSelect
             value={r.levelDb}
             onChange={val => updateRoute(r.id, { levelDb: val })}
             label="Lvl:"
          />
        </div>
      ))}

      <button
        className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-2 rounded border border-blue-300"
        onClick={() => addIncomingRoute(dest)}
      >
        + Add Input Source
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 text-white p-3 rounded shadow-sm">
        <h3 className="font-bold text-lg">Main OUTPUT</h3>
        <p className="text-xs text-gray-300 mt-1">Route blocks directly to the outputs to make them audible.</p>
      </div>

      {renderRoutes(incomingL, 'L_OUT', 'L_OUT')}
      {renderRoutes(incomingR, 'R_OUT', 'R_OUT')}
    </div>
  );
}

function LevelSelect({ value, onChange, label }: { value: number | 'OFF', onChange: (val: number | 'OFF') => void, label?: string }) {
  const levels = ['OFF'];
  for (let i = -48; i <= 0; i++) {
    levels.push(i.toString());
  }

  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-xs text-gray-600">{label}</span>}
      <select
        className="border p-1 text-sm rounded w-20"
        value={value.toString()}
        onChange={e => {
          const v = e.target.value;
          onChange(v === 'OFF' ? 'OFF' : parseInt(v, 10));
        }}
      >
        {levels.map(l => (
          <option key={l} value={l}>{l === 'OFF' ? 'OFF' : `${l} dB`}</option>
        ))}
      </select>
    </div>
  );
}