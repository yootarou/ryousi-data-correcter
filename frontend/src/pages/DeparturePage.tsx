import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DepartureForm } from '@/components/features/departure';
import { useDepartureForm } from '@/hooks/useDepartureForm';
import { useTodayRecord } from '@/hooks/useFishingRecords';
import { VoyageRecordingPanel } from '@/components/features/route';
import { formatDate } from '@/utils/formatters';

const DeparturePage = () => {
  const [searchParams] = useSearchParams();
  const { data, errors, isSaving, saveSuccess, handleChange, save } = useDepartureForm();
  const { record: todayRecord, isLoading, refresh } = useTodayRecord();

  const hasActiveVoyage = Boolean(todayRecord && !todayRecord.return);
  const autostartGps = searchParams.get('autostart') === '1';

  useEffect(() => {
    if (!autostartGps) return;
    void refresh();
  }, [autostartGps, refresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] max-w-[var(--max-content-width)] mx-auto">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasActiveVoyage && todayRecord) {
    return (
      <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in pb-24">
        <div className="card bg-ocean-50 border border-ocean-100 mb-4">
          <p className="text-xs text-ocean-600 mb-1">{formatDate(todayRecord.date)}</p>
          <p className="text-sm font-semibold text-ocean-800 mb-1">
            {todayRecord.vessel_name} — {todayRecord.departure.departure_port}
          </p>
          <p className="text-xs text-ocean-600">
            出港 {todayRecord.departure.fishing_start_time} / {todayRecord.departure.target_area} /{' '}
            {todayRecord.departure.target_species.join('、')}
          </p>
        </div>

        <VoyageRecordingPanel
          key={todayRecord.id}
          recordId={todayRecord.id}
          autostartGps={autostartGps}
          showRecordContextCard={false}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1 className="mb-2">航海記録</h1>
      <p className="text-sm text-gray-600 mb-4">
        入力して保存すると、GPSがオンになり操業画面へ移動します。
      </p>
      <DepartureForm
        data={data}
        errors={errors}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onChange={handleChange}
        onSubmit={save}
      />
    </div>
  );
};

export default DeparturePage;
