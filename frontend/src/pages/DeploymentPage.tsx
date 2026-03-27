import { DeploymentForm } from '@/components/features/deployment';
import { useDeploymentForm } from '@/hooks/useDeploymentForm';
import { Link } from 'react-router-dom';

const DeploymentPage = () => {
  const {
    data,
    errors,
    isSaving,
    saveSuccess,
    lineNumber,
    vesselName,
    recordId,
    handleChange,
    save,
  } = useDeploymentForm();

  if (!recordId) {
    return (
      <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
        <h1 className="mb-4">投縄記録</h1>
        <div className="card text-center">
          <p className="text-gray-500 mb-3">操業記録が見つかりません</p>
          <Link
            to="/departure"
            className="text-ocean-600 font-semibold"
          >
            まず出航記録を作成してください
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1>投縄記録</h1>
        {vesselName && (
          <span className="text-sm text-gray-500">{vesselName}</span>
        )}
      </div>
      <DeploymentForm
        data={data}
        errors={errors}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        lineNumber={lineNumber}
        onChange={handleChange}
        onSubmit={save}
      />
    </div>
  );
};

export default DeploymentPage;
