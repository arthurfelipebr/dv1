import React, { useEffect, useState } from 'react';

interface Subscriber {
  id: number;
  name: string;
  email: string;
  plan: string;
  active: boolean;
}

const mockSubscribers: Subscriber[] = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', plan: 'Básico', active: true },
  { id: 2, name: 'Maria Souza', email: 'maria@example.com', plan: 'Profissional', active: false },
];

const SuperAdminPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    // Substitua por chamada à API no futuro
    setSubscribers(mockSubscribers);
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-neutral-dark">Gestão de Assinantes</h1>
      <table className="min-w-full divide-y divide-neutral-light bg-white rounded-lg shadow-md">
        <thead className="bg-neutral-light">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-dark">Nome</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-dark">E-mail</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-dark">Plano</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-dark">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-light">
          {subscribers.map((s) => (
            <tr key={s.id} className="hover:bg-neutral-light/50">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.email}</td>
              <td className="px-4 py-2">{s.plan}</td>
              <td className="px-4 py-2">{s.active ? 'Ativo' : 'Inativo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminPage;
