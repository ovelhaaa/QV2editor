import { useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, ConnectionMode, useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

import type { BlockId, Program, RouteDestination } from '../domain/types';
import { validateProgram } from '../domain/validation';
import { BlockNode, IOHubNode } from './Nodes';

const nodeTypes = {
  block: BlockNode,
  iohub: IOHubNode
};

interface GraphViewProps {
  program: Program;
  selectedBlockId: BlockId | null;
  selectedOutputNode: boolean;
  onSelectBlock: (id: BlockId | null) => void;
  onSelectOutput: () => void;
  globalDirectMute: boolean;
}

export function GraphView({
  program,
  selectedBlockId,
  selectedOutputNode,
  onSelectBlock,
  onSelectOutput,
  globalDirectMute,
}: GraphViewProps) {
  const validation = useMemo(() => validateProgram(program), [program]);
  const metrics = validation.metrics;

  const computeNodes = useCallback(() => {
    const nodes: Node[] = [];

    // Inputs
    nodes.push({
      id: 'IN',
      type: 'iohub',
      position: { x: 50, y: 300 },
      data: { label: 'INPUT', isInput: true }
    });

    // Blocks (2 rows of 4)
    program.blocks.forEach((block, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;

      const x = 300 + col * 250;
      const y = 150 + row * 250;

      nodes.push({
        id: `Block${block.id}`,
        type: 'block',
        position: { x, y },
        data: {
          block,
          isAudible: !metrics.inaudibleBlocks.includes(block.id),
          clippingRisk: metrics.clippingRisks.includes(`Block${block.id}` as RouteDestination),
          isSelected: selectedBlockId === block.id,
          onSelect: onSelectBlock
        }
      });
    });

    // Outputs
    nodes.push({
      id: 'OUT',
      type: 'iohub',
      position: { x: 1350, y: 300 },
      data: {
        label: 'OUTPUT',
        isInput: false,
        isSelected: selectedOutputNode,
        onSelect: onSelectOutput
      }
    });

    return nodes;
  }, [program, metrics, selectedBlockId, selectedOutputNode, onSelectBlock, onSelectOutput]);

  const computeEdges = useCallback(() => {
    const edges: Edge[] = [];

    // Routes (Patch Cords)
    program.routes.forEach(route => {
      if (route.levelDb === 'OFF') return;

      // Check global mute
      if (globalDirectMute && (route.source === 'L_IN' || route.source === 'R_IN') && (route.destination === 'L_OUT' || route.destination === 'R_OUT')) {
        return; // Visual hide for global muted direct path
      }

      const sourceId = route.source.split('.')[0];
      let sourceHandle = 'L_IN';
      if (route.source === 'R_IN') sourceHandle = 'R_IN';
      else if (route.source.includes('.')) sourceHandle = route.source.split('.')[1]; // L, R, M

      const targetId = route.destination;
      const targetHandle = 'in';
      if (route.destination === 'L_OUT') {
        // We map to the generic OUT node and target L_OUT handle
        edges.push({
          id: route.id + '_L_OUT',
          source: sourceId === 'L_IN' || sourceId === 'R_IN' ? 'IN' : sourceId,
          target: 'OUT',
          sourceHandle,
          targetHandle: 'L_OUT',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        });
        return;
      }
      if (route.destination === 'R_OUT') {
        edges.push({
          id: route.id + '_R_OUT',
          source: sourceId === 'L_IN' || sourceId === 'R_IN' ? 'IN' : sourceId,
          target: 'OUT',
          sourceHandle,
          targetHandle: 'R_OUT',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        });
        return;
      }

      edges.push({
        id: route.id,
        source: sourceId === 'L_IN' || sourceId === 'R_IN' ? 'IN' : sourceId,
        target: targetId,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      });
    });

    return edges;
  }, [program, globalDirectMute]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computeNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(computeEdges());

  // Sync state manually when props change (proper React flow sync)
  useMemo(() => setNodes(computeNodes()), [computeNodes, setNodes]);
  useMemo(() => setEdges(computeEdges()), [computeEdges, setEdges]);

  const onConnect = useCallback((params: any) => {
    // Only support creating new routes conceptually via UI Panel for now,
    // or we can map visual connection to domain logic:
    // This requires complex reverse mapping from Handles to RouteSource / RouteDestination.

    // Simplification for the prototype: Ignore drag-drop connecting to keep source-of-truth in the Panel.
    console.log("Connect attempt, but ignored in favor of destination panel.", params);
  }, []);

  return (
    <div className="flex-1 h-full w-full bg-slate-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>

      {/* Global Resource Bar overlays */}
      <ResourceBar program={program} validation={validation} />
    </div>
  );
}

function ResourceBar({ program, validation }: { program: Program, validation: ReturnType<typeof validateProgram> }) {
  const m = validation.metrics;
  const isDspDanger = m.dspUsedPercent > 100;
  const isMemDanger = m.delayMemoryUsedMs > 5455.9;
  const isLfoDanger = m.lfosUsed > 4;

  return (
    <div className="absolute top-4 left-4 right-4 bg-white shadow-md rounded-lg p-3 flex flex-col z-10 border border-gray-200">
      <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
        <div>
           <span className="mr-2">{program.name || 'Untitled'}</span>
           <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded">Preset: {program.number}</span>
        </div>

        <div className="flex space-x-6">
          <div className={`flex flex-col items-center ${isDspDanger ? 'text-red-600 font-bold' : ''}`}>
             <span className="text-[10px] uppercase">DSP Usage</span>
             <span>{m.dspUsedPercent}% / 100%</span>
          </div>

          <div className={`flex flex-col items-center ${isMemDanger ? 'text-red-600 font-bold' : ''}`}>
             <span className="text-[10px] uppercase">Delay Mem</span>
             <span>{m.delayMemoryUsedMs} / 5455.9ms</span>
          </div>

          <div className={`flex flex-col items-center ${isLfoDanger ? 'text-red-600 font-bold' : ''}`}>
             <span className="text-[10px] uppercase">LFOs</span>
             <span>{m.lfosUsed} / 4</span>
          </div>

          <div className={`flex flex-col items-center ${!validation.isValid && m.microprocessorAssistUsed ? 'text-red-600 font-bold' : ''}`}>
             <span className="text-[10px] uppercase">Micro Assist</span>
             <span>{m.microprocessorAssistUsed ? '1' : '0'} / 1</span>
          </div>
        </div>
      </div>

      {validation.errors.length > 0 && (
         <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800 space-y-1">
            <p className="font-bold">Errors preventing valid program:</p>
            <ul className="list-disc pl-5">
              {validation.errors.map((e, i) => <li key={i}>{e.message}</li>)}
            </ul>
         </div>
      )}

      {validation.warnings.length > 0 && validation.errors.length === 0 && (
         <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800 space-y-1">
            <p className="font-bold">Warnings:</p>
            <ul className="list-disc pl-5">
              {validation.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
            </ul>
         </div>
      )}
    </div>
  );
}