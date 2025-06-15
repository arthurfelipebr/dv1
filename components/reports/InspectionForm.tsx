import React from 'react';
import { COMPLETE_INSPECTION_SECTIONS, InspectionField } from '../../inspectionTemplate';

interface InspectionFormProps {
  answers: Record<string, string | number | boolean>;
  onChange: (fieldId: string, value: string | number | boolean) => void;
}

const renderField = (field: InspectionField, value: any, onChange: InspectionFormProps['onChange']) => {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={value as string || ''}
          onChange={e => onChange(field.id, e.target.value)}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={value as number || ''}
          onChange={e => onChange(field.id, parseFloat(e.target.value))}
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          className="h-4 w-4 text-primary focus:ring-primary border-neutral rounded"
          checked={!!value}
          onChange={e => onChange(field.id, e.target.checked)}
        />
      );
    case 'select':
      return (
        <select
          className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={value as string || ''}
          onChange={e => onChange(field.id, e.target.value)}
        >
          <option value="">Selecione</option>
          {field.options && field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    default:
      return null;
  }
};

const InspectionForm: React.FC<InspectionFormProps> = ({ answers, onChange }) => {
  return (
    <form className="space-y-6">
      {COMPLETE_INSPECTION_SECTIONS.map(section => (
        <div key={section.id} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field.id} className="flex flex-col">
                <label className="text-sm font-medium text-neutral-dark">
                  {field.label}
                </label>
                {renderField(field, answers[field.id], onChange)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
};

export default InspectionForm;
