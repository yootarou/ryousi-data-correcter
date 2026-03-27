import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DeparturePage = lazy(() => import('@/pages/DeparturePage'));
const DeploymentPage = lazy(() => import('@/pages/DeploymentPage'));
const RetrievalPage = lazy(() => import('@/pages/RetrievalPage'));
const ReturnPage = lazy(() => import('@/pages/ReturnPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const RoutePage = lazy(() => import('@/pages/RoutePage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const ComponentsPage = lazy(() => import('@/pages/ComponentsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/departure" element={<DeparturePage />} />
              <Route path="/deployment/:recordId" element={<DeploymentPage />} />
              <Route path="/retrieval/:deploymentId" element={<RetrievalPage />} />
              <Route path="/return/:recordId" element={<ReturnPage />} />
              <Route path="/route/:recordId" element={<RoutePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/components" element={<ComponentsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
