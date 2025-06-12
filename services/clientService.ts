import { Client, ClientType } from '../types';

let clients: Client[] = [
  {
    id: 'client-1',
    name: 'Banco Caixa Econômica',
    type: 'BANK',
    contactEmail: 'contato@caixa.gov.br',
    contactPhone: '(61) 3206-9999',
    address: 'SBS Quadra 4 LT 3/4, Edifício Matriz I, Brasília - DF',
    cnpjCpf: '00.360.305/0001-04',
    notes: 'Cliente de longa data, prioridade alta para vistorias de financiamento.'
  },
  {
    id: 'client-2',
    name: 'Construtora Solidez',
    type: 'CONSTRUCTION_COMPANY',
    contactEmail: 'engenharia@solidez.com.br',
    contactPhone: '(11) 5501-7000',
    address: 'Av. Paulista, 1000, São Paulo - SP',
    cnpjCpf: '12.345.678/0001-99',
    notes: 'Demanda vistorias de entrega de obra e acompanhamento.'
  },
  {
    id: 'client-3',
    name: 'João Carlos Pereira',
    type: 'INDIVIDUAL',
    contactEmail: 'joao.c.pereira@email.com',
    contactPhone: '(21) 99887-7665',
    address: 'Rua das Gaivotas, 45, Apt 201, Rio de Janeiro - RJ',
    cnpjCpf: '123.456.789-00',
    notes: 'Vistoria para avaliação de imóvel particular.'
  }
];

export const getClients = async (): Promise<Client[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(clients));
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const client = clients.find(c => c.id === id);
  return client ? JSON.parse(JSON.stringify(client)) : undefined;
};

export const createClient = async (newClientData: Omit<Client, 'id'>): Promise<Client> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const newId = `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const client: Client = {
    ...newClientData,
    id: newId,
  };
  clients.push(client);
  return JSON.parse(JSON.stringify(client));
};

export const updateClient = async (id: string, updatedData: Partial<Omit<Client, 'id'>>): Promise<Client | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updatedData };
    return JSON.parse(JSON.stringify(clients[index]));
  }
  return undefined;
};

export const deleteClient = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== id);
  return clients.length < initialLength;
};