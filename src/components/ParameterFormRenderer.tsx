import React from 'react';
import type { ParameterDefinition } from '../domain/parameterSchemas';

interface ParameterFormRendererProps {
  parametersSchema: ParameterDefinition[];
  currentValues: Record<string, any>;
  onChange: (parameterId: string, value: any) => void;
}

export function ParameterFormRenderer({ parametersSchema, currentValues, onChange }: ParameterFormRendererProps) {
  // Group by page
  const pages = new Set<string>();
  parametersSchema.forEach(p => {
    if (p.page) pages.add(p.page);
  });

  const sortedPages = Array.from(pages).sort((a, b) => parseInt(a) - parseInt(b));

  const [activePage, setActivePage] = React.useState<string>(sortedPages.length > 0 ? sortedPages[0] : '');

  // Reset active page if schema changes and activePage is not in new schema
  React.useEffect(() => {
    if (sortedPages.length > 0 && !sortedPages.includes(activePage)) {
      setActivePage(sortedPages[0]);
    }
  }, [sortedPages, activePage]);

  if (parametersSchema.length === 0) {
    return <div className="text-sm text-gray-500 italic p-4 text-center">No parameters available for this effect.</div>;
  }

  const renderInput = (def: ParameterDefinition) => {
    const value = currentValues[def.id] ?? '';

    switch (def.type) {
      case 'int':
      case 'float':
        return (
          <input
            type="number"
            className="w-full border rounded p-1 text-sm bg-gray-50"
            value={value}
            min={def.min}
            max={def.max}
            step={def.step ?? (def.type === 'float' ? 'any' : 1)}
            onChange={e => {
              const num = def.type === 'int' ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
              if (!isNaN(num)) onChange(def.id, num);
            }}
          />
        );
      case 'bool':
        return (
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={!!value}
            onChange={e => onChange(def.id, e.target.checked)}
          />
        );
      case 'enum':
        return (
          <select
            className="w-full border rounded p-1 text-sm bg-gray-50"
            value={value}
            onChange={e => onChange(def.id, e.target.value)}
          >
            {def.enumValues?.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderParameter = (def: ParameterDefinition) => {
    let displayValue = currentValues[def.id] !== undefined ? currentValues[def.id] : '';
    // Special formatting for "Off" values mapped to -49 for Tap Volume
    if (def.id.startsWith('tap') && def.id.endsWith('VolumeDb') && displayValue === -49) {
      displayValue = 'Off';
    }

    return (
      <div key={def.id} className="flex flex-col mb-3">
        <label className="text-xs font-semibold text-gray-700 flex justify-between mb-1">
          <span>{def.label}</span>
          <span className="text-gray-500 font-normal ml-1 text-[10px]">
            {displayValue} {def.unit && displayValue !== 'Off' ? def.unit : ''}
          </span>
        </label>
        {renderInput(def)}
        <div className="text-[10px] text-gray-400 flex justify-between mt-1">
           <span>{(def.min !== undefined || def.max !== undefined) ? `Range: ${def.min ?? '-∞'} to ${def.max ?? '∞'}` : ''}</span>
           <span>{def.step !== undefined ? `Step: ${def.step}` : ''}</span>
        </div>
      </div>
    );
  };

  const paramsToRender = sortedPages.length > 0
    ? parametersSchema.filter(p => p.page === activePage)
    : parametersSchema;

  return (
    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 mt-4">
      <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">Effect Parameters</h3>

      {sortedPages.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
          {sortedPages.map(page => {
            const label = parametersSchema.find(p => p.page === page)?.pageLabel || `Page ${page}`;
            return (
              <button
                key={page}
                className={`text-xs px-2 py-1 rounded ${activePage === page ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setActivePage(page)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {paramsToRender.map(renderParameter)}
      </div>
    </div>
  );
}