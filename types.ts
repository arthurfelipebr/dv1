export enum InspectionStatus {
  REQUESTED = 'Pedido Criado',
  SCHEDULED = 'Agendada',
  IN_PROGRESS = 'Em Andamento',
  REPORT_PENDING = 'Laudo em Produção',
  COMPLETED = 'Laudo Entregue',
  CANCELLED = 'Cancelada',
}

export enum ChecklistItemStatus {
  PENDING = 'Pendente',
  CAPTURED = 'Capturada',
  SKIPPED = 'Ignorada',
}

export interface Photo {
  id: string;
  url: string; // Could be a base64 string for local preview or a remote URL
  name: string;
  caption?: string;
  timestamp: Date;
  checklistItemId?: string; 
}

export interface ChecklistItem {
  id: string;
  name: string;
  description?: string; // Made optional to align with usage
  required?: boolean;   // Made optional to align with usage
  status: ChecklistItemStatus;
  photoId?: string; // ID of the photo taken for this item
}

export enum TaskStatus {
  PENDENTE = 'Pendente',
  CONCLUIDA = 'Concluída',
}

export interface Task {
  id: string;
  description: string;
  inspectionId: string; // Keep this to know which inspection it belongs to
  inspectionAddress?: string; // For display on dashboard
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
}

export interface ExternalReport {
  id: string;
  name: string;
  type: 'SISDEA' | 'OUTRO';
  url?: string; // For a link if hosted, or just for reference
  file?: File; // Temporary client-side File object before "upload"
  uploadedAt: Date;
}

export interface Inspection {
  id: string;
  address: string;
  propertyType: string;
  clientName: string; // For now, linking by name. Consider clientId in future.
  inspectorName?: string;
  scheduledDate: Date;
  status: InspectionStatus;
  photos: Photo[];
  checklist: ChecklistItem[];
  presetName?: string;
  reportNotes?: string;
  generatedReportSummary?: string; 
  tasks?: Task[];
  externalReports?: ExternalReport[];
}

export type ClientType = 'BANK' | 'CONSTRUCTION_COMPANY' | 'INDIVIDUAL' | 'OTHER';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  contactEmail: string;
  contactPhone?: string; // Made optional
  address?: string; // Added address for clients
  cnpjCpf?: string; // Added CNPJ/CPF
  notes?: string; // Added notes
}

export interface ComparableProperty {
  id: string;
  address: string;
  region: string;
  propertyType: string;
  appraisalDate: Date;
  appraisedValue: number;
  notes?: string;
}

// For Gemini Search Grounding
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks can be added here
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}