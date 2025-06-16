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

// Basic latitude/longitude pair used in services like cost simulation
export interface Coordinates {
  lat: number;
  lon: number;
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

export interface SLAEvent {
  id: string;
  name: string;
  deadline?: Date;
  status: string;
  completedAt?: Date;
}

export interface ScheduleEntry {
  id: string;
  date: Date;
  time: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  description?: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  receiptUrl?: string;
}

export interface PendingItem {
  id: string;
  description: string;
  status: string;
  dueDate?: Date;
}

export interface Publication {
  id: string;
  author: string;
  message: string;
  createdAt: Date;
}

export interface LocationHistoryItem {
  id: string;
  date: Date;
  user: string;
  address: string;
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
  slaEvents?: SLAEvent[];
  schedules?: ScheduleEntry[];
  attachments?: Attachment[];
  expenses?: Expense[];
  pendingItems?: PendingItem[];
  publications?: Publication[];
  locationHistory?: LocationHistoryItem[];
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

export interface FuelCostOptions {
  destination: string;
  fuelPricePerLiter: number;
  fuelEfficiencyKmPerLiter: number;
  tolls?: number;
  origin?: string;
  roundTrip?: boolean;
}

export interface FuelCostResult {
  distanceKm: number;
  fuelLiters: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
}
