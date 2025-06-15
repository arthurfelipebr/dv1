import { Inspection, InspectionStatus, ChecklistItem, ChecklistItemStatus, Photo, Task, TaskStatus, ExternalReport } from '../types';
import { DEFAULT_CHECKLIST_ITEMS, CHECKLIST_PRESETS } from '../constants';

// Mock database
let inspections: Inspection[] = [
  {
    id: '1',
    address: 'Rua das Palmeiras, 123, São Paulo, SP',
    propertyType: 'Apartamento Residencial',
    clientName: 'Banco Caixa Econômica', // Matches clientService mock data
    inspectorName: 'João Silva',
    scheduledDate: new Date('2024-08-15T10:00:00Z'),
    status: InspectionStatus.SCHEDULED,
    photos: [],
    checklist: DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      ...JSON.parse(JSON.stringify(item)), 
      id: `cl-1-${index}`, 
      status: ChecklistItemStatus.PENDING,
    })),
    reportNotes: 'Verificar infiltração no teto do banheiro.',
    tasks: [
        { id: 'task-1-1', inspectionId: '1', description: 'Confirmar horário com o cliente.', status: TaskStatus.CONCLUIDA, createdAt: new Date('2024-08-10T09:00:00Z'), dueDate: new Date('2024-08-12T17:00:00Z') },
        { id: 'task-1-2', inspectionId: '1', description: 'Preparar equipamento fotográfico.', status: TaskStatus.PENDENTE, createdAt: new Date('2024-08-11T10:00:00Z') }
    ],
    externalReports: [],
    slaEvents: [],
    schedules: [],
    attachments: [],
    expenses: [],
    pendingItems: [],
    publications: [],
    locationHistory: [],
  },
  {
    id: '2',
    address: 'Av. Brasil, 789, Rio de Janeiro, RJ',
    propertyType: 'Casa Térrea',
    clientName: 'Construtora Solidez', // Matches clientService mock data
    inspectorName: 'Maria Oliveira',
    scheduledDate: new Date('2024-08-20T14:00:00Z'),
    status: InspectionStatus.REPORT_PENDING,
    photos: [
      { id: 'p1', url: 'https://picsum.photos/seed/fachada/300/200', name: 'fachada.jpg', caption: 'Fachada principal', timestamp: new Date(), checklistItemId: 'cl-2-0' },
      { id: 'p2', url: 'https://picsum.photos/seed/sala/300/200', name: 'sala.jpg', caption: 'Sala de estar', timestamp: new Date(), checklistItemId: 'cl-2-4' },
    ],
    checklist: DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      ...JSON.parse(JSON.stringify(item)), 
      id: `cl-2-${index}`, 
      status: (index === 0 || index === 4) ? ChecklistItemStatus.CAPTURED : ChecklistItemStatus.PENDING,
      photoId: (index === 0) ? 'p1' : (index === 4) ? 'p2' : undefined,
    })),
    reportNotes: 'Imóvel em bom estado de conservação. Pequena fissura na parede da cozinha a ser observada.',
    generatedReportSummary: 'Vistoria realizada no imóvel Casa Térrea sito à Av. Brasil, 789, Rio de Janeiro, RJ, em 20/08/2024, para o cliente Construtora Solidez. Foram constatadas as seguintes observações iniciais: Imóvel em bom estado de conservação. Pequena fissura na parede da cozinha a ser observada..',
    tasks: [
        { id: 'task-2-1', inspectionId: '2', description: 'Revisar fotos da vistoria.', status: TaskStatus.PENDENTE, createdAt: new Date() }
    ],
    externalReports: [
        { id: 'er-2-1', name: 'Laudo_SISDEA_Ref123.pdf', type: 'SISDEA', uploadedAt: new Date('2024-08-21T10:00:00Z'), url: '#' }
    ],
    slaEvents: [],
    schedules: [],
    attachments: [],
    expenses: [],
    pendingItems: [],
    publications: [],
    locationHistory: [],
  },
  {
    id: '3',
    address: 'Praça da Sé, Lado Ímpar, Sé, São Paulo - SP',
    propertyType: 'Edifício Comercial',
    clientName: 'João Carlos Pereira', // Matches clientService mock data
    inspectorName: 'Ana Souza',
    scheduledDate: new Date('2024-09-01T09:00:00Z'),
    status: InspectionStatus.REQUESTED,
    photos: [],
    checklist: DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      ...JSON.parse(JSON.stringify(item)),
      id: `cl-3-${index}`,
      status: ChecklistItemStatus.PENDING,
    })),
    reportNotes: 'Vistoria para avaliação estrutural pós-reforma.',
    tasks: [
      { id: 'task-3-1', inspectionId: '3', description: 'Agendar com o síndico do edifício.', status: TaskStatus.PENDENTE, createdAt: new Date(), dueDate: new Date('2024-08-28T17:00:00Z') },
      { id: 'task-3-2', inspectionId: '3', description: 'Solicitar plantas originais.', status: TaskStatus.PENDENTE, createdAt: new Date() }
    ],
    externalReports: [],
    slaEvents: [],
    schedules: [],
    attachments: [],
    expenses: [],
    pendingItems: [],
    publications: [],
    locationHistory: [],
  },
];

export const getInspections = async (): Promise<Inspection[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(inspections)); // Return deep copy
};

export const getInspectionById = async (id: string): Promise<Inspection | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const inspection = inspections.find(inspection => inspection.id === id);
  return inspection ? JSON.parse(JSON.stringify(inspection)) : undefined; // Return deep copy
};

export const createInspection = async (newInspectionData: Omit<Inspection, 'id' | 'photos' | 'checklist' | 'status' | 'tasks' | 'externalReports'> & { presetName?: string }): Promise<Inspection> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newId = (Math.max(0, ...inspections.map(i => parseInt(i.id))) + 1).toString();
  let template = DEFAULT_CHECKLIST_ITEMS;
  if (newInspectionData.presetName) {
    const preset = (CHECKLIST_PRESETS as Record<string, { name: string; items: ChecklistItem[] }>)[newInspectionData.presetName];
    if (preset) {
      template = preset.items;
    }
  }
  const newChecklist: ChecklistItem[] = template.map((item, index) => ({
    ...JSON.parse(JSON.stringify(item)), // Deep copy
    id: `cl-${newId}-${index}`,
    status: ChecklistItemStatus.PENDING,
    photoId: undefined, // ensure photoId is reset
  }));
  const inspection: Inspection = {
    ...newInspectionData,
    id: newId,
    photos: [],
    checklist: newChecklist,
    status: InspectionStatus.REQUESTED,
    presetName: newInspectionData.presetName,
    tasks: [], // Initialize with empty tasks array
    externalReports: [], // Initialize with empty external reports array
    slaEvents: [],
    schedules: [],
    attachments: [],
    expenses: [],
    pendingItems: [],
    publications: [],
    locationHistory: [],
  };
  inspections.push(inspection);
  return JSON.parse(JSON.stringify(inspection)); // Return deep copy
};

export const updateInspection = async (id: string, updatedData: Partial<Inspection>): Promise<Inspection | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = inspections.findIndex(inspection => inspection.id === id);
  if (index !== -1) {
    // Ensure tasks and externalReports are not overwritten if not provided in updatedData
    const currentInspection = inspections[index];
    inspections[index] = {
        ...currentInspection,
        ...updatedData,
        tasks: updatedData.tasks !== undefined ? updatedData.tasks : currentInspection.tasks,
        externalReports: updatedData.externalReports !== undefined ? updatedData.externalReports : currentInspection.externalReports,
        slaEvents: updatedData.slaEvents !== undefined ? updatedData.slaEvents : currentInspection.slaEvents,
        schedules: updatedData.schedules !== undefined ? updatedData.schedules : currentInspection.schedules,
        attachments: updatedData.attachments !== undefined ? updatedData.attachments : currentInspection.attachments,
        expenses: updatedData.expenses !== undefined ? updatedData.expenses : currentInspection.expenses,
        pendingItems: updatedData.pendingItems !== undefined ? updatedData.pendingItems : currentInspection.pendingItems,
        publications: updatedData.publications !== undefined ? updatedData.publications : currentInspection.publications,
        locationHistory: updatedData.locationHistory !== undefined ? updatedData.locationHistory : currentInspection.locationHistory
     };
    return JSON.parse(JSON.stringify(inspections[index])); // Return deep copy
  }
  return undefined;
};

export const addPhotoToInspection = async (inspectionId: string, photo: Omit<Photo, 'id' | 'timestamp'>, checklistItemId?: string): Promise<Inspection | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const inspection = inspections.find(insp => insp.id === inspectionId); 
  if (!inspection) return undefined;

  const newPhoto: Photo = {
    ...photo,
    id: `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date(),
    checklistItemId: checklistItemId,
  };
  if(!inspection.photos) inspection.photos = [];
  inspection.photos.push(newPhoto);

  if (checklistItemId) {
    if(!inspection.checklist) inspection.checklist = [];
    const checklistItem = inspection.checklist.find(item => item.id === checklistItemId);
    if (checklistItem) {
      checklistItem.status = ChecklistItemStatus.CAPTURED;
      checklistItem.photoId = newPhoto.id;
    }
  }
  return JSON.parse(JSON.stringify(inspection)); 
};

export const updateChecklistItemStatus = async (inspectionId: string, checklistItemId: string, status: ChecklistItemStatus): Promise<Inspection | undefined> => {
  const inspection = inspections.find(insp => insp.id === inspectionId); 
  if (!inspection || !inspection.checklist) return undefined;

  const itemIndex = inspection.checklist.findIndex(item => item.id === checklistItemId);
  if (itemIndex > -1) {
    inspection.checklist[itemIndex].status = status;
    if (status === ChecklistItemStatus.PENDING || status === ChecklistItemStatus.SKIPPED) {
       inspection.checklist[itemIndex].photoId = undefined;
    }
    return JSON.parse(JSON.stringify(inspection)); 
  }
  return JSON.parse(JSON.stringify(inspection));
};

// --- Task Management ---
export const createTaskForInspection = async (inspectionId: string, taskData: Omit<Task, 'id' | 'inspectionId' | 'createdAt' | 'status'>): Promise<Task | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const inspection = inspections.find(insp => insp.id === inspectionId);
  if (!inspection) return undefined;

  const newTask: Task = {
    ...taskData,
    id: `task-${inspectionId}-${Date.now()}`,
    inspectionId, // Ensure inspectionId is set
    status: TaskStatus.PENDENTE,
    createdAt: new Date(),
  };
  if (!inspection.tasks) inspection.tasks = [];
  inspection.tasks.push(newTask);
  return JSON.parse(JSON.stringify(newTask));
};

export const updateTaskStatusForInspection = async (inspectionId: string, taskId: string, status: TaskStatus): Promise<Inspection | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const inspection = inspections.find(insp => insp.id === inspectionId);
  if (!inspection || !inspection.tasks) return undefined;

  const taskIndex = inspection.tasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    inspection.tasks[taskIndex].status = status;
    return JSON.parse(JSON.stringify(inspection));
  }
  return undefined;
};

// --- External Report Management ---
export const addExternalReportToInspection = async (inspectionId: string, reportData: Omit<ExternalReport, 'id' | 'uploadedAt'>): Promise<Inspection | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const inspection = inspections.find(insp => insp.id === inspectionId);
  if (!inspection) return undefined;

  const newReport: ExternalReport = {
    ...reportData,
    id: `er-${inspectionId}-${Date.now()}`,
    uploadedAt: new Date(),
  };
  
  if (newReport.file) delete newReport.file; 

  if (!inspection.externalReports) inspection.externalReports = [];
  inspection.externalReports.push(newReport);
  return JSON.parse(JSON.stringify(inspection));
};