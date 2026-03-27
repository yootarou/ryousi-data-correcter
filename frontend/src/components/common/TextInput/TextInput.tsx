import type { TextInputProps } from './TextInput.types';

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  suffix,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-3 py-2.5 text-base rounded-lg border bg-white
            min-h-[44px] transition-colors duration-150
            ${error
              ? 'border-red-400 focus:outline-red-500'
              : 'border-gray-300 focus:outline-ocean-500'
            }
            ${suffix ? 'pr-12' : ''}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-400">{hint}</p>}
    </div>
  );
};
