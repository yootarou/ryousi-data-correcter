export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  error?: string;
  required?: boolean;
  className?: string;
}
