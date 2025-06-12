
import React, { useState, useCallback } from 'react';
import { Photo } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PhotoUploadProps {
  onPhotoUploaded: (photo: Omit<Photo, 'id' | 'timestamp'>) => Promise<void>; // Make it async
  checklistItemId?: string; // Optional: if photo is for a specific checklist item
  maxFiles?: number;
  maxSizeMB?: number; // Max size per file in MB
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoUploaded, checklistItemId, maxFiles = 5, maxSizeMB = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      
      if (filesArray.length + selectedFiles.length > maxFiles) {
        setError(`Você pode selecionar no máximo ${maxFiles} arquivos por vez.`);
        return;
      }

      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      filesArray.forEach(file => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`O arquivo ${file.name} é muito grande (máx ${maxSizeMB}MB).`);
          return; // Skip this file
        }
        if (!file.type.startsWith('image/')) {
          setError(`O arquivo ${file.name} não é uma imagem válida.`);
          return; // Skip this file
        }
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      event.target.value = ''; // Reset file input
    }
  };

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    for (const file of selectedFiles) {
      try {
        // Simulate upload & get URL (in real app, this would be an API call)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // eslint-disable-next-line no-loop-func
        reader.onloadend = async () => {
          const base64Url = reader.result as string;
          // In a real app, you'd upload 'file' and get back a URL from the server.
          // For this mock, we use the base64 data URL.
          const photoData: Omit<Photo, 'id' | 'timestamp'> = {
            url: base64Url, // or server URL after upload
            name: file.name,
            checklistItemId: checklistItemId,
            // Caption could be added later or via another input
          };
          await onPhotoUploaded(photoData); 
        };
        reader.onerror = () => {
          console.error("Error reading file for photo upload");
          setError(`Erro ao processar o arquivo ${file.name}`);
        }

      } catch (err) {
        console.error("Upload failed for file:", file.name, err);
        setError(`Falha no upload de ${file.name}.`);
        // Optionally, handle partial success or retry logic
      }
    }
    
    // Clear after attempting all uploads
    setSelectedFiles([]);
    previews.forEach(URL.revokeObjectURL); // Clean up object URLs
    setPreviews([]);
    setIsUploading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles, checklistItemId, onPhotoUploaded, previews]); // Added previews to dependency


  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-4 border border-neutral-light rounded-md bg-white">
      <label className="block text-sm font-medium text-neutral-dark">
        {checklistItemId ? "Adicionar Foto do Item" : "Adicionar Fotos da Vistoria"}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-neutral" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-neutral-dark">
            <label
              htmlFor={`file-upload-${checklistItemId || 'general'}`}
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span>Carregar arquivos</span>
              <input id={`file-upload-${checklistItemId || 'general'}`} name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*" />
            </label>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          <p className="text-xs text-neutral">PNG, JPG, GIF até {maxSizeMB}MB</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-neutral-dark">Pré-visualização:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group">
                <img src={src} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-md shadow" />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral"
        >
          {isUploading ? <LoadingSpinner size="sm" color="text-white" /> : `Enviar ${selectedFiles.length} Foto(s)`}
        </button>
      )}
    </div>
  );
};

export default PhotoUpload;

    