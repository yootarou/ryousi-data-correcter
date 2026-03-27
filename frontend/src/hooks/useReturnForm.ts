import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { syncManager } from '@/services/sync/SyncManager';
import type { ReturnData } from '@/types';

const createInitialData = (): ReturnData => ({
  fishing_end_time: new Date().toTimeString().slice(0, 5),
  return_port: '',
  total_catch_kg: 0,
  total_revenue: 0,
  fuel_used: 0,
  ice_cost: 0,
  bait_cost: 0,
  other_cost: 0,
  memo: '',
  trouble: '',
});

export type ReturnErrors = Partial<Record<keyof ReturnData, string>>;

export const useReturnForm = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const [data, setData] = useState<ReturnData>(createInitialData);
  const [errors, setErrors] = useState<ReturnErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [vesselName, setVesselName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [departurePort, setDeparturePort] = useState('');

  // Load record info for smart defaults
  useEffect(() => {
    if (!recordId) return;
    (async () => {
      const record = await fishingRecordsRepo.getById(recordId);
      if (record) {
        setVesselName(record.vessel_name);
        setDepartureTime(record.departure.fishing_start_time);
        setDeparturePort(record.departure.departure_port);
        setData((d) => ({
          ...d,
          return_port: record.departure.departure_port,
          fuel_used: record.departure.fuel_cost,
        }));
      }
    })();
  }, [recordId]);

  const handleChange = useCallback(
    <K extends keyof ReturnData>(field: K, value: ReturnData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const e: ReturnErrors = {};

    if (!data.fishing_end_time) e.fishing_end_time = '帰港時刻は必須です';
    if (!data.return_port.trim()) e.return_port = '帰港地は必須です';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [data]);

  const save = useCallback(async () => {
    if (!validate() || !recordId) return;

    setIsSaving(true);
    try {
      await fishingRecordsRepo.update(recordId, {
        return: data,
        sync_status: 'pending',
        updated_at: new Date().toISOString(),
      });
      const record = await fishingRecordsRepo.getById(recordId);
      if (record) {
        await syncManager.enqueue('fishing_record', record, 1);
      }
      setSaveSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }, [data, validate, navigate, recordId]);

  return {
    data,
    errors,
    isSaving,
    saveSuccess,
    vesselName,
    departureTime,
    departurePort,
    recordId,
    handleChange,
    save,
  };
};
