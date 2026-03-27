import type { Direction } from '@/types';

export interface CompassSelectProps {
  label: string;
  value: Direction | '';
  onChange: (value: Direction) => void;
  error?: string;
  required?: boolean;
  className?: string;
}
