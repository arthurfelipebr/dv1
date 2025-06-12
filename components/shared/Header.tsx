
import React from 'react';

// Placeholder for user data, eventually from context or auth service
const mockUser = {
  name: "Eng. Responsável",
  avatarUrl: "https://picsum.photos/seed/useravatar/100/100"
};

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <div>
        {/* Breadcrumbs or Page Title can go here */}
        <h2 className="text-lg font-semibold text-neutral-dark">Visão Geral</h2> 
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-neutral-dark hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <img src={mockUser.avatarUrl} alt={mockUser.name} className="w-10 h-10 rounded-full object-cover" />
          <span className="text-sm font-medium text-neutral-dark">{mockUser.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
    