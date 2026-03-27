import { RetrievalForm } from '@/components/features/retrieval';
import { useRetrievalForm } from '@/hooks/useRetrievalForm';
import { Link } from 'react-router-dom';

const RetrievalPage = () => {
  const {
    data,
    errors,
    isSaving,
    saveSuccess,
    lineNumber,
    deploymentTime,
    deploymentId,
    handleChange,
    save,
  } = useRetrievalForm();

  if (!deploymentId) {
    return (
      <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
        <h1 className="mb-4">揚縄記録</h1>
        <div className="card text-center">
          <p className="text-gray-500 mb-3">投縄記録が見つかりません</p>
          <Link to="/" className="text-ocean-600 font-semibold">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1 className="mb-4">揚縄記録</h1>
      <RetrievalForm
        data={data}
        errors={errors}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        lineNumber={lineNumber}
        deploymentTime={deploymentTime}
        onChange={handleChange}
        onSubmit={save}
      />
    </div>
  );
};

export default RetrievalPage;
