import { TextInput } from '@/components/common/TextInput';
import { SelectInput } from '@/components/common/SelectInput';
import { CompassSelect } from '@/components/common/CompassSelect';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/common/Button';
import type { Direction } from '@/types/common.types';
import type { DeploymentFormData, DeploymentErrors } from '@/hooks/useDeploymentForm';

interface DeploymentFormProps {
  data: DeploymentFormData;
  errors: DeploymentErrors;
  isSaving: boolean;
  saveSuccess: boolean;
  lineNumber: number;
  onChange: <K extends keyof DeploymentFormData>(field: K, value: DeploymentFormData[K]) => void;
  onSubmit: () => void;
}

const BAIT_OPTIONS = [
  { value: 'サンマ', label: 'サンマ' },
  { value: 'イワシ', label: 'イワシ' },
  { value: 'サバ', label: 'サバ' },
  { value: 'イカ', label: 'イカ' },
  { value: '人工餌', label: '人工餌' },
];

const VISIBILITY_OPTIONS = [
  { value: '良好', label: '良好' },
  { value: '普通', label: '普通' },
  { value: '不良', label: '不良' },
  { value: '霧', label: '霧' },
];

const TIDE_OPTIONS = [
  { value: '大潮', label: '大潮' },
  { value: '中潮', label: '中潮' },
  { value: '小潮', label: '小潮' },
  { value: '長潮', label: '長潮' },
  { value: '若潮', label: '若潮' },
];

const FISH_FINDER_OPTIONS = [
  { value: '反応あり（大）', label: '反応あり（大）' },
  { value: '反応あり（中）', label: '反応あり（中）' },
  { value: '反応あり（小）', label: '反応あり（小）' },
  { value: '反応なし', label: '反応なし' },
];

const BIRD_OPTIONS = [
  { value: '群れあり', label: '群れあり' },
  { value: '少数', label: '少数' },
  { value: 'なし', label: 'なし' },
];

export const DeploymentForm: React.FC<DeploymentFormProps> = ({
  data,
  errors,
  isSaving,
  saveSuccess,
  lineNumber,
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
      {/* Line number badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ocean-600 text-white font-bold text-sm">
          {lineNumber}
        </span>
        <span className="text-sm text-gray-500">本目の縄</span>
      </div>

      {/* Section 1: Basic Info */}
      <FormSection title="基本情報" collapsible={false}>
        <TextInput
          label="投縄時刻"
          type="time"
          value={data.deployment_time}
          onChange={(v) => onChange('deployment_time', v)}
          error={errors.deployment_time}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="緯度"
            type="number"
            value={data.latitude}
            onChange={(v) => onChange('latitude', v)}
            placeholder="34.1234"
            hint="GPS自動取得"
          />
          <TextInput
            label="経度"
            type="number"
            value={data.longitude}
            onChange={(v) => onChange('longitude', v)}
            placeholder="138.5678"
          />
        </div>
        <TextInput
          label="水深"
          type="number"
          value={data.depth || ''}
          onChange={(v) => onChange('depth', Number(v))}
          suffix="m"
        />
      </FormSection>

      {/* Section 2: Gear Setup */}
      <FormSection title="仕掛け" collapsible={false}>
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="針数"
            type="number"
            value={data.hook_count || ''}
            onChange={(v) => onChange('hook_count', Number(v))}
            suffix="本"
          />
          <TextInput
            label="針間隔"
            type="number"
            value={data.hook_interval || ''}
            onChange={(v) => onChange('hook_interval', Number(v))}
            suffix="m"
          />
        </div>
        <TextInput
          label="縄の長さ"
          type="number"
          value={data.line_length || ''}
          onChange={(v) => onChange('line_length', Number(v))}
          suffix="m"
        />
        <SelectInput
          label="餌の種類"
          value={data.bait_type}
          onChange={(v) => onChange('bait_type', v)}
          options={BAIT_OPTIONS}
          error={errors.bait_type}
          required
        />
      </FormSection>

      {/* Section 3: Ocean Conditions */}
      <FormSection title="海況" defaultOpen={false}>
        <TextInput
          label="水温"
          type="number"
          value={data.water_temp || ''}
          onChange={(v) => onChange('water_temp', Number(v))}
          suffix="℃"
        />
        <CompassSelect
          label="潮流方向"
          value={data.current_direction as Direction}
          onChange={(v) => onChange('current_direction', v)}
        />
        <TextInput
          label="潮流速度"
          type="number"
          value={data.current_speed || ''}
          onChange={(v) => onChange('current_speed', Number(v))}
          suffix="kt"
        />
        <TextInput
          label="波高"
          type="number"
          value={data.wave_height || ''}
          onChange={(v) => onChange('wave_height', Number(v))}
          suffix="m"
        />
        <SelectInput
          label="視界"
          value={data.visibility}
          onChange={(v) => onChange('visibility', v)}
          options={VISIBILITY_OPTIONS}
        />
        <SelectInput
          label="潮汐"
          value={data.tide_phase}
          onChange={(v) => onChange('tide_phase', v)}
          options={TIDE_OPTIONS}
        />
      </FormSection>

      {/* Section 4: Wind */}
      <FormSection title="風況" defaultOpen={false}>
        <CompassSelect
          label="風向"
          value={data.wind_direction as Direction}
          onChange={(v) => onChange('wind_direction', v)}
        />
        <TextInput
          label="風速"
          type="number"
          value={data.wind_speed || ''}
          onChange={(v) => onChange('wind_speed', Number(v))}
          suffix="m/s"
        />
      </FormSection>

      {/* Section 5: Observations */}
      <FormSection title="観察" defaultOpen={false}>
        <SelectInput
          label="魚探反応"
          value={data.fish_finder_reaction}
          onChange={(v) => onChange('fish_finder_reaction', v)}
          options={FISH_FINDER_OPTIONS}
        />
        <SelectInput
          label="鳥の活動"
          value={data.bird_activity}
          onChange={(v) => onChange('bird_activity', v)}
          options={BIRD_OPTIONS}
        />
        <TextInput
          label="メモ"
          value={data.memo}
          onChange={(v) => onChange('memo', v)}
          placeholder="特記事項があれば入力"
        />
      </FormSection>

      {/* Submit */}
      {saveSuccess ? (
        <div className="p-4 bg-sea-50 rounded-xl text-center">
          <p className="text-sea-600 font-semibold">投縄記録を保存しました</p>
        </div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSaving}
        >
          投縄記録を保存
        </Button>
      )}
    </form>
  );
};
