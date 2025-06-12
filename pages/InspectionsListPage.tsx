
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Inspection, InspectionStatus } from '../types';
import { getInspections } from '../services/inspectionService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ROUTES } from '../constants';

const InspectionsListPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInspections();
        setInspections(data.sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()));
      } catch (err) {
        console.error("Failed to fetch inspections:", err);
        setError(`Falha ao carregar vistorias: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, []);

  const getStatusBadgeStyle = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case InspectionStatus.REPORT_PENDING: return 'bg-yellow-100 text-yellow-800';
      case InspectionStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case InspectionStatus.SCHEDULED: return 'bg-cyan-100 text-cyan-800';
      case InspectionStatus.REQUESTED: return 'bg-gray-100 text-gray-800';
      case InspectionStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-neutral-dark">Lista de Vistorias</h1>
        <button
          onClick={() => navigate(ROUTES.NEW_INSPECTION)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Vistoria
        </button>
      </div>

      {inspections.length === 0 ? (
        <p className="text-neutral text-center py-8">Nenhuma vistoria encontrada.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead className="bg-neutral-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Endereço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Data Agendada</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {inspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-neutral-light/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-dark">{inspection.propertyType}</div>
                    <div className="text-sm text-neutral">{inspection.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{inspection.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {new Date(inspection.scheduledDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(inspection.status)}`}>
                      {inspection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`${ROUTES.INSPECTIONS}/${inspection.id}`} className="text-primary hover:text-primary-dark hover:underline">
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InspectionsListPage;
    