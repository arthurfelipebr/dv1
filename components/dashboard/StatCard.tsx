
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string; // e.g., 'bg-blue-500', 'text-green-500'
  trend?: string; // e.g., '+5% vs last month'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'bg-primary', trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral font-medium">{title}</p>
        <p className="text-2xl font-semibold text-neutral-dark">{value}</p>
        {trend && <p className="text-xs text-neutral">{trend}</p>}
      </div>
    </div>
  );
};

export default StatCard;
    