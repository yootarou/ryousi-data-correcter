import { TextInput } from '@/components/common/TextInput';
import { SelectInput } from '@/components/common/SelectInput';
import { CatchCounter } from '@/components/common/CatchCounter';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/common/Button';
import { formatDuration } from '@/services/calculations/duration';
import { calculateDwellTime } from '@/services/calculations/duration';
import type { RetrievalFormData, RetrievalErrors, BycatchItem } from '@/hooks/useRetrievalForm';

interface RetrievalFormProps {
  data: RetrievalFormData;
  errors: RetrievalErrors;
  isSaving: boolean;
  saveSuccess: boolean;
  lineNumber: number;
  deploymentTime: string;
  onChange: <K extends keyof RetrievalFormData>(field: K, value: RetrievalFormData[K]) => void;
  onSubmit: () => void;
}

const SPECIES_OPTIONS = [
  'マグロ', 'カツオ', 'ブリ', 'タイ', 'ヒラメ', 'イカ', 'サバ', 'アジ',
];

const BYCATCH_SPECIES = [
  'サメ', 'エイ', 'フグ', 'ウミガメ', 'その他',
];

const BYCATCH_ACTION_OPTIONS = [
  { value: 'released', label: 'リリース' },
  { value: 'kept', label: '保持' },
  { value: 'discarded', label: '廃棄' },
];

export const RetrievalForm: React.FC<RetrievalFormProps> = ({
  data,
  errors,
  isSaving,
  saveSuccess,
  lineNumber,
  deploymentTime,
  onChange,
  onSubmit,
}) => {
  const dwellMinutes = deploymentTime && data.retrieval_time
    ? calculateDwellTime(deploymentTime, data.retrieval_time)
    : 0;

  const hookRate = data.hook_count_retrieved > 0
    ? Math.round((data.hook_with_catch / data.hook_count_retrieved) * 100)
    : 0;

  const addBycatch = () => {
    const item: BycatchItem = {
      id: crypto.randomUUID(),
      species: '',
      count: 0,
      action: 'released',
    };
    onChange('bycatches', [...data.bycatches, item]);
  };

  const removeBycatch = (id: string) => {
    onChange('bycatches', data.bycatches.filter((b) => b.id !== id));
  };

  const updateBycatch = (id: string, field: keyof BycatchItem, value: string | number) => {
    onChange(
      'bycatches',
      data.bycatches.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

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
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sea-600 text-white font-bold text-sm">
          {lineNumber}
        </span>
        <span className="text-sm text-gray-500">本目の揚縄</span>
      </div>

      {/* Section 1: Basic Info */}
      <FormSection title="基本情報" collapsible={false}>
        <TextInput
          label="揚縄時刻"
          type="time"
          value={data.retrieval_time}
          onChange={(v) => onChange('retrieval_time', v)}
          error={errors.retrieval_time}
          required
        />
        {deploymentTime && (
          <div className="p-3 bg-ocean-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">投縄からの経過時間</p>
            <p className="text-lg font-semibold text-ocean-700">
              {formatDuration(dwellMinutes)}
            </p>
            <p className="text-xs text-gray-400">
              投縄: {deploymentTime} → 揚縄: {data.retrieval_time}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="緯度"
            type="number"
            value={data.latitude}
            onChange={(v) => onChange('latitude', v)}
            placeholder="34.1234"
          />
          <TextInput
            label="経度"
            type="number"
            value={data.longitude}
            onChange={(v) => onChange('longitude', v)}
            placeholder="138.5678"
          />
        </div>
      </FormSection>

      {/* Section 2: Hook Stats */}
      <FormSection title="針の状況" collapsible={false}>
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="回収針数"
            type="number"
            value={data.hook_count_retrieved || ''}
            onChange={(v) => onChange('hook_count_retrieved', Number(v))}
            suffix="本"
          />
          <TextInput
            label="漁獲針数"
            type="number"
            value={data.hook_with_catch || ''}
            onChange={(v) => onChange('hook_with_catch', Number(v))}
            suffix="本"
          />
        </div>
        <div className="p-3 bg-sea-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">針掛かり率（自動計算）</p>
          <p className="text-2xl font-bold text-sea-600">{hookRate}%</p>
        </div>
      </FormSection>

      {/* Section 3: Catch */}
      <FormSection title="漁獲" collapsible={false}>
        <CatchCounter
          label="魚種別漁獲"
          items={data.catches}
          onChange={(v) => onChange('catches', v)}
          speciesOptions={SPECIES_OPTIONS}
          error={errors.catches}
        />
      </FormSection>

      {/* Section 4: Bycatch */}
      <FormSection title="外道・混獲" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">外道記録</label>
            <button
              type="button"
              onClick={addBycatch}
              className="px-3 py-1.5 text-sm font-medium text-ocean-600 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors duration-150 min-h-[36px]"
            >
              + 追加
            </button>
          </div>
          {data.bycatches.length === 0 && (
            <p className="text-sm text-gray-400 py-2">外道なし</p>
          )}
          {data.bycatches.map((b) => (
            <div
              key={b.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2"
            >
              <div className="flex items-center gap-2">
                <select
                  value={b.species}
                  onChange={(e) => updateBycatch(b.id, 'species', e.target.value)}
                  className="flex-1 px-2 py-2 text-sm rounded-lg border border-gray-300 bg-white min-h-[40px]"
                >
                  <option value="">魚種</option>
                  {BYCATCH_SPECIES.map((sp) => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={b.count || ''}
                  onChange={(e) => updateBycatch(b.id, 'count', Number(e.target.value))}
                  placeholder="匹"
                  min={0}
                  className="w-16 px-2 py-2 text-sm rounded-lg border border-gray-300 text-center min-h-[40px]"
                />
                <button
                  type="button"
                  onClick={() => removeBycatch(b.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SelectInput
                label="処理"
                value={b.action}
                onChange={(v) => updateBycatch(b.id, 'action', v)}
                options={BYCATCH_ACTION_OPTIONS}
              />
            </div>
          ))}
        </div>
      </FormSection>

      {/* Section 5: Memo */}
      <FormSection title="メモ" defaultOpen={false}>
        <TextInput
          label="特記事項"
          value={data.memo}
          onChange={(v) => onChange('memo', v)}
          placeholder="特記事項があれば入力"
        />
      </FormSection>

      {/* Submit */}
      {saveSuccess ? (
        <div className="p-4 bg-sea-50 rounded-xl text-center">
          <p className="text-sea-600 font-semibold">揚縄記録を保存しました</p>
        </div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSaving}
        >
          揚縄記録を保存
        </Button>
      )}
    </form>
  );
};
