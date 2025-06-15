
import React, { useState } from 'react';
import { ChecklistItem, ChecklistItemStatus, Photo } from '../../types';
import PhotoUpload from './PhotoUpload';
import Modal from '../ui/Modal';
import { Camera, Ban, RotateCcw } from 'lucide-react';

interface PhotoChecklistProps {
  items: ChecklistItem[];
  photos: Photo[]; // All photos for the inspection, to find linked ones
  onItemStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  onPhotoUploadedForChecklistItem: (itemId: string, photo: Omit<Photo, 'id' | 'timestamp'>) => Promise<void>;
}

const PhotoChecklist: React.FC<PhotoChecklistProps> = ({ items, photos, onItemStatusChange, onPhotoUploadedForChecklistItem }) => {
  const [modalOpenForItem, setModalOpenForItem] = useState<ChecklistItem | null>(null);

  const getStatusColor = (status: ChecklistItemStatus) => {
    switch (status) {
      case ChecklistItemStatus.CAPTURED: return 'bg-green-100 text-green-700';
      case ChecklistItemStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case ChecklistItemStatus.SKIPPED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getItemPhoto = (itemId: string, photoId?: string): Photo | undefined => {
    if (!photoId) return undefined;
    return photos.find(p => p.id === photoId && p.checklistItemId === itemId);
  }

  const handlePhotoUploaded = async (photoData: Omit<Photo, 'id' | 'timestamp'>) => {
    if (modalOpenForItem) {
      await onPhotoUploadedForChecklistItem(modalOpenForItem.id, photoData);
      // Status should be updated by parent after successful photo association
      // onItemStatusChange(modalOpenForItem.id, ChecklistItemStatus.CAPTURED);
      setModalOpenForItem(null); // Close modal after upload
    }
  };


  return (
    <div className="space-y-3 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-neutral-dark mb-2">Roteiro Fotográfico</h3>
      {items.length === 0 && <p className="text-neutral">Nenhum item no roteiro.</p>}
      <ul className="divide-y divide-neutral-light">
        {items.map((item) => {
          const itemPhoto = getItemPhoto(item.id, item.photoId);
          return (
          <li key={item.id} className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-neutral-dark ${item.status === ChecklistItemStatus.CAPTURED ? 'line-through' : ''}`}>
                  {item.name} {item.required && <span className="text-red-500">*</span>}
                </p>
                <p className="text-sm text-neutral">{item.description}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                
                {item.status !== ChecklistItemStatus.CAPTURED && (
                  <button
                    onClick={() => setModalOpenForItem(item)}
                    className="p-1 text-primary hover:text-primary-dark"
                    title="Adicionar Foto"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                 {item.status === ChecklistItemStatus.PENDING && (
                    <button
                        onClick={() => onItemStatusChange(item.id, ChecklistItemStatus.SKIPPED)}
                        className="p-1 text-orange-500 hover:text-orange-700"
                        title="Marcar como Ignorado"
                    >
                        <Ban className="w-5 h-5" />
                    </button>
                )}
                {item.status !== ChecklistItemStatus.PENDING && (
                     <button
                        onClick={() => onItemStatusChange(item.id, ChecklistItemStatus.PENDING)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="Marcar como Pendente"
                    >
                       <RotateCcw className="w-5 h-5" />
                    </button>
                )}
              </div>
            </div>
            {itemPhoto && (
              <div className="mt-2 pl-4">
                <img src={itemPhoto.url} alt={itemPhoto.caption || item.name} className="h-20 w-auto rounded border border-neutral-light"/>
                {itemPhoto.caption && <p className="text-xs text-neutral-dark italic mt-1">{itemPhoto.caption}</p>}
              </div>
            )}
          </li>
        )})}
      </ul>
      {modalOpenForItem && (
        <Modal
          isOpen={!!modalOpenForItem}
          onClose={() => setModalOpenForItem(null)}
          title={`Adicionar Foto para: ${modalOpenForItem.name}`}
        >
          <PhotoUpload
            onPhotoUploaded={handlePhotoUploaded}
            checklistItemId={modalOpenForItem.id}
            maxFiles={1} // Typically one photo per checklist item
          />
        </Modal>
      )}
    </div>
  );
};

export default PhotoChecklist;
    