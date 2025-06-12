import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client, ClientType } from '../types';
import { getClients, deleteClient } from '../services/clientService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { ROUTES } from '../constants';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClientsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setError(`Falha ao carregar clientes: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsData();
  }, []);

  const handleDeleteRequest = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await deleteClient(clientToDelete.id);
      setClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
      setClientToDelete(null);
    } catch (err) {
      console.error("Failed to delete client:", err);
      setError(`Falha ao excluir cliente: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getClientTypeLabel = (type: ClientType): string => {
    switch (type) {
      case 'BANK': return 'Banco';
      case 'CONSTRUCTION_COMPANY': return 'Construtora';
      case 'INDIVIDUAL': return 'Pessoa Física';
      case 'OTHER': return 'Outro';
      default: return type;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error && clients.length === 0) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-neutral-dark">Gestão de Clientes</h1>
        <button
          onClick={() => navigate(ROUTES.NEW_CLIENT)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Cliente
        </button>
      </div>

      {error && <div className="mb-4 text-red-500 p-3 bg-red-100 rounded-md text-sm">{error}</div>}

      {clients.length === 0 && !loading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.602m0 6.082a9.094 9.094 0 013.741-.479m0 0a4.5 4.5 0 01-1.548-8.72m-17.556 0a4.5 4.5 0 011.548-8.72m15.908 0A18.36 18.36 0 0118 18.72m0 0V21" />
          </svg>
          <p className="text-xl text-neutral-dark">Nenhum cliente cadastrado.</p>
          <p className="text-neutral mt-2">Comece adicionando um novo cliente para gerenciar suas vistorias e informações.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead className="bg-neutral-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Contato</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-light/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={ROUTES.CLIENT_DETAIL.replace(':id', client.id)} className="text-sm font-medium text-primary hover:text-primary-dark hover:underline">
                      {client.name}
                    </Link>
                    {client.cnpjCpf && <div className="text-xs text-neutral">{client.cnpjCpf}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{getClientTypeLabel(client.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-dark">{client.contactEmail}</div>
                    {client.contactPhone && <div className="text-sm text-neutral">{client.contactPhone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link to={ROUTES.CLIENT_DETAIL.replace(':id', client.id)} className="text-primary hover:text-primary-dark">
                      Detalhes
                    </Link>
                    <button
                      onClick={() => handleDeleteRequest(client)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Excluir cliente ${client.name}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clientToDelete && (
        <Modal
          isOpen={!!clientToDelete}
          onClose={() => setClientToDelete(null)}
          title="Confirmar Exclusão"
        >
          <p className="text-neutral-dark">
            Tem certeza que deseja excluir o cliente <strong className="font-semibold">{clientToDelete.name}</strong>?
          </p>
          <p className="text-sm text-neutral mt-1">Esta ação não poderá ser desfeita.</p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setClientToDelete(null)}
              className="px-4 py-2 border border-neutral rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-light focus:outline-none"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteClient}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none disabled:bg-red-300"
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner size="sm" color="text-white" /> : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientsPage;