import { ChecklistItem, ChecklistItemStatus } from './types'; // Added ChecklistItemStatus

export const APP_NAME = "ArchiEng Dashboard";

// This should be set in the environment variables and NOT hardcoded in production.
// For development, you might temporarily set it here or use a .env file (not part of this setup).
// The problem statement implies process.env.API_KEY is available.
// export const GEMINI_API_KEY = process.env.API_KEY || "YOUR_API_KEY_HERE"; 
// Using process.env.API_KEY directly as per guidelines.

export const ROUTES = {
  DASHBOARD: "/dashboard",
  INSPECTIONS: "/inspections",
  INSPECTION_DETAIL: "/inspections/:id",
  INSPECTION_REPORT_FORM: "/inspections/:id/report",
  NEW_INSPECTION: "/inspections/new",
  REPORTS: "/reports",
  CLIENTS: "/clients",
  NEW_CLIENT: "/clients/new",
  CLIENT_DETAIL: "/clients/:id",
  CALENDAR: "/calendar",
  SETTINGS: "/settings",
  COMPARABLES: "/comparables",
  SUPER_ADMIN: "/super-admin",
};

// Ensure these items fully conform to the ChecklistItem interface structure now
export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'default-0', name: "Fachada Principal", description: "Foto frontal completa da fachada do imóvel.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-1', name: "Placa de Endereço/Número", description: "Foto legível da placa de rua e número.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-2', name: "Quadro de Luz (Padrão)", description: "Foto do quadro de distribuição de energia.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-3', name: "Hidrômetro (se aplicável)", description: "Foto do medidor de água.", required: false, status: ChecklistItemStatus.PENDING },
  { id: 'default-4', name: "Sala de Estar", description: "Visão geral da sala de estar.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-5', name: "Cozinha", description: "Visão geral da cozinha, incluindo pia e bancadas.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-6', name: "Banheiro Principal", description: "Visão geral do banheiro principal.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-7', name: "Quarto Principal", description: "Visão geral do quarto principal.", required: true, status: ChecklistItemStatus.PENDING },
  { id: 'default-8', name: "Área de Serviço", description: "Visão geral da área de serviço.", required: false, status: ChecklistItemStatus.PENDING },
  { id: 'default-9', name: "Garagem (se aplicável)", description: "Foto da garagem.", required: false, status: ChecklistItemStatus.PENDING },
  { id: 'default-10', name: "Danos Visíveis (Interno)", description: "Fotos de quaisquer danos internos (rachaduras, infiltrações).", required: false, status: ChecklistItemStatus.PENDING },
  { id: 'default-11', name: "Danos Visíveis (Externo)", description: "Fotos de quaisquer danos externos (pintura, telhado).", required: false, status: ChecklistItemStatus.PENDING },
];

export const SIMPLIFIED_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'simp-0', name: 'Fachada Principal', required: true, status: ChecklistItemStatus.PENDING },
  { id: 'simp-1', name: 'Sala de Estar', required: true, status: ChecklistItemStatus.PENDING },
  { id: 'simp-2', name: 'Cozinha', required: true, status: ChecklistItemStatus.PENDING },
];

export const COMPLETE_CHECKLIST_ITEMS: ChecklistItem[] = [
  ...DEFAULT_CHECKLIST_ITEMS,
  { id: 'comp-12', name: 'Área Externa', required: false, status: ChecklistItemStatus.PENDING },
  { id: 'comp-13', name: 'Telhado', required: false, status: ChecklistItemStatus.PENDING },
];

export const CHECKLIST_PRESETS = {
  default: { name: 'Padrão', items: DEFAULT_CHECKLIST_ITEMS },
  simplified: { name: 'Simplificado', items: SIMPLIFIED_CHECKLIST_ITEMS },
  complete: { name: 'Completo', items: COMPLETE_CHECKLIST_ITEMS },
} as const;
