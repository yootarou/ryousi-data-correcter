import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';
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
  const [businessError, setBusinessError] = useState<string | null>(null);
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
      if (businessError) {
        setBusinessError(null);
      }
    },
    [errors, businessError],
  );

  const validate = useCallback(async (): Promise<boolean> => {
    const e: ReturnErrors = {};

    if (!data.fishing_end_time) e.fishing_end_time = '帰港時刻は必須です';
    if (!data.return_port.trim()) e.return_port = '帰港地は必須です';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      return false;
    }

    if (!recordId) {
      return false;
    }

    const [deployments, retrievals] = await Promise.all([
      deploymentsRepo.getByRecordId(recordId),
      retrievalsRepo.getByRecordId(recordId),
    ]);

    if (deployments.length === 0) {
      setBusinessError('まだ投縄記録が登録されていません');
      return false;
    }

    const retrievedDeploymentIds = new Set(retrievals.map((retrieval) => retrieval.deployment_id));
    const hasUnretrievedDeployment = deployments.some(
      (deployment) => !retrievedDeploymentIds.has(deployment.id),
    );

    if (hasUnretrievedDeployment) {
      setBusinessError('未回収の投縄があります（回収記録を登録してください）');
      return false;
    }

    setBusinessError(null);
    return true;
  }, [data, recordId]);

  const save = useCallback(async () => {
    if (!recordId) return;
    if (!(await validate())) return;

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
    businessError,
    vesselName,
    departureTime,
    departurePort,
    recordId,
    handleChange,
    save,
  };
};
