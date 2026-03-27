import type { ButtonProps } from './Button.types';

const variantClasses: Record<string, string> = {
  primary:
    'bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white shadow-sm',
  secondary:
    'bg-sea-500 hover:bg-sea-600 active:bg-sea-700 text-white shadow-sm',
  outline:
    'border-2 border-ocean-500 text-ocean-600 hover:bg-ocean-50 active:bg-ocean-100',
  ghost:
    'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  danger:
    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
  md: 'px-4 py-2.5 text-base rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-lg rounded-xl min-h-[52px]',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-colors duration-150
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
