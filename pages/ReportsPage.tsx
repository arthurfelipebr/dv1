
import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Inspection, InspectionStatus } from '../types';
import { getInspections } from '../services/inspectionService';
import { generateInspectionPdf } from '../services/reportService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const ReportsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInspections();
        setInspections(data);
      } catch (err) {
        setError('Falha ao carregar laudos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-semibold text-neutral-dark">Laudos Técnicos</h1>

      {inspections.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-xl text-neutral-dark">Nenhuma vistoria cadastrada</p>
          <p className="text-neutral mt-2">Cadastre uma vistoria para gerar e visualizar laudos.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead className="bg-neutral-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Imóvel</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Data</th>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(inspection.status)}`}>{inspection.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link to={ROUTES.INSPECTION_REPORT_FORM.replace(':id', inspection.id)} className="text-primary hover:text-primary-dark">Preencher</Link>
                    <button onClick={() => generateInspectionPdf(inspection)} className="text-secondary hover:text-secondary-dark flex items-center">
                      PDF
                    </button>
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

export default ReportsPage;
    