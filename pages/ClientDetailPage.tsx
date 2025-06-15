import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Client, ClientType, Inspection, InspectionStatus, ChecklistItemStatus } from '../types';
import { getClientById, updateClient } from '../services/clientService';
import { getInspections } from '../services/inspectionService'; // To list client's inspections
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ROUTES } from '../constants';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [checklistText, setChecklistText] = useState('');

  const fetchClientData = useCallback(async () => {
    if (!id) {
      setError("ID do cliente não encontrado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const clientData = await getClientById(id);
      if (clientData) {
        setClient(clientData);
        setFormData(clientData); // Initialize form data for editing
        if (clientData.checklistTemplate) {
          setChecklistText(clientData.checklistTemplate.map(item => item.name).join('\n'));
        } else {
          setChecklistText('');
        }
        // Fetch inspections for this client
        const allInspections = await getInspections();
        setInspections(allInspections.filter(insp => insp.clientName === clientData.name));
      } else {
        setError("Cliente não encontrado.");
      }
    } catch (err) {
      console.error("Failed to fetch client data:", err);
      setError(`Falha ao carregar dados do cliente: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !id) return;
    
    // Basic validation
    if (!formData.name || !formData.contactEmail) {
      setError("Nome do cliente e Email de contato são obrigatórios.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // Ensure we don't pass the 'id' in the updatable payload itself if service expects Omit<Client, 'id'>
      const { id: clientId, ...updatePayload } = formData;
      if (checklistText.trim().length > 0) {
        const items = checklistText.split('\n').map((name, idx) => ({
          id: `tmpl-${idx}`,
          name: name.trim(),
          status: ChecklistItemStatus.PENDING,
        }));
        (updatePayload as any).checklistTemplate = items;
      } else {
        (updatePayload as any).checklistTemplate = undefined;
      }
      const updatedClient = await updateClient(id, updatePayload as Omit<Client, 'id'>);
      if (updatedClient) {
        setClient(updatedClient);
        setIsEditing(false);
        // If client name changed, refetch inspections
        if (client.name !== updatedClient.name) {
            const allInspections = await getInspections();
            setInspections(allInspections.filter(insp => insp.clientName === updatedClient.name));
        }
      }
    } catch (err) {
      console.error("Failed to update client:", err);
      setError(`Falha ao atualizar cliente: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clientTypes: { value: ClientType; label: string }[] = [
    { value: 'INDIVIDUAL', label: 'Pessoa Física' },
    { value: 'BANK', label: 'Banco' },
    { value: 'CONSTRUCTION_COMPANY', label: 'Construtora' },
    { value: 'OTHER', label: 'Outro' },
  ];

  const getStatusBadgeStyle = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case InspectionStatus.REPORT_PENDING: return 'bg-yellow-100 text-yellow-800';
      // ... add other statuses if needed for display
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && !client) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (error && !client) return <div className="text-red-500 p-4 bg-red-100 rounded-md text-center">{error} <button onClick={() => navigate(ROUTES.CLIENTS)} className="ml-2 text-blue-500 hover:underline">Voltar para Clientes</button></div>;
  if (!client) return <div className="text-center p-4">Cliente não encontrado. <button onClick={() => navigate(ROUTES.CLIENTS)} className="ml-2 text-blue-500 hover:underline">Voltar para Clientes</button></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">{isEditing ? formData.name : client.name}</h1>
            <p className="text-neutral-dark">{isEditing ? formData.type : client.type ? clientTypes.find(ct => ct.value === client.type)?.label : 'N/A'}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => { setIsEditing(true); setFormData(client); setError(null);}}
              className="mt-2 md:mt-0 px-4 py-2 bg-secondary hover:bg-secondary-dark text-white font-semibold rounded-md shadow-sm"
            >
              Editar Cliente
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

        {isEditing ? (
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">Nome / Razão Social *</label>
              <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="cnpjCpf" className="block text-sm font-medium text-neutral-dark">CPF / CNPJ</label>
              <input type="text" name="cnpjCpf" id="cnpjCpf" value={formData.cnpjCpf || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-neutral-dark">Tipo *</label>
              <select name="type" id="type" value={formData.type || ''} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm">
                {clientTypes.map(typeOpt => <option key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-dark">Email *</label>
              <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail || ''} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-neutral-dark">Telefone</label>
              <input type="tel" name="contactPhone" id="contactPhone" value={formData.contactPhone || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-neutral-dark">Endereço</label>
              <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-dark">Observações</label>
              <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm"></textarea>
            </div>
            <div>
              <label htmlFor="checklist" className="block text-sm font-medium text-neutral-dark">Checklist Padrão (um item por linha)</label>
              <textarea id="checklist" name="checklist" value={checklistText} onChange={(e) => setChecklistText(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm" placeholder="Item A\nItem B" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => {setIsEditing(false); setError(null);}} className="px-4 py-2 border border-neutral rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-light">Cancelar</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-neutral">
                {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <p><strong className="text-neutral-dark">CPF/CNPJ:</strong> {client.cnpjCpf || 'N/A'}</p>
            <p><strong className="text-neutral-dark">Email:</strong> {client.contactEmail}</p>
            <p><strong className="text-neutral-dark">Telefone:</strong> {client.contactPhone || 'N/A'}</p>
            <p className="md:col-span-2"><strong className="text-neutral-dark">Endereço:</strong> {client.address || 'N/A'}</p>
            {client.notes && <p className="md:col-span-2"><strong className="text-neutral-dark">Observações:</strong> <span className="whitespace-pre-wrap">{client.notes}</span></p>}
            {client.checklistTemplate && client.checklistTemplate.length > 0 && (
              <div className="md:col-span-2">
                <strong className="text-neutral-dark">Checklist Padrão:</strong>
                <ul className="list-disc list-inside text-neutral-dark">
                  {client.checklistTemplate.map(item => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-neutral-dark mb-4">Vistorias Associadas</h2>
        {isLoading && inspections.length === 0 && <LoadingSpinner />}
        {!isLoading && inspections.length === 0 && (
          <p className="text-neutral">Nenhuma vistoria encontrada para este cliente.</p>
        )}
        {inspections.length > 0 && (
          <ul className="divide-y divide-neutral-light">
            {inspections.map(insp => (
              <li key={insp.id} className="py-3">
                <Link to={ROUTES.INSPECTION_DETAIL.replace(':id', insp.id)} className="block hover:bg-neutral-light/50 p-2 rounded-md transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary hover:text-primary-dark">{insp.propertyType} - {insp.address}</p>
                      <p className="text-xs text-neutral">Agendada para: {new Date(insp.scheduledDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(insp.status)}`}>
                      {insp.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6">
        <button
            onClick={() => navigate(ROUTES.CLIENTS)}
            className="text-sm text-primary hover:text-primary-dark hover:underline"
        >
            &larr; Voltar para lista de clientes
        </button>
      </div>
    </div>
  );
};

export default ClientDetailPage;