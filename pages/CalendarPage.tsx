
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Inspection } from '../types';
import { getInspections } from '../services/inspectionService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ROUTES } from '../constants';

const CalendarPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchInspectionsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInspections();
        setInspections(data);
      } catch (err) {
        console.error("Failed to fetch inspections:", err);
        setError(`Falha ao carregar vistorias: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInspectionsData();
  }, []);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 (Sun) - 6 (Sat)

  const inspectionsByDay: { [key: string]: Inspection[] } = inspections.reduce((acc, insp) => {
    const dateKey = new Date(insp.scheduledDate).toLocaleDateString('pt-BR');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(insp);
    return acc;
  }, {} as { [key: string]: Inspection[] });

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startingDay = firstDayOfMonth(currentMonth);
    const daysArray = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="border border-neutral-light/50 p-2 h-32"></div>);
    }

    // Cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('pt-BR');
      const dayInspections = inspectionsByDay[dateKey] || [];
      daysArray.push(
        <div key={day} className="border border-neutral-light/50 p-2 h-32 overflow-y-auto">
          <div className="font-semibold text-sm text-neutral-dark">{day}</div>
          {dayInspections.map(insp => (
            <Link key={insp.id} to={`${ROUTES.INSPECTIONS}/${insp.id}`} className="block mt-1 p-1 bg-primary-light hover:bg-primary text-xs text-primary-dark hover:text-white rounded truncate" title={`${insp.propertyType} - ${insp.clientName}`}>
              {insp.propertyType}
            </Link>
          ))}
        </div>
      );
    }
    return daysArray;
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-neutral-dark">Agenda de Vistorias</h1>
        <div className="flex items-center space-x-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-neutral-light">
            <ChevronLeft className="w-5 h-5 text-neutral-dark" />
          </button>
          <h2 className="text-xl font-medium text-neutral-dark w-48 text-center">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-neutral-light">
            <ChevronRight className="w-5 h-5 text-neutral-dark" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-neutral">
          <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
        </div>
        <div className="grid grid-cols-7 gap-px mt-px bg-neutral-light">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
