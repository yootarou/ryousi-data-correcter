import { useCallback } from 'react';
import type { CatchCounterProps, CatchItem } from './CatchCounter.types';

export const CatchCounter: React.FC<CatchCounterProps> = ({
  label,
  items,
  onChange,
  speciesOptions,
  error,
  className = '',
}) => {
  const addItem = useCallback(() => {
    const newItem: CatchItem = {
      id: crypto.randomUUID(),
      species: '',
      count: 0,
      weight_kg: 0,
    };
    onChange([...items, newItem]);
  }, [items, onChange]);

  const removeItem = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const updateItem = useCallback(
    (id: string, field: keyof CatchItem, value: string | number) => {
      onChange(
        items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      );
    },
    [items, onChange],
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1.5 text-sm font-medium text-ocean-600 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors duration-150 min-h-[36px]"
        >
          + 追加
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-2">項目を追加してください</p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <select
              value={item.species}
              onChange={(e) => updateItem(item.id, 'species', e.target.value)}
              className="flex-1 px-2 py-2 text-sm rounded-lg border border-gray-300 bg-white min-h-[40px]"
            >
              <option value="">魚種</option>
              {speciesOptions.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.count || ''}
              onChange={(e) => updateItem(item.id, 'count', Number(e.target.value))}
              placeholder="匹"
              min={0}
              className="w-16 px-2 py-2 text-sm rounded-lg border border-gray-300 text-center min-h-[40px]"
            />
            <input
              type="number"
              value={item.weight_kg || ''}
              onChange={(e) => updateItem(item.id, 'weight_kg', Number(e.target.value))}
              placeholder="kg"
              min={0}
              step={0.1}
              className="w-20 px-2 py-2 text-sm rounded-lg border border-gray-300 text-center min-h-[40px]"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
