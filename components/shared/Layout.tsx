
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-neutral-light">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Adjust ml to match sidebar width */}
        <Header />
        <main className="flex-1 p-6 pt-20 overflow-y-auto"> {/* Adjust pt to match header height */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
    