import type { MultiSelectProps } from './MultiSelect.types';

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  required,
  className = '',
}) => {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                min-h-[44px] transition-colors duration-150 border
                ${selected
                  ? 'bg-ocean-600 text-white border-ocean-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-ocean-400'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
