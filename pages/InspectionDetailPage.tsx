
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Inspection, InspectionStatus, Photo, ChecklistItem, ChecklistItemStatus, GroundingChunk, GroundingMetadata, Task, TaskStatus, ExternalReport } from '../types';
import { getInspectionById, updateInspection, addPhotoToInspection, updateChecklistItemStatus, createTaskForInspection, updateTaskStatusForInspection, addExternalReportToInspection } from '../services/inspectionService';
import { generateInspectionSummary, suggestPhotoCaption, getInformationWithGoogleSearch } from '../services/geminiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PhotoUpload from '../components/inspections/PhotoUpload';
import PhotoChecklist from '../components/inspections/PhotoChecklist';
import { ROUTES } from '../constants';
import Modal from '../components/ui/Modal';


const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPhotoModal, setShowPhotoModal] = useState(false); // Kept for potential future use, but not actively used by current PhotoUpload.
  const [photoToCaption, setPhotoToCaption] = useState<Photo | null>(null);
  const [suggestedCaption, setSuggestedCaption] = useState('');
  const [isSuggestingCaption, setIsSuggestingCaption] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{text: string, groundingMetadata?: GroundingMetadata } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Task state
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // External Report State
  const [externalReportFile, setExternalReportFile] = useState<File | null>(null);
  const [externalReportType, setExternalReportType] = useState<'SISDEA' | 'OUTRO'>('OUTRO');
  const [isAddingExternalReport, setIsAddingExternalReport] = useState(false);


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

  const handleGenerateSummary = async () => {
    if (!inspection) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await generateInspectionSummary(inspection);
      const updated = await updateInspection(inspection.id, { generatedReportSummary: summary });
      if (updated) setInspection(updated);
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setError("Falha ao gerar resumo com IA.");
    } finally {
      setIsGeneratingSummary(false);
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

  const openCaptionModal = async (photo: Photo) => {
    setPhotoToCaption(photo);
    setSuggestedCaption(''); // Clear previous
    setIsSuggestingCaption(true);
    try {
      const caption = await suggestPhotoCaption(photo.name || "imagem de vistoria", inspection?.propertyType || "imóvel");
      setSuggestedCaption(caption);
    } catch (e) {
      console.error("Failed to suggest caption", e);
      setSuggestedCaption("Não foi possível sugerir uma legenda.");
    } finally {
      setIsSuggestingCaption(false);
    }
  };

  const applySuggestedCaption = async () => {
    if (!inspection || !photoToCaption || !suggestedCaption) return;
    
    const updatedPhotos = inspection.photos.map(p => 
      p.id === photoToCaption.id ? { ...p, caption: suggestedCaption } : p
    );
    try {
      const updated = await updateInspection(inspection.id, { photos: updatedPhotos });
      if (updated) setInspection(updated);
      setPhotoToCaption(null); // Close modal
    } catch (err) {
      console.error("Failed to update caption:", err);
      setError("Falha ao atualizar legenda.");
    }
  };

  const handleSearchWithGoogle = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults(null);
    try {
      const results = await getInformationWithGoogleSearch(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error("Error during Google Search:", e);
      setSearchResults({ text: "Erro ao realizar a busca." });
    } finally {
      setIsSearching(false);
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
                      <button 
                        onClick={() => openCaptionModal(photo)}
                        className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sugerir Legenda (IA)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14 12l1.25-1.75L17 8.5l1.25 1.75L20.25 12z" />
                        </svg>
                      </button>
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

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Assistente IA para Laudo</h3>
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="w-full mb-3 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-neutral"
            >
              {isGeneratingSummary ? <LoadingSpinner size="sm" color="text-white"/> : 'Gerar Resumo do Laudo (IA)'}
            </button>
            {inspection.generatedReportSummary && (
              <div className="mt-3 p-3 bg-neutral-light rounded">
                <h4 className="font-semibold text-sm text-neutral-dark">Resumo Sugerido:</h4>
                <p className="text-sm text-neutral-dark whitespace-pre-wrap">{inspection.generatedReportSummary}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-neutral-dark mb-3">Pesquisa Google Assistida por IA</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: norma ABNT para vistorias"
                    className="flex-grow p-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary"
                />
                <button
                    onClick={handleSearchWithGoogle}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-neutral"
                >
                    {isSearching ? <LoadingSpinner size="sm" color="text-white"/> : "Buscar"}
                </button>
            </div>
            {searchResults && (
                <div className="mt-4 p-3 bg-neutral-light rounded">
                    <h4 className="font-semibold text-sm text-neutral-dark">Resultado da Busca:</h4>
                    <p className="text-sm text-neutral-dark whitespace-pre-wrap">{searchResults.text}</p>
                    {searchResults.groundingMetadata?.groundingChunks && searchResults.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-2">
                            <h5 className="font-semibold text-xs text-neutral-dark">Fontes:</h5>
                            <ul className="list-disc list-inside text-xs">
                                {searchResults.groundingMetadata.groundingChunks.map((chunk, index) =>
                                  chunk.web && (
                                    <li key={index}>
                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {chunk.web.title || chunk.web.uri}
                                        </a>
                                    </li>
                                  )
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
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
      
      {photoToCaption && (
        <Modal 
            isOpen={!!photoToCaption} 
            onClose={() => setPhotoToCaption(null)}
            title={`Sugerir Legenda para: ${photoToCaption.name}`}
        >
            <div className="space-y-4">
                <img src={photoToCaption.url} alt={photoToCaption.name} className="max-h-60 w-auto mx-auto rounded-md shadow"/>
                {isSuggestingCaption && <LoadingSpinner />}
                {!isSuggestingCaption && suggestedCaption && (
                    <div>
                        <label htmlFor="suggestedCaption" className="block text-sm font-medium text-neutral-dark">Legenda Sugerida pela IA:</label>
                        <textarea
                            id="suggestedCaption"
                            value={suggestedCaption}
                            onChange={(e) => setSuggestedCaption(e.target.value)}
                            rows={3}
                            className="w-full mt-1 p-2 border border-neutral-light rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                )}
                {!isSuggestingCaption && !suggestedCaption && <p>Não foi possível gerar uma sugestão.</p>}
                 <div className="flex justify-end space-x-2 pt-4">
                    <button 
                        onClick={() => setPhotoToCaption(null)}
                        className="px-4 py-2 border border-neutral rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-light"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={applySuggestedCaption} 
                        disabled={isSuggestingCaption || !suggestedCaption}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-neutral"
                    >
                        Aplicar Legenda
                    </button>
                </div>
            </div>
        </Modal>
      )}

      {/* Placeholder for PDF generation button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => alert('Funcionalidade de Geração de PDF (Puppeteer) a ser implementada no backend.')}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Gerar Laudo PDF
        </button>
      </div>

    </div>
  );
};

export default InspectionDetailPage;