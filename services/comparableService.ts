import { ComparableProperty } from '../types';

// Mock database of comparable properties
let comparables: ComparableProperty[] = [
  {
    id: 'comp-1',
    address: 'Rua das Flores, 100, São Paulo - SP',
    region: 'São Paulo/SP',
    propertyType: 'Apartamento',
    appraisalDate: new Date('2024-01-15'),
    appraisedValue: 500000,
    notes: 'Bem conservado'
  },
  {
    id: 'comp-2',
    address: 'Av. Atlântica, 2000, Rio de Janeiro - RJ',
    region: 'Rio de Janeiro/RJ',
    propertyType: 'Casa',
    appraisalDate: new Date('2023-12-10'),
    appraisedValue: 750000,
    notes: 'Vista para o mar'
  }
];

export interface ComparableSearchFilters {
  region?: string;
  propertyType?: string;
  startDate?: Date;
  endDate?: Date;
}

export const getComparables = async (): Promise<ComparableProperty[]> => {
  await new Promise(res => setTimeout(res, 200));
  return JSON.parse(JSON.stringify(comparables));
};

export const searchComparables = async (filters: ComparableSearchFilters): Promise<ComparableProperty[]> => {
  await new Promise(res => setTimeout(res, 200));
  return comparables.filter(c => {
    const matchesRegion = filters.region ? c.region.toLowerCase().includes(filters.region.toLowerCase()) : true;
    const matchesType = filters.propertyType ? c.propertyType.toLowerCase().includes(filters.propertyType.toLowerCase()) : true;
    const matchesStart = filters.startDate ? c.appraisalDate >= filters.startDate : true;
    const matchesEnd = filters.endDate ? c.appraisalDate <= filters.endDate : true;
    return matchesRegion && matchesType && matchesStart && matchesEnd;
  }).map(c => JSON.parse(JSON.stringify(c)));
};

export const createComparable = async (data: Omit<ComparableProperty, 'id'>): Promise<ComparableProperty> => {
  await new Promise(res => setTimeout(res, 200));
  const newComparable: ComparableProperty = { ...data, id: `comp-${Date.now()}` };
  comparables.push(newComparable);
  return JSON.parse(JSON.stringify(newComparable));
};
