import type { SelectInputProps } from './SelectInput.types';

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '選択してください',
  error,
  required,
  disabled,
  className = '',
}) => {
  const inputId = label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-base rounded-lg border bg-white appearance-none
          min-h-[44px] transition-colors duration-150
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10
          disabled:bg-gray-100 disabled:text-gray-400
          ${error
            ? 'border-red-400 focus:outline-red-500'
            : 'border-gray-300 focus:outline-ocean-500'
          }
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
