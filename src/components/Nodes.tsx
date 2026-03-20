import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { Block } from '../domain/types';
import { effectMetadataTable } from '../domain/metadata';

interface BlockNodeData {
  block: Block;
  isAudible: boolean;
  clippingRisk: boolean;
  isSelected: boolean;
  onSelect: (blockId: number) => void;
}

export function BlockNode({ data }: NodeProps<BlockNodeData>) {
  const { block, isAudible, clippingRisk, isSelected, onSelect } = data;
  const meta = block.effectType ? effectMetadataTable[block.effectType] : null;

  return (
    <div
      className={`relative rounded-md border-2 bg-white p-3 min-w-[150px] shadow-sm cursor-pointer
        ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-300'}
        ${!isAudible && block.family !== 'OFF' ? 'opacity-60 bg-gray-50' : ''}
        ${clippingRisk ? 'border-red-400' : ''}
      `}
      onClick={() => onSelect(block.id)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id={`in`}
        style={{ top: '50%', background: '#555' }}
      />

      <div className="font-bold text-sm text-gray-800 border-b pb-1 mb-2">
        Block {block.id}: {block.family}
      </div>

      <div className="text-xs text-gray-600 truncate">
        {meta?.name || 'Empty'}
      </div>

      {block.family !== 'OFF' && (
        <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
           <span>DSP: {meta?.dspCostPercent || 0}%</span>
           <span>LFO: {meta?.lfoCost || 0}</span>
        </div>
      )}

      {/* Warning indicators */}
      <div className="absolute -top-2 -right-2 flex space-x-1">
        {!isAudible && block.family !== 'OFF' && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white shadow" title="Inaudible Block">
            !
          </span>
        )}
        {clippingRisk && (
           <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow" title="Clipping Risk (Multiple Sources)">
             ↯
           </span>
        )}
      </div>

      {/* Output Handles (L, R, M) */}
      <Handle
        type="source"
        position={Position.Right}
        id={`L`}
        style={{ top: '25%', background: '#555' }}
      />
       <div className="absolute right-[-18px] top-[18%] text-[8px] font-bold text-gray-400 pointer-events-none">L</div>

      <Handle
        type="source"
        position={Position.Right}
        id={`R`}
        style={{ top: '50%', background: '#555' }}
      />
      <div className="absolute right-[-18px] top-[43%] text-[8px] font-bold text-gray-400 pointer-events-none">R</div>

      <Handle
        type="source"
        position={Position.Right}
        id={`M`}
        style={{ top: '75%', background: '#555' }}
      />
      <div className="absolute right-[-20px] top-[68%] text-[8px] font-bold text-gray-400 pointer-events-none">M</div>

    </div>
  );
}

export function IOHubNode({ data }: NodeProps<{ label: string, isInput?: boolean, isSelected?: boolean, onSelect?: () => void }>) {
  return (
    <div
      className={`rounded-full border-2 bg-gray-100 p-4 font-bold text-gray-700 shadow-sm cursor-pointer
      ${data.isSelected ? 'border-blue-500 shadow-md' : 'border-gray-400'}
      ${data.isInput ? 'rounded-l-none pl-6 border-l-0' : 'rounded-r-none pr-6 border-r-0'}`}
      onClick={data.onSelect ? data.onSelect : undefined}
    >
       {data.isInput ? (
         <>
          <div>{data.label}</div>
          <Handle type="source" position={Position.Right} id="L_IN" style={{ top: '35%' }} />
          <Handle type="source" position={Position.Right} id="R_IN" style={{ top: '65%' }} />
         </>
       ) : (
         <>
          <div>{data.label}</div>
          <Handle type="target" position={Position.Left} id="L_OUT" style={{ top: '35%' }} />
          <Handle type="target" position={Position.Left} id="R_OUT" style={{ top: '65%' }} />
         </>
       )}
    </div>
  );
}