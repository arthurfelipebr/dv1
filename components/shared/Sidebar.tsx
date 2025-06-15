
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../constants';

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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12M3 3v2.25M3 3l11.25 11.25" />
        </svg>
        <h1 className="text-xl font-bold text-primary-dark">{APP_NAME}</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavItem 
          to={ROUTES.DASHBOARD} 
          label="Dashboard" 
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>} 
        />
        <NavItem 
          to={ROUTES.INSPECTIONS} 
          label="Vistorias" 
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />
        <NavItem
          to={ROUTES.CALENDAR}
          label="Agenda"
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg>}
        />
        <NavItem
          to={ROUTES.REPORTS}
          label="Laudos"
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
        />
        <NavItem
          to={ROUTES.COMPARABLES}
          label="CDC"
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>}
        />
        <NavItem
          to={ROUTES.CLIENTS}
          label="Clientes"
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.602m0 6.082a9.094 9.094 0 013.741-.479m0 0a4.5 4.5 0 01-1.548-8.72m-17.556 0a4.5 4.5 0 011.548-8.72m15.908 0A18.36 18.36 0 0118 18.72m0 0V21" /></svg>}
        />
        <NavItem
          to={ROUTES.SUPER_ADMIN}
          label="Super Admin"
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 7h18M6 11h12M10 15h4M12 19h0" /></svg>}
        />
      </nav>
      <div className="p-4 mt-auto border-t border-neutral-light">
        <NavItem 
          to={ROUTES.SETTINGS} 
          label="Configurações" 
          currentPath={location.pathname}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.223 1.196-.228 1.765-.045C13.064 2.878 13.5 3.37 13.5 3.998v2.004c0 .63.432 1.195 1.036 1.403.607.207 1.267.149 1.822-.162.559-.311.85-.921.85-1.57V5.083c0-.631-.43-1.197-1.035-1.403A2.992 2.992 0 0015.5 3c-.588 0-1.157.24-1.564.636-.407.396-.636.93-.636 1.502v1.543c0 .537-.213 1.046-.593 1.427A2.001 2.001 0 0112 8.25c-.537 0-1.046-.213-1.427-.593-.38-.381-.593-.89-.593-1.427v-1.543c0-.571-.23-1.106-.637-1.502A2.435 2.435 0 007.5 3c-.588 0-1.156.24-1.563.636A2.432 2.432 0 005 5.138v.928c0 .65.292 1.26.852 1.57.554.312 1.214.37 1.822.162.607-.208 1.036-.774 1.036-1.404V4.028c0-.628.436-1.12.998-1.226zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>
    </div>
  );
};

export default Sidebar;