import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/shared/Layout';
import DashboardPage from './pages/DashboardPage';
import InspectionsListPage from './pages/InspectionsListPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import NewInspectionPage from './pages/NewInspectionPage';
import ReportsPage from './pages/ReportsPage';
import ClientsPage from './pages/ClientsPage';
import NewClientPage from './pages/NewClientPage'; // New Page for creating clients
import ClientDetailPage from './pages/ClientDetailPage'; // New Page for client details
import ComparablesPage from './pages/ComparablesPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import { ROUTES } from './constants';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          
          <Route path={ROUTES.INSPECTIONS} element={<InspectionsListPage />} />
          <Route path={ROUTES.INSPECTION_DETAIL} element={<InspectionDetailPage />} />
          <Route path={ROUTES.NEW_INSPECTION} element={<NewInspectionPage />} />
          
          <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
          <Route path={ROUTES.NEW_CLIENT} element={<NewClientPage />} />
          <Route path={ROUTES.CLIENT_DETAIL} element={<ClientDetailPage />} />

          <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.COMPARABLES} element={<ComparablesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
