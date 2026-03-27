import { useParams, useSearchParams, Link } from 'react-router-dom';
import { VoyageRecordingPanel } from '@/components/features/route';

const RoutePage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const [searchParams] = useSearchParams();

  const autostartGps = searchParams.get('autostart') === '1';

  if (!recordId) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">レコードIDが指定されていません</p>
        <Link to="/" className="text-sea-600 underline mt-2 inline-block">
          ホームに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <h1>航路記録</h1>
        <Link to="/" className="text-sm text-sea-600">
          ホームに戻る
        </Link>
      </div>

      <VoyageRecordingPanel
        key={recordId}
        recordId={recordId}
        autostartGps={autostartGps}
        showRecordContextCard={true}
      />
    </div>
  );
};

export default RoutePage;
