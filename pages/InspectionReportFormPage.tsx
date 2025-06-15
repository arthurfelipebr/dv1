import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInspectionById } from '../services/inspectionService';
import { Inspection } from '../types';
import InspectionForm from '../components/reports/InspectionForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const InspectionReportFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getInspectionById(id);
      if (data) setInspection(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleChange = (fieldId: string, value: string | number | boolean) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!inspection) return <div className="p-4 text-center">Vistoria não encontrada.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-dark">Laudo para {inspection.propertyType}</h1>
      <p className="text-neutral">{inspection.address}</p>
      <InspectionForm answers={answers} onChange={handleChange} />
      <pre className="bg-neutral-light p-4 rounded-md text-xs mt-4 overflow-auto">
        {JSON.stringify(answers, null, 2)}
      </pre>
    </div>
  );
};

export default InspectionReportFormPage;
