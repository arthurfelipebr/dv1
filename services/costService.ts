import { COMPANY_BASE_ADDRESS } from '../constants';

export interface FuelCostOptions {
  destination: string;
  fuelPricePerLiter: number; // Cost of fuel per liter (BRL)
  fuelEfficiencyKmPerLiter: number; // Vehicle efficiency
  tolls?: number; // Total toll cost in BRL
  origin?: string; // optional override of origin address
}

export interface FuelCostResult {
  distanceKm: number;
  fuelLiters: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
}

type Coordinates = { lat: number; lon: number };

const geocodeAddress = async (address: string): Promise<Coordinates> => {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { 'User-Agent': 'ArchiEng Dashboard' }
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Address not found');
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
};

const getDrivingDistanceKm = async (from: Coordinates, to: Coordinates): Promise<number> => {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ArchiEng Dashboard' } });
  if (!res.ok) throw new Error('Routing failed');
  const data = await res.json();
  if (!data.routes || !data.routes[0]) throw new Error('Route not found');
  return data.routes[0].distance / 1000; // meters to km
};

export const calculateFuelCost = async (options: FuelCostOptions): Promise<FuelCostResult> => {
  const originAddress = options.origin || COMPANY_BASE_ADDRESS;
  const tolls = options.tolls ?? 0;

  try {
    const [originCoords, destCoords] = await Promise.all([
      geocodeAddress(originAddress),
      geocodeAddress(options.destination)
    ]);
    const distanceKm = await getDrivingDistanceKm(originCoords, destCoords);
    const fuelLiters = distanceKm / options.fuelEfficiencyKmPerLiter;
    const fuelCost = fuelLiters * options.fuelPricePerLiter;
    const totalCost = fuelCost + tolls;
    return { distanceKm, fuelLiters, fuelCost, tollCost: tolls, totalCost };
  } catch (e) {
    console.error('Failed to calculate fuel cost:', e);
    return { distanceKm: 0, fuelLiters: 0, fuelCost: 0, tollCost: tolls, totalCost: tolls };
  }
};
