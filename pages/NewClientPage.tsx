import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, ClientType } from '../types';
import { createClient } from '../services/clientService';
import { ROUTES } from '../constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NewClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    type: 'INDIVIDUAL',
    contactEmail: '',
    contactPhone: '',
    address: '',
    cnpjCpf: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.contactEmail) {
      setError("Nome do cliente e Email de contato são obrigatórios.");
      return;
    }
    
    setIsLoading(true);
    try {
      const newClient = await createClient(formData);
      setIsLoading(false);
      navigate(ROUTES.CLIENT_DETAIL.replace(':id', newClient.id));
    } catch (err) {
      console.error("Failed to create client:", err);
      setError(`Falha ao criar cliente: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      setIsLoading(false);
    }
  };

  const clientTypes: { value: ClientType; label: string }[] = [
    { value: 'INDIVIDUAL', label: 'Pessoa Física' },
    { value: 'BANK', label: 'Banco' },
    { value: 'CONSTRUCTION_COMPANY', label: 'Construtora' },
    { value: 'OTHER', label: 'Outro' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-neutral-dark mb-6">Novo Cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">
            Nome Completo / Razão Social *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="cnpjCpf" className="block text-sm font-medium text-neutral-dark">
            CPF / CNPJ
          </label>
          <input
            type="text"
            name="cnpjCpf"
            id="cnpjCpf"
            value={formData.cnpjCpf}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-neutral-dark">
            Tipo de Cliente *
          </label>
          <select
            name="type"
            id="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {clientTypes.map(typeOpt => (
              <option key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-dark">
            Email de Contato *
          </label>
          <input
            type="email"
            name="contactEmail"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-neutral-dark">
            Telefone de Contato
          </label>
          <input
            type="tel"
            name="contactPhone"
            id="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-dark">
            Endereço
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-dark">
            Observações (Opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Informações adicionais sobre o cliente..."
          />
        </div>
        
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={() => navigate(ROUTES.CLIENTS)}
                className="px-4 py-2 border border-neutral rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral"
            >
                {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : 'Criar Cliente'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewClientPage;