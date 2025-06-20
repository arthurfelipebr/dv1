
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Inspection, InspectionStatus, Photo, ChecklistItem, ChecklistItemStatus, Task, TaskStatus, ExternalReport } from '../types';
import { getInspectionById, updateInspection, addPhotoToInspection, updateChecklistItemStatus, createTaskForInspection, updateTaskStatusForInspection, addExternalReportToInspection } from '../services/inspectionService';
import { generateInspectionPdf } from '../services/reportService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PhotoUpload from '../components/inspections/PhotoUpload';
import PhotoChecklist from '../components/inspections/PhotoChecklist';
import MapPreview from '../components/maps/MapPreview';
import { ROUTES } from '../constants';
import Modal from '../components/ui/Modal';


const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Task state
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // External Report State
  const [externalReportFile, setExternalReportFile] = useState<File | null>(null);
  const [externalReportType, setExternalReportType] = useState<'SISDEA' | 'OUTRO'>('OUTRO');
  const [isAddingExternalReport, setIsAddingExternalReport] = useState(false);

  const tabList = [
    { id: 'detalhes', label: 'Detalhamento' },
    { id: 'localizacao', label: 'Localização' },
    { id: 'sla', label: 'SLA' },
    { id: 'agendamentos', label: 'Agendamentos' },
    { id: 'anexos', label: 'Anexos' },
    { id: 'laudos', label: 'Laudos' },
    { id: 'despesas', label: 'Despesas' },
    { id: 'pendencias', label: 'Pendências' },
    { id: 'publicacoes', label: 'Publicações' },
  ] as const;
  type TabId = typeof tabList[number]['id'];
  const [activeTab, setActiveTab] = useState<TabId>('detalhes');


  const fetchInspection = useCallback(async () => {
    if (!id) {
      setError("ID da vistoria não encontrado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getInspectionById(id);
      if (data) {
        setInspection(data);
      } else {
        setError("Vistoria não encontrada.");
      }
    } catch (err) {
      console.error("Failed to fetch inspection:", err);
      setError(`Falha ao carregar dados da vistoria: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  const handleStatusChange = async (newStatus: InspectionStatus) => {
    if (!inspection) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateInspection(inspection.id, { status: newStatus });
      if (updated) setInspection(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Falha ao atualizar status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  
  const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!inspection) return;
    const newNotes = e.target.value;
    setInspection(prev => prev ? { ...prev, reportNotes: newNotes } : null);
    // Debounce this in a real app
    try {
      await updateInspection(inspection.id, { reportNotes: newNotes });
    } catch (err) {
      console.error("Failed to save notes:", err);
      // Potentially revert or show error
    }
  };

  const handlePhotoUploaded = async (photoData: Omit<Photo, 'id' | 'timestamp'>) => {
    if (!inspection) return;
    try {
      const updatedInspection = await addPhotoToInspection(inspection.id, photoData, photoData.checklistItemId);
      if (updatedInspection) {
        setInspection(updatedInspection);
      }
    } catch (err) {
      console.error("Failed to add photo:", err);
      setError("Falha ao adicionar foto.");
    }
  };

  const handleChecklistItemStatusChange = async (itemId: string, status: ChecklistItemStatus) => {
    if (!inspection) return;
    try {
      const updatedInspection = await updateChecklistItemStatus(inspection.id, itemId, status);
      if (updatedInspection) {
        setInspection(updatedInspection);
      }
    } catch (err) {
      console.error("Failed to update checklist item status:", err);
      setError("Falha ao atualizar status do item do checklist.");
    }
  };


  const handleAddTask = async () => {
    if (!inspection || !newTaskDescription.trim()) return;
    setIsAddingTask(true);
    try {
      const newTask = await createTaskForInspection(inspection.id, { description: newTaskDescription });
      if (newTask) {
        setInspection(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
        setNewTaskDescription('');
      }
    } catch (err) {
      console.error("Failed to add task:", err);
      setError("Falha ao adicionar tarefa.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    if (!inspection) return;
    const newStatus = currentStatus === TaskStatus.PENDENTE ? TaskStatus.CONCLUIDA : TaskStatus.PENDENTE;
    try {
      const updatedInspection = await updateTaskStatusForInspection(inspection.id, taskId, newStatus);
      if (updatedInspection) {
        setInspection(updatedInspection);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Falha ao atualizar status da tarefa.");
    }
  };

  const handleExternalReportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setExternalReportFile(event.target.files[0]);
    } else {
      setExternalReportFile(null);
    }
  };

  const handleAddExternalReport = async () => {
    if (!inspection || !externalReportFile) {
      setError("Selecione um arquivo para o laudo externo.");
      return;
    }
    setIsAddingExternalReport(true);
    setError(null);
    try {
      const reportData: Omit<ExternalReport, 'id' | 'uploadedAt'> = {
        name: externalReportFile.name,
        type: externalReportType,
        file: externalReportFile, // Will be handled by service, not stored directly in DB typically
      };
      const updatedInspection = await addExternalReportToInspection(inspection.id, reportData);
      if (updatedInspection) {
        setInspection(updatedInspection);
        setExternalReportFile(null);
        // Find the file input and reset its value
        const fileInput = document.getElementById('external-report-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = "";

      }
    } catch (err) {
      console.error("Failed to add external report:", err);
      setError("Falha ao adicionar laudo externo.");
    } finally {
      setIsAddingExternalReport(false);
    }
  };


  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (error && !inspection) return <div className="text-red-500 p-4 bg-red-100 rounded-md text-center">{error} <button onClick={() => navigate(ROUTES.INSPECTIONS)} className="ml-2 text-blue-500 hover:underline">Voltar para Vistorias</button></div>;
  if (!inspection) return <div className="text-center p-4">Vistoria não encontrada. <button onClick={() => navigate(ROUTES.INSPECTIONS)} className="ml-2 text-blue-500 hover:underline">Voltar para Vistorias</button></div>;


  const getStatusPillColor = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.COMPLETED: return 'bg-green-500 text-white';
      case InspectionStatus.REPORT_PENDING: return 'bg-yellow-500 text-black';
      case InspectionStatus.IN_PROGRESS: return 'bg-blue-500 text-white';
      case InspectionStatus.SCHEDULED: return 'bg-cyan-500 text-white';
      case InspectionStatus.REQUESTED: return 'bg-gray-400 text-white';
      case InspectionStatus.CANCELLED: return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-20"> {/* Increased pb for floating button */}
      {error && <div className="mb-4 text-red-500 p-3 bg-red-100 rounded-md text-sm">{error}</div>}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">{inspection.propertyType}</h1>
            <p className="text-neutral-dark">{inspection.address}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusPillColor(inspection.status)} mt-2 md:mt-0`}>
            {inspection.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong className="text-neutral-dark">Cliente:</strong> {inspection.clientName}</p>
          <p><strong className="text-neutral-dark">Agendada para:</strong> {new Date(inspection.scheduledDate).toLocaleString('pt-BR')}</p>
          <p><strong className="text-neutral-dark">Vistoriador:</strong> {inspection.inspectorName || 'Não atribuído'}</p>
        </div>
        <MapPreview address={inspection.address} />

        <div className="mt-4">
          <label htmlFor="status" className="block text-sm font-medium text-neutral-dark">Alterar Status:</label>
          <div className="flex items-center space-x-2">
            <select
              id="status"
              value={inspection.status}
              onChange={(e) => handleStatusChange(e.target.value as InspectionStatus)}
              disabled={isUpdatingStatus}
              className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-neutral-light focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {Object.values(InspectionStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {isUpdatingStatus && <LoadingSpinner size="sm" />}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Checklist and Photos) */}
        <div className="lg:col-span-2 space-y-6">
          <PhotoChecklist
            items={inspection.checklist}
            photos={inspection.photos}
            onItemStatusChange={handleChecklistItemStatusChange}
            onPhotoUploadedForChecklistItem={async (itemId, photoData) => {
              await handlePhotoUploaded({ ...photoData, checklistItemId: itemId });
            }}
          />
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Fotos da Vistoria (Geral)</h3>
            <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
            {inspection.photos.filter(p => !p.checklistItemId).length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-neutral-dark mb-2">Fotos Gerais Adicionadas:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {inspection.photos.filter(p => !p.checklistItemId).map(photo => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.url} alt={photo.caption || photo.name} className="w-full h-32 object-cover rounded-md shadow border" />
                      {photo.caption && <p className="text-xs text-neutral-dark italic mt-1 truncate" title={photo.caption}>{photo.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
           {/* Tasks Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Tarefas Vinculadas</h3>
            <div className="space-y-3">
              {inspection.tasks && inspection.tasks.length > 0 ? (
                inspection.tasks.map(task => (
                  <div key={task.id} className={`p-3 rounded-md flex items-center justify-between ${task.status === TaskStatus.CONCLUIDA ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div>
                      <p className={`text-sm ${task.status === TaskStatus.CONCLUIDA ? 'line-through text-neutral' : 'text-neutral-dark'}`}>
                        {task.description}
                      </p>
                      <p className="text-xs text-neutral">
                        Criada em: {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                        {task.dueDate && ` - Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`px-3 py-1 text-xs rounded-full focus:outline-none
                        ${task.status === TaskStatus.CONCLUIDA 
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                          : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      {task.status === TaskStatus.CONCLUIDA ? 'Marcar Pendente' : 'Concluir'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral">Nenhuma tarefa vinculada.</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-light">
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Nova tarefa..."
                className="w-full p-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary sm:text-sm"
              />
              <button
                onClick={handleAddTask}
                disabled={isAddingTask || !newTaskDescription.trim()}
                className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral"
              >
                {isAddingTask ? <LoadingSpinner size="sm" color="text-white"/> : 'Adicionar Tarefa'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Notes, AI Assistant, Search, External Reports) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Notas para o Laudo</h3>
            <textarea
              value={inspection.reportNotes || ''}
              onChange={handleNotesChange}
              rows={5}
              className="w-full p-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary"
              placeholder="Digite observações importantes, problemas encontrados, etc."
            />
          </div>

          
           {/* External Reports Section (e.g., SISDEA) */}
           <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Laudos Externos (Ex: SISDEA)</h3>
            <div className="space-y-3">
              {inspection.externalReports && inspection.externalReports.length > 0 ? (
                inspection.externalReports.map(report => (
                  <div key={report.id} className="p-3 rounded-md bg-neutral-light/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-dark">{report.name}</p>
                      <p className="text-xs text-neutral">Tipo: {report.type} - Upload: {new Date(report.uploadedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {/* Placeholder for download/view button */}
                    {report.url && <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Ver</a>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral">Nenhum laudo externo adicionado.</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-light">
              <label htmlFor="external-report-file-input" className="block text-sm font-medium text-neutral-dark">Adicionar Novo Laudo Externo:</label>
              <input
                type="file"
                id="external-report-file-input"
                onChange={handleExternalReportFileChange}
                className="mt-1 block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/30"
              />
              <div className="mt-2">
                <label htmlFor="external-report-type" className="block text-sm font-medium text-neutral-dark">Tipo de Laudo:</label>
                <select
                  id="external-report-type"
                  value={externalReportType}
                  onChange={(e) => setExternalReportType(e.target.value as 'SISDEA' | 'OUTRO')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-light focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="OUTRO">Outro</option>
                  <option value="SISDEA">SISDEA</option>
                </select>
              </div>
              <button
                onClick={handleAddExternalReport}
                disabled={isAddingExternalReport || !externalReportFile}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral"
              >
                {isAddingExternalReport ? <LoadingSpinner size="sm" color="text-white"/> : 'Adicionar Laudo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex border-b border-neutral-light mb-4">
          {tabList.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`mr-3 pb-2 text-sm font-medium ${activeTab === t.id ? 'border-b-2 border-primary text-primary-dark' : 'text-neutral-dark hover:text-primary-dark'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-sm space-y-2">
          {activeTab === 'detalhes' && (
            <div>
              <p><strong>ID:</strong> {inspection.id}</p>
              <p><strong>Cliente:</strong> {inspection.clientName}</p>
              <p><strong>Tipo:</strong> {inspection.propertyType}</p>
            </div>
          )}
          {activeTab === 'localizacao' && (
            <div>
              <p>{inspection.address}</p>
              {inspection.locationHistory && inspection.locationHistory.length > 0 && (
                <ul className="list-disc pl-4 mt-2">
                  {inspection.locationHistory.map(h => (
                    <li key={h.id}>{new Date(h.date).toLocaleDateString('pt-BR')} - {h.address} ({h.user})</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === 'sla' && (
            <div>
              {inspection.slaEvents && inspection.slaEvents.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.slaEvents.map(ev => (
                    <li key={ev.id} className="flex justify-between">
                      <span>{ev.name}</span>
                      <span>{ev.status}{ev.completedAt ? ` - ${new Date(ev.completedAt).toLocaleDateString('pt-BR')}` : ''}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>Nenhum evento registrado.</p>}
            </div>
          )}
          {activeTab === 'agendamentos' && (
            <div>
              {inspection.schedules && inspection.schedules.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.schedules.map(sch => (
                    <li key={sch.id}>{new Date(sch.date).toLocaleDateString('pt-BR')} {sch.time} - {sch.note || ''} ({sch.createdBy})</li>
                  ))}
                </ul>
              ) : <p>Nenhum agendamento.</p>}
            </div>
          )}
          {activeTab === 'anexos' && (
            <div>
              {inspection.attachments && inspection.attachments.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.attachments.map(att => (
                    <li key={att.id}>{att.name} - {att.type} ({(att.size/1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              ) : <p>Nenhum anexo.</p>}
            </div>
          )}
          {activeTab === 'laudos' && (
            <div>
              {inspection.externalReports && inspection.externalReports.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.externalReports.map(rep => (
                    <li key={rep.id}>{rep.name}</li>
                  ))}
                </ul>
              ) : <p>Nenhum laudo gerado.</p>}
            </div>
          )}
          {activeTab === 'despesas' && (
            <div>
              {inspection.expenses && inspection.expenses.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.expenses.map(exp => (
                    <li key={exp.id}>{exp.description}: R$ {exp.amount.toFixed(2)}</li>
                  ))}
                </ul>
              ) : <p>Nenhuma despesa cadastrada.</p>}
            </div>
          )}
          {activeTab === 'pendencias' && (
            <div>
              {inspection.pendingItems && inspection.pendingItems.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.pendingItems.map(p => (
                    <li key={p.id}>{p.description} - {p.status}</li>
                  ))}
                </ul>
              ) : <p>Sem pendências.</p>}
            </div>
          )}
          {activeTab === 'publicacoes' && (
            <div>
              {inspection.publications && inspection.publications.length > 0 ? (
                <ul className="space-y-1">
                  {inspection.publications.map(pub => (
                    <li key={pub.id}>{new Date(pub.createdAt).toLocaleDateString('pt-BR')} - {pub.author}: {pub.message}</li>
                  ))}
                </ul>
              ) : <p>Nenhuma publicação.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <div className="space-y-2 flex flex-col items-end">
          <button
            onClick={() => inspection && navigate(ROUTES.INSPECTION_REPORT_FORM.replace(':id', inspection.id))}
            className="bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded-full shadow flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Preencher Laudo
          </button>
          <button
            onClick={() => inspection && generateInspectionPdf(inspection)}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center"
          >
            <FileText className="w-5 h-5 mr-2" />
            Gerar Laudo PDF
          </button>
        </div>
      </div>

    </div>
  );
};

export default InspectionDetailPage;