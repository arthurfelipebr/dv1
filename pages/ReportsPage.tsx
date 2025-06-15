
import React from 'react';
import { FileText } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-neutral-dark mb-6">Laudos Técnicos</h1>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
        <p className="text-xl text-neutral-dark">Gerenciamento de Laudos</p>
        <p className="text-neutral mt-2">Esta seção permitirá visualizar, gerar e gerenciar os laudos técnicos. <br/> Funcionalidades como templates de PDF e assinaturas digitais serão implementadas aqui.</p>
        {/* TODO: Implement report listing, generation triggers, version control, etc. */}
      </div>
    </div>
  );
};

export default ReportsPage;
    