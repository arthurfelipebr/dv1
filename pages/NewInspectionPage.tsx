
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inspection, InspectionStatus, Client } from '../types'; // Assuming InspectionStatus is defined for initial status
import { createInspection } from '../services/inspectionService';
import { getClients } from '../services/clientService';
import { ROUTES, CHECKLIST_PRESETS } from '../constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NewInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [clientId, setClientId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [presetId, setPresetId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients', err);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!address || !propertyType || !clientId || !scheduledDate) {
      setError("Por favor, preencha todos os campos obrigatórios: Endereço, Tipo de Imóvel, Cliente e Data Agendada.");
      setIsLoading(false);
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const newInspectionData: Omit<Inspection, 'id' | 'photos' | 'checklist' | 'status' | 'tasks' | 'externalReports'> & { presetName: string } = {
      address,
      propertyType,
      clientName: selectedClient ? selectedClient.name : '',
      scheduledDate: new Date(scheduledDate),
      reportNotes,
      presetName: presetId,
      // inspectorName will be assigned later or based on user
    };

    try {
      const createdInspection = await createInspection(newInspectionData);
      setIsLoading(false);
      navigate(`${ROUTES.INSPECTIONS}/${createdInspection.id}`);
    } catch (err) {
      console.error("Failed to create inspection:", err);
      setError(`Falha ao criar vistoria: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-neutral-dark mb-6">Nova Vistoria</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-dark">
            Endereço Completo *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-neutral-dark">
            Modelo de Checklist
          </label>
          <select
            name="preset"
            id="preset"
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {Object.entries(CHECKLIST_PRESETS).map(([id, preset]) => (
              <option key={id} value={id}>{preset.name}</option>
            ))}
          </select>
        </div>


        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-neutral-dark">
            Tipo de Imóvel *
          </label>
          <input
            type="text"
            name="propertyType"
            id="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            required
            placeholder="Ex: Apartamento, Casa Térrea, Galpão Industrial"
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-neutral-dark">
            Nome do Cliente/Empresa *
          </label>
          {clientsLoading ? (
            <p className="text-sm text-neutral">Carregando clientes...</p>
          ) : (
            <select
              name="clientId"
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-neutral-dark">
            Data Agendada *
          </label>
          <input
            type="datetime-local"
            name="scheduledDate"
            id="scheduledDate"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="reportNotes" className="block text-sm font-medium text-neutral-dark">
            Observações Iniciais (Opcional)
          </label>
          <textarea
            id="reportNotes"
            name="reportNotes"
            rows={3}
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Ex: Foco em verificar estrutura, cliente solicitou urgência..."
          />
        </div>
        
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={() => navigate(ROUTES.INSPECTIONS)}
                className="px-4 py-2 border border-neutral rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral"
            >
                {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : 'Criar Vistoria'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewInspectionPage;
    