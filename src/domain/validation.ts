import type { BlockId, Program, Route, RouteDestination } from './types';
import { effectTypes } from './effectTypes';
import { getEffectTypeDefinition } from './parameterHelpers';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: {
    dspUsedPercent: number;
    delayMemoryUsedMs: number;
    lfosUsed: number;
    microprocessorAssistUsed: boolean;
    inaudibleBlocks: BlockId[];
    clippingRisks: RouteDestination[];
  };
}

export type ValidationErrorType =
  | 'DSP_IS_FULL'
  | 'EFFECT_MEMORY_IS_FULL'
  | 'OUT_OF_LFOs'
  | 'BLOCK_COMBINATION_NOT_ALLOWED'
  | 'INVALID_PROGRAM_NAME';

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
}

export type ValidationWarningType =
  | 'INAUDIBLE_BLOCK'
  | 'POTENTIAL_CLIPPING'
  | 'FEEDBACK_LOOP'
  | 'APPROACHING_LIMITS';

export interface ValidationWarning {
  type: ValidationWarningType;
  message: string;
  blockId?: BlockId;
  destination?: RouteDestination;
}

const MAX_DSP = 100;
const MAX_DELAY_MEMORY_MS = 5455.9;
const MAX_DELAY_PER_LINE_MS = 5000;
const MAX_LFOS = 4;
const MAX_PROGRAM_NAME_LENGTH = 14;

export function validateProgram(program: Program): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Validate Program Name
  if (program.name.length > MAX_PROGRAM_NAME_LENGTH) {
    errors.push({ type: 'INVALID_PROGRAM_NAME', message: `Program name cannot exceed ${MAX_PROGRAM_NAME_LENGTH} characters.` });
  }

  let totalDsp = 0;
  let totalLfos = 0;
  let hasMicroprocessorAssist = false;
  // totalDelayMemoryMs could be complex in real implementation based on parameters
  // For the validation engine prototype, we will pull it from metadata or parameters.
  let totalDelayMemoryMs = 0;

  // 2. Resource Accumulation - Blocks
  for (const block of program.blocks) {
    if (block.effectType && block.family !== 'OFF') {
      const meta = getEffectTypeDefinition(block.effectType, effectTypes);
      if (meta) {
        totalDsp += meta.resourceUsage.dspPercentBase;
        totalLfos += meta.resourceUsage.lfoCountBase;

        let delayMs = 0;
        if (meta.dynamicResourceUsage) {
          const dynamic = meta.dynamicResourceUsage(block.parameters || {});
          if (dynamic.dspPercent !== undefined) totalDsp += dynamic.dspPercent;
          if (dynamic.lfoCount !== undefined) totalLfos += dynamic.lfoCount;
          if (dynamic.effectMemoryMs !== undefined) delayMs = dynamic.effectMemoryMs;
        }

        if (delayMs > MAX_DELAY_PER_LINE_MS) {
           errors.push({ type: 'EFFECT_MEMORY_IS_FULL', message: `Block ${block.id} delay line exceeds max ${MAX_DELAY_PER_LINE_MS} ms.` });
        }
        totalDelayMemoryMs += delayMs;

        if (meta.resourceUsage.usesMicroprocessorAssist) {
          if (hasMicroprocessorAssist) {
             errors.push({ type: 'BLOCK_COMBINATION_NOT_ALLOWED', message: `BLOCK COMBINATION NOT ALLOWED: Only one effect requiring microprocessor assist is allowed per Program.` });
          }
          hasMicroprocessorAssist = true;
        }
      }
    }
  }

  // 3. Resource Accumulation - Routes
  for (const route of program.routes) {
    if (route.levelDb !== 'OFF') {
      if (route.levelDb < 0) {
        totalDsp += 2;
      } else {
        totalDsp += 1;
      }
    }
  }

  // 4. Resource Limit Checks
  if (totalDsp > MAX_DSP) {
    errors.push({ type: 'DSP_IS_FULL', message: `DSP IS FULL` });
  } else if (totalDsp > MAX_DSP * 0.9) {
    warnings.push({ type: 'APPROACHING_LIMITS', message: `DSP usage is high: ${totalDsp}%` });
  }

  if (totalLfos > MAX_LFOS) {
    errors.push({ type: 'OUT_OF_LFOs', message: `OUT OF LFOs` });
  } else if (totalLfos === MAX_LFOS) {
    warnings.push({ type: 'APPROACHING_LIMITS', message: `All ${MAX_LFOS} LFOs are in use.` });
  }

  if (totalDelayMemoryMs > MAX_DELAY_MEMORY_MS) {
    errors.push({ type: 'EFFECT_MEMORY_IS_FULL', message: `EFFECT MEMORY IS FULL` });
  } else if (totalDelayMemoryMs > MAX_DELAY_MEMORY_MS * 0.9) {
    warnings.push({ type: 'APPROACHING_LIMITS', message: `Delay memory usage is high: ${totalDelayMemoryMs}ms` });
  }

  // 5. Graph Traversal: Audibility
  const inaudibleBlocks = findInaudibleBlocks(program.blocks, program.routes);
  for (const blockId of inaudibleBlocks) {
    warnings.push({ type: 'INAUDIBLE_BLOCK', message: `Block ${blockId} has no path from inputs to outputs.`, blockId });
  }

  // 6. Graph Analysis: Clipping Risks
  const clippingRisks = findClippingRisks(program.routes);
  for (const dest of clippingRisks) {
    warnings.push({ type: 'POTENTIAL_CLIPPING', message: `Multiple sources summed at ${dest} risk clipping.`, destination: dest });
  }

  // 7. Graph Analysis: Feedback Loops
  if (hasFeedbackLoops(program.routes)) {
    warnings.push({ type: 'FEEDBACK_LOOP', message: `Feedback loops detected.` });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      dspUsedPercent: totalDsp,
      delayMemoryUsedMs: totalDelayMemoryMs,
      lfosUsed: totalLfos,
      microprocessorAssistUsed: hasMicroprocessorAssist,
      inaudibleBlocks,
      clippingRisks
    }
  };
}

function findInaudibleBlocks(blocks: Program['blocks'], routes: Route[]): BlockId[] {
  // Nodes: L_IN, R_IN, L_OUT, R_OUT, Block1..8
  const forwardGraph = new Map<string, string[]>();
  const reverseGraph = new Map<string, string[]>();

  // Init maps
  ['L_IN', 'R_IN', 'L_OUT', 'R_OUT'].forEach(n => {
    forwardGraph.set(n, []);
    reverseGraph.set(n, []);
  });
  blocks.forEach(b => {
    forwardGraph.set(`Block${b.id}`, []);
    reverseGraph.set(`Block${b.id}`, []);
  });

  // Build edges
  for (const r of routes) {
    if (r.levelDb === 'OFF') continue;

    // source is 'L_IN' or 'Block1.L'
    const srcNode = r.source.split('.')[0];
    const destNode = r.destination;

    if (!forwardGraph.has(srcNode)) forwardGraph.set(srcNode, []);
    forwardGraph.get(srcNode)!.push(destNode);

    if (!reverseGraph.has(destNode)) reverseGraph.set(destNode, []);
    reverseGraph.get(destNode)!.push(srcNode);
  }

  // BFS Forward from Inputs
  const reachableFromIn = new Set<string>();
  const queueIn = ['L_IN', 'R_IN'];
  while (queueIn.length > 0) {
    const curr = queueIn.shift()!;
    if (!reachableFromIn.has(curr)) {
      reachableFromIn.add(curr);
      const neighbors = forwardGraph.get(curr) || [];
      queueIn.push(...neighbors);
    }
  }

  // BFS Reverse from Outputs
  const reachableFromOut = new Set<string>();
  const queueOut = ['L_OUT', 'R_OUT'];
  while (queueOut.length > 0) {
    const curr = queueOut.shift()!;
    if (!reachableFromOut.has(curr)) {
      reachableFromOut.add(curr);
      const neighbors = reverseGraph.get(curr) || [];
      queueOut.push(...neighbors);
    }
  }

  const inaudible: BlockId[] = [];
  for (const b of blocks) {
    if (b.family === 'OFF') continue;
    const bName = `Block${b.id}`;
    if (!reachableFromIn.has(bName) || !reachableFromOut.has(bName)) {
      inaudible.push(b.id);
    }
  }

  return inaudible;
}

function findClippingRisks(routes: Route[]): RouteDestination[] {
  // Warn if multiple routes go to the same destination and level is high
  const destCounts = new Map<RouteDestination, number>();
  for (const r of routes) {
    if (r.levelDb !== 'OFF') {
      destCounts.set(r.destination, (destCounts.get(r.destination) || 0) + 1);
    }
  }

  const risks: RouteDestination[] = [];
  destCounts.forEach((count, dest) => {
    if (count > 1) {
      risks.push(dest);
    }
  });

  return risks;
}

function hasFeedbackLoops(routes: Route[]): boolean {
  // Directed graph cycle detection (DFS)
  const graph = new Map<string, string[]>();

  for (const r of routes) {
    if (r.levelDb === 'OFF') continue;
    const src = r.source.split('.')[0];
    if (!graph.has(src)) graph.set(src, []);
    graph.get(src)!.push(r.destination);
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function dfs(node: string): boolean {
    if (visiting.has(node)) return true; // cycle detected
    if (visited.has(node)) return false; // already checked and clear

    visiting.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    visiting.delete(node);
    visited.add(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) return true;
  }

  return false;
}