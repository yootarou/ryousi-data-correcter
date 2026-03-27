import { Outlet } from 'react-router-dom';
import { AppBar } from '../AppBar';
import { BottomNavigation } from '../BottomNavigation';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};
