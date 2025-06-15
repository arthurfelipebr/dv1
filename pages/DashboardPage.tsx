import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, Users } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { Inspection, InspectionStatus, Task, TaskStatus, Client } from '../types';
import { getInspections } from '../services/inspectionService';
import { getClients } from '../services/clientService'; // Import client service
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ROUTES } from '../constants';

const DashboardPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [inspectionsData, clientsData] = await Promise.all([
          getInspections(),
          getClients()
        ]);
        setInspections(inspectionsData);
        setClients(clientsData);

        const allTasks: Task[] = inspectionsData.reduce((acc, inspection) => {
          if (inspection.tasks) {
            // Add inspection address to each task for better context
            const tasksWithAddress = inspection.tasks.map(task => ({
              ...task,
              inspectionAddress: inspection.address, // Add address here
            }));
            return acc.concat(tasksWithAddress);
          }
          return acc;
        }, [] as Task[]);
        
        setPendingTasks(
          allTasks
            .filter(task => task.status === TaskStatus.PENDENTE)
            .sort((a,b) => (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .slice(0, 5) // Show top 5 pending tasks
        );

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(`Falha ao carregar dados do dashboard: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }
  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;


  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(insp => insp.status === InspectionStatus.COMPLETED).length;
  const pendingInspectionsCount = inspections.filter(insp => insp.status !== InspectionStatus.COMPLETED && insp.status !== InspectionStatus.CANCELLED).length;
  const totalClients = clients.length;

  const inspectionsByStatusData = Object.values(InspectionStatus).map(status => ({
    name: status,
    count: inspections.filter(i => i.status === status).length,
  }));
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-neutral-dark">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Vistorias"
          value={totalInspections}
          icon={<ClipboardList className="w-6 h-6" />}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Vistorias Concluídas"
          value={completedInspections}
          icon={<CheckCircle className="w-6 h-6" />}
          colorClass="bg-green-500"
        />
        <StatCard
          title="Vistorias Pendentes"
          value={pendingInspectionsCount}
          icon={<Clock className="w-6 h-6" />}
          colorClass="bg-yellow-500"
        />
        <StatCard
          title="Total de Clientes"
          value={totalClients}
          icon={<Users className="w-6 h-6" />}
          colorClass="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-neutral-dark mb-4">Vistorias por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByStatusData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#06b6d4" name="Número de Vistorias"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-neutral-dark mb-4">Próximas Tarefas Pendentes</h2>
          {pendingTasks.length > 0 ? (
            <ul className="space-y-3">
              {pendingTasks.map(task => (
                <li key={task.id} className="p-3 bg-yellow-50 rounded-md hover:shadow-sm transition-shadow">
                  <Link to={ROUTES.INSPECTION_DETAIL.replace(':id', task.inspectionId)} className="block">
                    <p className="text-sm font-medium text-yellow-700">{task.description}</p>
                    <p className="text-xs text-neutral-500">
                      Vistoria: {task.inspectionAddress || 'N/A'}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-red-500">
                        Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral">Nenhuma tarefa pendente no momento. Bom trabalho!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;