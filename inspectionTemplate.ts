export interface InspectionField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export interface InspectionSection {
  id: string;
  title: string;
  fields: InspectionField[];
}

export const COMPLETE_INSPECTION_SECTIONS: InspectionSection[] = [
  {
    id: 'dados-vistoria',
    title: 'Dados da Vistoria',
    fields: [
      { id: 'data-vistoria', label: 'Data da Vistoria', type: 'text' },
      { id: 'local-vistoria', label: 'Local da Vistoria', type: 'text' },
      { id: 'proponentes', label: 'Proponente(s)', type: 'text' },
      { id: 'prestadora', label: 'Prestadora', type: 'text' },
      { id: 'banco', label: 'Banco', type: 'text' },
      { id: 'produto', label: 'Produto', type: 'text' },
      {
        id: 'tipo-inspecao',
        label: 'Tipo de Inspeção',
        type: 'select',
        options: ['Urbano Padrão', 'Rural', 'Outro'],
      },
      {
        id: 'endereco-divergente',
        label: 'O endereço divergiu do pedido?',
        type: 'boolean',
      },
    ],
  },
  {
    id: 'imovel-avaliado',
    title: 'Imóvel Avaliado',
    fields: [
      {
        id: 'tipo-imovel',
        label: 'Tipo do Imóvel Avaliado',
        type: 'select',
        options: ['Apartamento', 'Casa', 'Sobrado', 'Sala Comercial', 'Loft', 'Loja', 'Galpão', 'Prédio Comercial', 'Misto', 'Depósito Autônomo', 'Vaga Autônoma', 'Terreno', 'Outro'],
      },
      {
        id: 'tipo-implantacao',
        label: 'Tipo de Implantação',
        type: 'select',
        options: ['Condomínio', 'Isolado'],
      },
      {
        id: 'indicacao-ocupacao',
        label: 'Indício de Ocupação do Imóvel',
        type: 'select',
        options: ['Habitado', 'Desabitado'],
      },
      { id: 'idade-aparente', label: 'Idade Aparente do Imóvel (anos)', type: 'number' },
      { id: 'ano-construcao', label: 'Ano de Construção', type: 'number' },
      {
        id: 'estado-conservacao',
        label: 'Estado de Conservação',
        type: 'select',
        options: ['Ruim', 'Regular', 'Bom', 'Em Construção'],
      },
      {
        id: 'padrao-acabamento',
        label: 'Padrão de Acabamento do Imóvel',
        type: 'select',
        options: ['Mínimo', 'Baixo', 'Normal', 'Alto'],
      },
      {
        id: 'uso-imovel',
        label: 'Uso do Imóvel',
        type: 'select',
        options: ['Residencial', 'Comercial', 'Industrial', 'Misto', 'Outro'],
      },
    ],
  },
  // Outras seções e campos podem ser adicionados aqui conforme o modelo completo
];
