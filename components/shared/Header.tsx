
import React from 'react';
import { Bell } from 'lucide-react';

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
          <Bell className="w-6 h-6" />
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
    