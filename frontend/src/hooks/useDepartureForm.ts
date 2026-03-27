import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { syncManager } from '@/services/sync/SyncManager';
import { calculateMoonPhase } from '@/services/calculations/moonPhase';
import type { DepartureData, FishingRecord } from '@/types';

const createInitialData = (): DepartureData => ({
  fishing_start_time: new Date().toTimeString().slice(0, 5),
  crew: [],
  target_species: [],
  vessel_name: '',
  departure_port: '',
  target_area: '',
  hook_count: 0,
  line_count: 0,
  bait_type: [],
  moon_phase: calculateMoonPhase(new Date().toISOString().slice(0, 10)),
  weather: '',
  fuel_cost: 0,
});

export type DepartureErrors = Partial<Record<keyof DepartureData, string>>;

export const useDepartureForm = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DepartureData>(createInitialData);
  const [errors, setErrors] = useState<DepartureErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load previous record for smart defaults
  useEffect(() => {
    (async () => {
      const recent = await fishingRecordsRepo.getRecent(1);
      if (recent.length > 0) {
        const prev = recent[0].departure;
        setData((d) => ({
          ...d,
          vessel_name: prev.vessel_name,
          departure_port: prev.departure_port,
          crew: prev.crew,
          target_area: prev.target_area,
        }));
      }
    })();
  }, []);

  const handleChange = useCallback(
    <K extends keyof DepartureData>(field: K, value: DepartureData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const e: DepartureErrors = {};

    if (!data.fishing_start_time) e.fishing_start_time = '出港時刻は必須です';
    if (!data.vessel_name.trim()) e.vessel_name = '船名は必須です';
    if (!data.departure_port.trim()) e.departure_port = '出港地は必須です';
    if (data.crew.length === 0) e.crew = '乗組員を1人以上選択してください';
    if (data.target_species.length === 0) e.target_species = '対象魚種を1つ以上選択してください';
    if (!data.weather) e.weather = '天候を選択してください';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [data]);

  const save = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();
      const activeRecord = await fishingRecordsRepo.getActiveByDate(today);

      if (activeRecord) {
        const updatedRecord: FishingRecord = {
          ...activeRecord,
          vessel_name: data.vessel_name,
          departure: data,
          sync_status: 'pending',
          updated_at: now,
        };
        await fishingRecordsRepo.update(activeRecord.id, {
          vessel_name: data.vessel_name,
          departure: data,
          sync_status: 'pending',
          updated_at: now,
        });
        await syncManager.enqueue('fishing_record', updatedRecord, 1);
      } else {
        const record: FishingRecord = {
          id: crypto.randomUUID(),
          user_id: 'default-user',
          date: today,
          vessel_name: data.vessel_name,
          departure: data,
          sync_status: 'pending',
          created_at: now,
          updated_at: now,
        };
        await fishingRecordsRepo.create(record);
        await syncManager.enqueue('fishing_record', record, 1);
      }
      setSaveSuccess(true);

      setTimeout(() => {
        navigate('/departure?autostart=1', { replace: true });
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }, [data, validate, navigate]);

  return {
    data,
    errors,
    isSaving,
    saveSuccess,
    handleChange,
    validate,
    save,
  };
};
