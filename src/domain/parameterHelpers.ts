import type { Block, BlockFamily } from "./types";
import type { EffectTypeDefinition } from "./parameterSchemas";

export function getEffectTypesByFamily(family: BlockFamily, effectTable: EffectTypeDefinition[]): EffectTypeDefinition[] {
  if (family === 'OFF') return [];
  return effectTable.filter(e => e.family === family);
}

export function getEffectTypeDefinition(effectTypeId: string | null | undefined, effectTable: EffectTypeDefinition[]): EffectTypeDefinition | undefined {
  if (!effectTypeId) return undefined;
  return effectTable.find(e => e.id === effectTypeId);
}

export function buildDefaultParameters(effectTypeDefinition: EffectTypeDefinition | undefined): Record<string, any> {
  const params: Record<string, any> = {};
  if (!effectTypeDefinition) return params;

  for (const def of effectTypeDefinition.parameterSchema) {
    if (def.defaultValue !== undefined) {
      params[def.id] = def.defaultValue;
    } else {
      if (def.type === 'int' || def.type === 'float') {
        // use min or 0 or whatever makes sense if no default
        if (def.min !== undefined && def.max !== undefined) {
          if (0 >= def.min && 0 <= def.max) {
             params[def.id] = 0;
          } else {
             params[def.id] = def.min;
          }
        } else {
          params[def.id] = 0;
        }
      } else if (def.type === 'enum' && def.enumValues && def.enumValues.length > 0) {
        params[def.id] = def.enumValues[0];
      } else if (def.type === 'bool') {
        params[def.id] = false;
      }
    }
  }

  return params;
}

export function sanitizeParameters(parameters: Record<string, any>, effectTypeDefinition: EffectTypeDefinition | undefined): Record<string, any> {
  const sanitized: Record<string, any> = {};
  if (!effectTypeDefinition) return sanitized;

  for (const def of effectTypeDefinition.parameterSchema) {
    const val = parameters[def.id];

    if (val === undefined) {
      continue;
    }

    if (def.type === 'int' || def.type === 'float') {
      let num = Number(val);
      if (isNaN(num)) continue;

      if (def.min !== undefined) num = Math.max(def.min, num);
      if (def.max !== undefined) num = Math.min(def.max, num);

      sanitized[def.id] = num;
    } else if (def.type === 'enum' && def.enumValues) {
      if (def.enumValues.includes(val)) {
        sanitized[def.id] = val;
      } else {
        sanitized[def.id] = def.enumValues[0];
      }
    } else if (def.type === 'bool') {
      sanitized[def.id] = Boolean(val);
    }
  }

  return sanitized;
}

export function changeBlockFamily(block: Block, family: BlockFamily, effectTable: EffectTypeDefinition[]): Block {
  const newBlock = { ...block, family };

  if (family === 'OFF') {
    newBlock.effectType = null;
    newBlock.parameters = {};
    return newBlock;
  }

  const currentDef = getEffectTypeDefinition(block.effectType, effectTable);
  if (currentDef && currentDef.family !== family) {
    newBlock.effectType = null;
    newBlock.parameters = {};
  }

  return newBlock;
}

export function changeBlockEffectType(block: Block, effectTypeId: string | null, effectTable: EffectTypeDefinition[]): Block {
  const newBlock = { ...block, effectType: effectTypeId };

  if (!effectTypeId) {
    newBlock.parameters = {};
    return newBlock;
  }

  const newDef = getEffectTypeDefinition(effectTypeId, effectTable);
  const defaults = buildDefaultParameters(newDef);
  const sanitizedOld = sanitizeParameters(block.parameters, newDef);

  // Merge sanitized old parameters into defaults, so valid old values are kept, invalid dropped, new missing get defaults
  newBlock.parameters = { ...defaults, ...sanitizedOld };

  return newBlock;
}