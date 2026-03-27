import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deploymentsRepo } from '@/services/db/deployments';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { syncManager } from '@/services/sync/SyncManager';
import { calculateMoonPhase } from '@/services/calculations/moonPhase';
import type { Deployment } from '@/types';
import type { Direction } from '@/types/common.types';

export interface DeploymentFormData {
  deployment_time: string;
  latitude: string;
  longitude: string;
  depth: number;
  hook_count: number;
  hook_interval: number;
  line_length: number;
  bait_type: string;
  water_temp: number;
  current_direction: Direction | '';
  current_speed: number;
  wind_direction: Direction | '';
  wind_speed: number;
  wave_height: number;
  visibility: string;
  tide_phase: string;
  fish_finder_reaction: string;
  bird_activity: string;
  memo: string;
}

const createInitialData = (): DeploymentFormData => ({
  deployment_time: new Date().toTimeString().slice(0, 5),
  latitude: '',
  longitude: '',
  depth: 0,
  hook_count: 0,
  hook_interval: 0,
  line_length: 0,
  bait_type: '',
  water_temp: 0,
  current_direction: '',
  current_speed: 0,
  wind_direction: '',
  wind_speed: 0,
  wave_height: 0,
  visibility: '',
  tide_phase: '',
  fish_finder_reaction: '',
  bird_activity: '',
  memo: '',
});

export type DeploymentErrors = Partial<Record<keyof DeploymentFormData, string>>;

export const useDeploymentForm = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const [data, setData] = useState<DeploymentFormData>(createInitialData);
  const [errors, setErrors] = useState<DeploymentErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lineNumber, setLineNumber] = useState(1);
  const [vesselName, setVesselName] = useState('');

  // Load record info and next line number
  useEffect(() => {
    if (!recordId) return;
    (async () => {
      const nextNum = await deploymentsRepo.getNextLineNumber(recordId);
      setLineNumber(nextNum);

      const record = await fishingRecordsRepo.getById(recordId);
      if (record) {
        setVesselName(record.vessel_name);
        // Smart defaults from departure data
        if (record.departure.bait_type.length > 0) {
          setData((d) => ({ ...d, bait_type: record.departure.bait_type[0] }));
        }
      }

      // Try to get GPS position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setData((d) => ({
              ...d,
              latitude: pos.coords.latitude.toFixed(4),
              longitude: pos.coords.longitude.toFixed(4),
            }));
          },
          () => {
            // GPS unavailable, user enters manually
          },
        );
      }
    })();
  }, [recordId]);

  const handleChange = useCallback(
    <K extends keyof DeploymentFormData>(field: K, value: DeploymentFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const e: DeploymentErrors = {};

    if (!data.deployment_time) e.deployment_time = '投縄時刻は必須です';
    if (!data.bait_type) e.bait_type = '餌の種類を選択してください';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [data]);

  const save = useCallback(async () => {
    if (!validate() || !recordId) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      const deployment: Deployment = {
        id: crypto.randomUUID(),
        record_id: recordId,
        line_number: lineNumber,
        deployment_time: data.deployment_time,
        position: {
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0,
        },
        depth: data.depth,
        hook_count: data.hook_count,
        hook_interval: data.hook_interval,
        line_length: data.line_length,
        bait_type: data.bait_type,
        water_temp: data.water_temp,
        current_direction: (data.current_direction || 'N') as Direction,
        current_speed: data.current_speed,
        wind_direction: (data.wind_direction || 'N') as Direction,
        wind_speed: data.wind_speed,
        wave_height: data.wave_height,
        visibility: data.visibility,
        moon_phase: calculateMoonPhase(today),
        tide_phase: data.tide_phase,
        fish_finder_reaction: data.fish_finder_reaction,
        bird_activity: data.bird_activity,
        memo: data.memo,
        sync_status: 'pending',
        created_at: now,
        updated_at: now,
      };

      await deploymentsRepo.create(deployment);
      await syncManager.enqueue('deployment', deployment, 3);
      setSaveSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }, [data, validate, navigate, recordId, lineNumber]);

  return {
    data,
    errors,
    isSaving,
    saveSuccess,
    lineNumber,
    vesselName,
    recordId,
    handleChange,
    save,
  };
};
