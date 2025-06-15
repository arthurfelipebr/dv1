import jsPDF from 'jspdf';
import { Inspection } from '../types';

export const generateInspectionPdf = (inspection: Inspection) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Laudo de Vistoria', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  const startY = 40;
  doc.text(`Endereço: ${inspection.address}`, 20, startY);
  doc.text(`Tipo de Imóvel: ${inspection.propertyType}`, 20, startY + 10);
  doc.text(`Cliente: ${inspection.clientName}`, 20, startY + 20);
  doc.text(`Data: ${new Date(inspection.scheduledDate).toLocaleString('pt-BR')}`, 20, startY + 30);

  if (inspection.reportNotes) {
    const notes = doc.splitTextToSize(inspection.reportNotes, 170);
    doc.text('Observações:', 20, startY + 45);
    doc.text(notes, 20, startY + 55);
  }

  doc.save(`Laudo_${inspection.id}.pdf`);
};
