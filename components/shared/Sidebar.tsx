
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../constants';
import {
  Building2,
  LayoutGrid,
  ClipboardList,
  Calendar,
  FileText,
  ListPlus,
  Users,
  Car,
  List,
  Settings as SettingsIcon,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, currentPath }) => {
  const isActive = currentPath === to || (to !== ROUTES.DASHBOARD && currentPath.startsWith(to) && to !== ROUTES.SETTINGS && to !== ROUTES.CALENDAR) || (currentPath === to);
   // More specific active state for exact matches on settings and calendar
  if (to === ROUTES.SETTINGS || to === ROUTES.CALENDAR) {
    // isActive = currentPath === to; This logic seems to be problematic. Reverted to simpler logic.
  }
   const commonPath = (path: string) => {
    if (path === ROUTES.DASHBOARD) return ROUTES.DASHBOARD;
    const parts = path.split('/');
    return `/${parts[1]}`;
  }
  const isCurrentlyActive = commonPath(currentPath) === commonPath(to);


  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                  ${isCurrentlyActive ? 'bg-primary text-white shadow-md' : 'text-neutral-dark hover:bg-primary-light hover:text-primary-dark'}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col fixed top-0 left-0 z-20">
      <div className="flex items-center justify-center h-20 border-b border-neutral-light">
        <Building2 className="w-8 h-8 text-primary mr-2" />
        <h1 className="text-xl font-bold text-primary-dark">{APP_NAME}</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavItem
          to={ROUTES.DASHBOARD}
          label="Dashboard"
          currentPath={location.pathname}
          icon={<LayoutGrid className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.INSPECTIONS}
          label="Vistorias"
          currentPath={location.pathname}
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.CALENDAR}
          label="Agenda"
          currentPath={location.pathname}
          icon={<Calendar className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.REPORTS}
          label="Laudos"
          currentPath={location.pathname}
          icon={<FileText className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.COMPARABLES}
          label="CDC"
          currentPath={location.pathname}
          icon={<ListPlus className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.COST_SIMULATOR}
          label="Deslocamento"
          currentPath={location.pathname}
          icon={<Car className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.CLIENTS}
          label="Clientes"
          currentPath={location.pathname}
          icon={<Users className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.SUPER_ADMIN}
          label="Super Admin"
          currentPath={location.pathname}
          icon={<List className="w-5 h-5" />}
        />
        <NavItem
          to={ROUTES.ADMIN_PANEL}
          label="Admin Panel"
          currentPath={location.pathname}
          icon={<LayoutGrid className="w-5 h-5" />}
        />
      </nav>
      <div className="p-4 mt-auto border-t border-neutral-light">
        <NavItem
          to={ROUTES.SETTINGS}
          label="Configurações"
          currentPath={location.pathname}
          icon={<SettingsIcon className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};

export default Sidebar;