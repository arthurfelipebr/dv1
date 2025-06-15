
import React from 'react';
import { UserCircle, FileText, Link2, CreditCard, Users } from 'lucide-react';

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
          icon={<UserCircle className="w-6 h-6" />}
        >
          <p>Ajuste suas informações pessoais, tema da interface e preferências de notificação.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Editar Perfil
          </button>
          {/* TODO: Add theme toggles, notification settings */}
        </SettingsSection>

        <SettingsSection
          title="Modelos de Laudo"
          icon={<FileText className="w-6 h-6" />}
        >
          <p>Gerencie e personalize os templates para geração de laudos em PDF. Crie modelos específicos por tipo de cliente ou vistoria.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Gerenciar Modelos
          </button>
          {/* TODO: Implement template management UI */}
        </SettingsSection>

        <SettingsSection
          title="Integrações"
          icon={<Link2 className="w-6 h-6" />}
        >
          <p>Conecte o ArchiEng Dashboard com outras ferramentas e serviços, como sistemas bancários, Autentique/DocuSign para assinaturas digitais, ou APIs de terceiros.</p>
          <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
            Configurar Integrações
          </button>
          {/* TODO: Add forms for API keys, OAuth connections, etc. */}
        </SettingsSection>

        <SettingsSection
          title="Faturamento e Assinatura"
          icon={<CreditCard className="w-6 h-6" />}
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
          icon={<Users className="w-6 h-6" />}
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