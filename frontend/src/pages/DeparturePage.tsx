import { DepartureForm } from '@/components/features/departure';
import { useDepartureForm } from '@/hooks/useDepartureForm';

const DeparturePage = () => {
  const { data, errors, isSaving, saveSuccess, handleChange, save } = useDepartureForm();

  return (
    <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1 className="mb-4">出航記録</h1>
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
