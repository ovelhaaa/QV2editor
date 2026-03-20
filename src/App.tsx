import { useState } from 'react';
import { useProgramState } from './hooks/useProgramState';
import type { BlockId } from './domain/types';
import { GraphView } from './components/GraphView';
import { EditorPanel } from './components/EditorPanel';
import { Download, Upload } from 'lucide-react';
import './App.css';

function App() {
  const { program, setProgram, exportProgram, importProgram } = useProgramState();
  const [selectedBlockId, setSelectedBlockId] = useState<BlockId | null>(null);
  const [selectedOutputNode, setSelectedOutputNode] = useState(false);
  const [globalDirectMute, setGlobalDirectMute] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      importProgram(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      <header className="h-14 bg-gray-900 text-white flex items-center justify-between px-6 shadow-md z-20">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold tracking-tight">QuadraVerb 2 Editor</h1>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Beta</span>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 flex items-center px-3 py-1.5 rounded transition">
            <Upload size={14} className="mr-2" />
            Import
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
          <button
            className="bg-blue-600 hover:bg-blue-500 flex items-center px-3 py-1.5 rounded transition"
            onClick={exportProgram}
          >
            <Download size={14} className="mr-2" />
            Export
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <GraphView
          program={program}
          selectedBlockId={selectedBlockId}
          selectedOutputNode={selectedOutputNode}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            setSelectedOutputNode(false);
          }}
          onSelectOutput={() => {
            setSelectedBlockId(null);
            setSelectedOutputNode(true);
          }}
          globalDirectMute={globalDirectMute}
        />
        <EditorPanel
          program={program}
          selectedBlockId={selectedBlockId}
          selectedOutputNode={selectedOutputNode}
          globalDirectMute={globalDirectMute}
          setGlobalDirectMute={setGlobalDirectMute}
          onUpdateProgram={setProgram}
        />
      </main>
    </div>
  );
}

export default App;