import { TextInput } from '@/components/common/TextInput';
import { SelectInput } from '@/components/common/SelectInput';
import { MultiSelect } from '@/components/common/MultiSelect';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/common/Button';
import { getMoonPhaseName } from '@/services/calculations/moonPhase';
import type { DepartureData } from '@/types';
import type { DepartureErrors } from '@/hooks/useDepartureForm';

interface DepartureFormProps {
  data: DepartureData;
  errors: DepartureErrors;
  isSaving: boolean;
  saveSuccess: boolean;
  onChange: <K extends keyof DepartureData>(field: K, value: DepartureData[K]) => void;
  onSubmit: () => void;
}

const CREW_OPTIONS = [
  { value: '船長', label: '船長' },
  { value: '悠馬', label: '悠馬' },
  { value: 'TOMO', label: 'TOMO' },
  { value: '伊藤', label: '伊藤' },
  { value: '裕輝', label: '裕輝' },
  { value: '陽太郎', label: '陽太郎' },
];

const SPECIES_OPTIONS = [
  { value: 'マグロ', label: 'マグロ' },
  { value: 'カツオ', label: 'カツオ' },
  { value: 'ブリ', label: 'ブリ' },
  { value: 'タイ', label: 'タイ' },
  { value: 'ヒラメ', label: 'ヒラメ' },
  { value: 'イカ', label: 'イカ' },
  { value: 'サバ', label: 'サバ' },
  { value: 'アジ', label: 'アジ' },
];

const BAIT_OPTIONS = [
  { value: 'サンマ', label: 'サンマ' },
  { value: 'イワシ', label: 'イワシ' },
  { value: 'サバ', label: 'サバ' },
  { value: 'イカ', label: 'イカ' },
  { value: '人工餌', label: '人工餌' },
];

const WEATHER_OPTIONS = [
  { value: '晴れ', label: '晴れ' },
  { value: '曇り', label: '曇り' },
  { value: '雨', label: '雨' },
  { value: '雪', label: '雪' },
  { value: '霧', label: '霧' },
  { value: '荒天', label: '荒天' },
];

export const DepartureForm: React.FC<DepartureFormProps> = ({
  data,
  errors,
  isSaving,
  saveSuccess,
  onChange,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {/* Section 1: Basic Info */}
      <FormSection title="基本情報" collapsible={false}>
        <TextInput
          label="出港時刻"
          type="time"
          value={data.fishing_start_time}
          onChange={(v) => onChange('fishing_start_time', v)}
          error={errors.fishing_start_time}
          required
        />
        <TextInput
          label="船名"
          value={data.vessel_name}
          onChange={(v) => onChange('vessel_name', v)}
          error={errors.vessel_name}
          placeholder="例: 第一漁丸"
          required
        />
        <TextInput
          label="出港地"
          value={data.departure_port}
          onChange={(v) => onChange('departure_port', v)}
          error={errors.departure_port}
          placeholder="例: 焼津港"
          required
        />
        <MultiSelect
          label="乗組員"
          value={data.crew}
          onChange={(v) => onChange('crew', v)}
          options={CREW_OPTIONS}
          error={errors.crew}
          required
        />
      </FormSection>

      {/* Section 2: Fishing Plan */}
      <FormSection title="漁の計画" collapsible={false}>
        <MultiSelect
          label="対象魚種"
          value={data.target_species}
          onChange={(v) => onChange('target_species', v)}
          options={SPECIES_OPTIONS}
          error={errors.target_species}
          required
        />
        <TextInput
          label="漁場"
          value={data.target_area}
          onChange={(v) => onChange('target_area', v)}
          placeholder="例: 駿河湾沖"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="針数"
            type="number"
            value={data.hook_count || ''}
            onChange={(v) => onChange('hook_count', Number(v))}
            suffix="本"
          />
          <TextInput
            label="縄数"
            type="number"
            value={data.line_count || ''}
            onChange={(v) => onChange('line_count', Number(v))}
            suffix="本"
          />
        </div>
        <MultiSelect
          label="餌の種類"
          value={data.bait_type}
          onChange={(v) => onChange('bait_type', v)}
          options={BAIT_OPTIONS}
        />
      </FormSection>

      {/* Section 3: Environment */}
      <FormSection title="環境・潮汐" defaultOpen={false}>
        <SelectInput
          label="天候"
          value={data.weather}
          onChange={(v) => onChange('weather', v)}
          options={WEATHER_OPTIONS}
          error={errors.weather}
          required
        />
        <div className="p-3 bg-ocean-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">月齢（自動計算）</p>
          <p className="text-lg font-semibold text-ocean-700">
            {data.moon_phase}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {getMoonPhaseName(data.moon_phase)}
            </span>
          </p>
        </div>
      </FormSection>

      {/* Section 4: Cost */}
      <FormSection title="コスト" defaultOpen={false}>
        <TextInput
          label="燃料費"
          type="number"
          value={data.fuel_cost || ''}
          onChange={(v) => onChange('fuel_cost', Number(v))}
          suffix="円"
          placeholder="0"
        />
      </FormSection>

      {/* Submit */}
      {saveSuccess ? (
        <div className="p-4 bg-sea-50 rounded-xl text-center">
          <p className="text-sea-600 font-semibold">記録を保存しました</p>
        </div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSaving}
        >
          出航完了
        </Button>
      )}
    </form>
  );
};
