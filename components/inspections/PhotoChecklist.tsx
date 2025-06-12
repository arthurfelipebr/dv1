
import React, { useState } from 'react';
import { ChecklistItem, ChecklistItemStatus, Photo } from '../../types';
import PhotoUpload from './PhotoUpload'; // Assuming PhotoUpload is in the same directory or accessible path
import Modal from '../ui/Modal'; // Assuming Modal is available

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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>
                )}
                 {item.status === ChecklistItemStatus.PENDING && (
                    <button
                        onClick={() => onItemStatusChange(item.id, ChecklistItemStatus.SKIPPED)}
                        className="p-1 text-orange-500 hover:text-orange-700"
                        title="Marcar como Ignorado"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                        </svg>
                    </button>
                )}
                {item.status !== ChecklistItemStatus.PENDING && (
                     <button
                        onClick={() => onItemStatusChange(item.id, ChecklistItemStatus.PENDING)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="Marcar como Pendente"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
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
    