export interface CatchItem {
  id: string;
  species: string;
  count: number;
  weight_kg: number;
}

export interface CatchCounterProps {
  label: string;
  items: CatchItem[];
  onChange: (items: CatchItem[]) => void;
  speciesOptions: string[];
  error?: string;
  className?: string;
}
