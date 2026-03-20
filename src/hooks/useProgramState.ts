import { useState, useCallback } from 'react';
import type { Program, Block } from '../domain/types';

export function createEmptyProgram(): Program {
  const blocks: Block[] = [];
  for (let i = 1; i <= 8; i++) {
    blocks.push({
      id: i as any,
      family: 'OFF',
      effectType: null,
      parameters: {}
    });
  }

  return {
    bank: 'user',
    number: 0,
    name: 'Init Program',
    blocks,
    routes: [],
    mix: {
      blockLevels: { 1: 'OFF', 2: 'OFF', 3: 'OFF', 4: 'OFF', 5: 'OFF', 6: 'OFF', 7: 'OFF', 8: 'OFF' },
      directLevel: 'OFF',
      masterEffectsLevel: 0,
    },
    modulations: [],
  };
}

export function useProgramState(initialState?: Program) {
  const [program, setProgram] = useState<Program>(initialState || createEmptyProgram());

  const exportProgram = useCallback(() => {
    const json = JSON.stringify(program, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'program'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [program]);

  const importProgram = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json) as Program;
        // Ideally perform schema validation here
        setProgram(parsed);
      } catch (err) {
        console.error('Failed to parse Program JSON', err);
        alert('Invalid program file');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    program,
    setProgram,
    exportProgram,
    importProgram
  };
}