export interface ParameterDefinition {
  id: string;
  label: string;
  type: "int" | "float" | "bool" | "enum";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string | boolean;
  enumValues?: string[];
  required: boolean;
  page?: string;
  pageLabel?: string;
}

export interface EffectTypeDefinition {
  id: string;
  family: "EQ" | "PITCH" | "DELAY" | "REVERB";
  displayName: string;
  outputs: Array<"L" | "R" | "M">;
  parameterSchema: ParameterDefinition[];
  resourceUsage: {
    dspPercentBase: number;
    lfoCountBase: number;
    usesMicroprocessorAssist: boolean;
    microAssistGroup?: string;
    effectMemoryBaseMs: number;
  };
  dynamicResourceUsage?: (
    params: Record<string, unknown>
  ) => Partial<{
    dspPercent: number;
    lfoCount: number;
    effectMemoryMs: number;
  }>;
}