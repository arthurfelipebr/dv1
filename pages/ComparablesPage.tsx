import React, { useEffect, useState } from 'react';
import { ComparableProperty } from '../types';
import { getComparables, searchComparables, ComparableSearchFilters } from '../services/comparableService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ComparablesPage: React.FC = () => {
  const [comparables, setComparables] = useState<ComparableProperty[]>([]);
  const [filters, setFilters] = useState<ComparableSearchFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = filters.region || filters.propertyType || filters.startDate || filters.endDate
        ? await searchComparables(filters)
        : await getComparables();
      setComparables(data);
    } catch (err) {
      setError('Falha ao carregar comparáveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-neutral-dark">Banco de Dados de Comparáveis</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="region" className="text-sm text-neutral-dark">Região</label>
          <input id="region" name="region" type="text" onChange={handleInputChange} className="border border-neutral rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="propertyType" className="text-sm text-neutral-dark">Tipo de Imóvel</label>
          <input id="propertyType" name="propertyType" type="text" onChange={handleInputChange} className="border border-neutral rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm text-neutral-dark">Data Inicial</label>
          <input id="startDate" name="startDate" type="date" onChange={handleDateChange} className="border border-neutral rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm text-neutral-dark">Data Final</label>
          <input id="endDate" name="endDate" type="date" onChange={handleDateChange} className="border border-neutral rounded px-2 py-1" />
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">Buscar</button>
      </form>

      {comparables.length === 0 ? (
        <p className="text-neutral text-center">Nenhum comparável encontrado.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase">Endereço</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase">Região</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase">Tipo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase">Data</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-dark uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {comparables.map(c => (
                <tr key={c.id} className="hover:bg-neutral-light/50">
                  <td className="px-4 py-2 text-sm text-neutral-dark">{c.address}</td>
                  <td className="px-4 py-2 text-sm text-neutral-dark">{c.region}</td>
                  <td className="px-4 py-2 text-sm text-neutral-dark">{c.propertyType}</td>
                  <td className="px-4 py-2 text-sm text-neutral-dark">{new Date(c.appraisalDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-2 text-sm text-neutral-dark">{c.appraisedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparablesPage;
