
import React from 'react';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      {icon && <span className="mr-3 text-primary">{icon}</span>}
      <h2 className="text-xl font-semibold text-neutral-dark">{title}</h2>
    </div>
    <div className="text-neutral space-y-3">{children}</div>
  </div>
);

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-neutral-dark">Configurações</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingsSection 
          title="Preferências da Conta"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        >
          <p>Ajuste suas informações pessoais, tema da interface e preferências de notificação.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Editar Perfil
          </button>
          {/* TODO: Add theme toggles, notification settings */}
        </SettingsSection>

        <SettingsSection 
          title="Modelos de Laudo"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
        >
          <p>Gerencie e personalize os templates para geração de laudos em PDF. Crie modelos específicos por tipo de cliente ou vistoria.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Gerenciar Modelos
          </button>
          {/* TODO: Implement template management UI */}
        </SettingsSection>

        <SettingsSection 
          title="Integrações"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>}
        >
          <p>Conecte o ArchiEng Dashboard com outras ferramentas e serviços, como sistemas bancários, Autentique/DocuSign para assinaturas digitais, ou APIs de terceiros.</p>
          <p className="text-xs text-neutral-dark italic">Chave API Gemini: {process.env.API_KEY ? `${process.env.API_KEY.substring(0,4)}...${process.env.API_KEY.substring(process.env.API_KEY.length - 4)} (Ambiente)` : 'Não configurada'}</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Configurar Integrações
          </button>
          {/* TODO: Add forms for API keys, OAuth connections, etc. */}
        </SettingsSection>

        <SettingsSection 
          title="Faturamento e Assinatura"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>}
        >
          <p>Visualize seu plano de assinatura, histórico de faturamento e gerencie suas informações de pagamento.</p>
          <p className="font-medium text-neutral-dark">Plano Atual: <span className="text-secondary-dark">Profissional</span></p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary-dark">
            Gerenciar Assinatura
          </button>
          {/* TODO: Implement billing portal integration or UI */}
        </SettingsSection>
        
        <SettingsSection
          title="Gestão de Usuários e Permissões"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        >
          <p>Adicione novos usuários à sua equipe, defina seus níveis de acesso (Administrador, Gestor, Vistoriador) e gerencie permissões.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Gerenciar Usuários
          </button>
        </SettingsSection>

      </div>
    </div>
  );
};

export default SettingsPage;