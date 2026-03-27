import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { retrievalsRepo } from '@/services/db/retrievals';
import { deploymentsRepo } from '@/services/db/deployments';
import { syncManager } from '@/services/sync/SyncManager';
import { calculateDwellTime } from '@/services/calculations/duration';
import type { Retrieval, SpeciesCatch, BycatchEntry } from '@/types';
import type { CatchItem } from '@/components/common/CatchCounter/CatchCounter.types';

export interface RetrievalFormData {
  retrieval_time: string;
  latitude: string;
  longitude: string;
  hook_count_retrieved: number;
  hook_with_catch: number;
  catches: CatchItem[];
  bycatches: BycatchItem[];
  memo: string;
}

export interface BycatchItem {
  id: string;
  species: string;
  count: number;
  action: 'released' | 'kept' | 'discarded';
}

const createInitialData = (): RetrievalFormData => ({
  retrieval_time: new Date().toTimeString().slice(0, 5),
  latitude: '',
  longitude: '',
  hook_count_retrieved: 0,
  hook_with_catch: 0,
  catches: [],
  bycatches: [],
  memo: '',
});

export type RetrievalErrors = Partial<Record<keyof RetrievalFormData, string>>;

export const useRetrievalForm = () => {
  const navigate = useNavigate();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const [data, setData] = useState<RetrievalFormData>(createInitialData);
  const [errors, setErrors] = useState<RetrievalErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deploymentTime, setDeploymentTime] = useState('');
  const [lineNumber, setLineNumber] = useState(0);

  // Load deployment info
  useEffect(() => {
    if (!deploymentId) return;
    (async () => {
      const deployment = await deploymentsRepo.getById(deploymentId);
      if (deployment) {
        setDeploymentTime(deployment.deployment_time);
        setLineNumber(deployment.line_number);
        setData((d) => ({
          ...d,
          hook_count_retrieved: deployment.hook_count,
          latitude: deployment.position.latitude ? String(deployment.position.latitude) : '',
          longitude: deployment.position.longitude ? String(deployment.position.longitude) : '',
        }));
      }

      // Try GPS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setData((d) => ({
              ...d,
              latitude: pos.coords.latitude.toFixed(4),
              longitude: pos.coords.longitude.toFixed(4),
            }));
          },
          () => {},
        );
      }
    })();
  }, [deploymentId]);

  const handleChange = useCallback(
    <K extends keyof RetrievalFormData>(field: K, value: RetrievalFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const e: RetrievalErrors = {};

    if (!data.retrieval_time) e.retrieval_time = '揚縄時刻は必須です';
    if (data.catches.length === 0) e.catches = '漁獲を1件以上追加してください';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [data]);

  const save = useCallback(async () => {
    if (!validate() || !deploymentId) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();

      const speciesCatches: SpeciesCatch[] = data.catches
        .filter((c) => c.species)
        .map((c) => ({
          species: c.species,
          count: c.count,
          weight_kg: c.weight_kg,
          size_distribution: { small: 0, medium: 0, large: 0, extra_large: 0 },
        }));

      const bycatch: BycatchEntry[] = data.bycatches
        .filter((b) => b.species)
        .map((b) => ({
          species: b.species,
          count: b.count,
          action: b.action,
        }));

      const hookRate =
        data.hook_count_retrieved > 0
          ? Math.round((data.hook_with_catch / data.hook_count_retrieved) * 100)
          : 0;

      const dwellMinutes = deploymentTime
        ? calculateDwellTime(deploymentTime, data.retrieval_time)
        : 0;

      const retrieval: Retrieval = {
        id: crypto.randomUUID(),
        deployment_id: deploymentId,
        retrieval_time: data.retrieval_time,
        position: {
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0,
        },
        hook_count_retrieved: data.hook_count_retrieved,
        hook_with_catch: data.hook_with_catch,
        hook_rate: hookRate,
        dwell_time_minutes: dwellMinutes,
        species_catches: speciesCatches,
        bycatch,
        memo: data.memo,
        sync_status: 'pending',
        created_at: now,
        updated_at: now,
      };

      await retrievalsRepo.create(retrieval);
      await syncManager.enqueue('retrieval', retrieval, 3);
      setSaveSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }, [data, validate, navigate, deploymentId, deploymentTime]);

  return {
    data,
    errors,
    isSaving,
    saveSuccess,
    lineNumber,
    deploymentTime,
    deploymentId,
    handleChange,
    save,
  };
};
