import { TextInput } from '@/components/common/TextInput';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/common/Button';
import { calculateDwellTime, formatDuration } from '@/services/calculations/duration';
import { calculateProfit, calculateROI } from '@/services/calculations/roi';
import type { ReturnData } from '@/types';
import type { ReturnErrors } from '@/hooks/useReturnForm';

interface ReturnFormProps {
  data: ReturnData;
  errors: ReturnErrors;
  businessError?: string | null;
  isSaving: boolean;
  saveSuccess: boolean;
  vesselName: string;
  departureTime: string;
  onChange: <K extends keyof ReturnData>(field: K, value: ReturnData[K]) => void;
  onSubmit: () => void;
}

export const ReturnForm: React.FC<ReturnFormProps> = ({
  data,
  errors,
  businessError = null,
  isSaving,
  saveSuccess,
  vesselName: _vesselName,
  departureTime,
  onChange,
  onSubmit,
}) => {
  const totalCost = data.fuel_used + data.ice_cost + data.bait_cost + data.other_cost;
  const profit = calculateProfit(data.total_revenue, totalCost);
  const roi = calculateROI(data.total_revenue, totalCost);
  const operationMinutes = departureTime && data.fishing_end_time
    ? calculateDwellTime(departureTime, data.fishing_end_time)
    : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ja-JP').format(n);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {businessError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {businessError}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <FormSection title="基本情報" collapsible={false}>
        <TextInput
          label="帰港時刻"
          type="time"
          value={data.fishing_end_time}
          onChange={(v) => onChange('fishing_end_time', v)}
          error={errors.fishing_end_time}
          required
        />
        {departureTime && (
          <div className="p-3 bg-ocean-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">操業時間</p>
            <p className="text-lg font-semibold text-ocean-700">
              {formatDuration(operationMinutes)}
            </p>
            <p className="text-xs text-gray-400">
              出港: {departureTime} → 帰港: {data.fishing_end_time}
            </p>
          </div>
        )}
        <TextInput
          label="帰港地"
          value={data.return_port}
          onChange={(v) => onChange('return_port', v)}
          error={errors.return_port}
          placeholder="例: 焼津港"
          required
        />
      </FormSection>

      {/* Section 2: Catch Summary */}
      <FormSection title="漁獲サマリー" collapsible={false}>
        <TextInput
          label="総漁獲量"
          type="number"
          value={data.total_catch_kg || ''}
          onChange={(v) => onChange('total_catch_kg', Number(v))}
          suffix="kg"
        />
        <TextInput
          label="総売上"
          type="number"
          value={data.total_revenue || ''}
          onChange={(v) => onChange('total_revenue', Number(v))}
          suffix="円"
        />
      </FormSection>

      {/* Section 3: Costs */}
      <FormSection title="経費" defaultOpen={false}>
        <TextInput
          label="燃料費"
          type="number"
          value={data.fuel_used || ''}
          onChange={(v) => onChange('fuel_used', Number(v))}
          suffix="円"
        />
        <TextInput
          label="氷代"
          type="number"
          value={data.ice_cost || ''}
          onChange={(v) => onChange('ice_cost', Number(v))}
          suffix="円"
        />
        <TextInput
          label="餌代"
          type="number"
          value={data.bait_cost || ''}
          onChange={(v) => onChange('bait_cost', Number(v))}
          suffix="円"
        />
        <TextInput
          label="その他"
          type="number"
          value={data.other_cost || ''}
          onChange={(v) => onChange('other_cost', Number(v))}
          suffix="円"
        />
      </FormSection>

      {/* Profit Summary */}
      {(data.total_revenue > 0 || totalCost > 0) && (
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">経費合計</p>
            <p className="text-sm font-bold text-gray-700">¥{formatCurrency(totalCost)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">利益</p>
            <p className={`text-sm font-bold ${profit >= 0 ? 'text-sea-600' : 'text-red-500'}`}>
              ¥{formatCurrency(profit)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">ROI</p>
            <p className={`text-sm font-bold ${(roi ?? 0) >= 0 ? 'text-sea-600' : 'text-red-500'}`}>
              {roi !== null ? `${roi}%` : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Section 4: Notes */}
      <FormSection title="メモ・トラブル" defaultOpen={false}>
        <TextInput
          label="メモ"
          value={data.memo}
          onChange={(v) => onChange('memo', v)}
          placeholder="特記事項"
        />
        <TextInput
          label="トラブル・問題"
          value={data.trouble}
          onChange={(v) => onChange('trouble', v)}
          placeholder="機器故障、天候急変など"
        />
      </FormSection>

      {/* Submit */}
      {saveSuccess ? (
        <div className="p-4 bg-sea-50 rounded-xl text-center">
          <p className="text-sea-600 font-semibold">帰港記録を保存しました</p>
        </div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSaving}
        >
          航海を完了する
        </Button>
      )}
    </form>
  );
};
