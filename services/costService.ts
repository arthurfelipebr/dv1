import { COMPANY_BASE_ADDRESS, COMPANY_BASE_COORDS } from '../constants';
import { Coordinates } from '../types';

export interface FuelCostOptions {
  destination: string;
  fuelPricePerLiter: number; // Cost of fuel per liter (BRL)
  fuelEfficiencyKmPerLiter: number; // Vehicle efficiency
  tolls?: number; // Optional manual override for toll cost
  origin?: string; // Optional override of origin address
  roundTrip?: boolean; // Whether to consider round-trip distance
}

export interface FuelCostResult {
  distanceKm: number;
  fuelLiters: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
}

const knownAddresses: Record<string, Coordinates> = {
  [COMPANY_BASE_ADDRESS.toLowerCase()]: COMPANY_BASE_COORDS,
};

const haversineDistanceKm = (from: Coordinates, to: Coordinates): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const geocodeAddress = async (address: string): Promise<Coordinates> => {
  const key = address.trim().toLowerCase();
  if (knownAddresses[key]) return knownAddresses[key];

  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { 'User-Agent': 'ArchiEng Dashboard' }
    });
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Address not found');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    console.error('Geocoding error:', err);
    throw err;
  }
};

const getDrivingDistanceKm = async (from: Coordinates, to: Coordinates): Promise<number> => {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ArchiEng Dashboard' } });
    if (!res.ok) throw new Error('Routing failed');
    const data = await res.json();
    if (!data.routes || !data.routes[0]) throw new Error('Route not found');
    return data.routes[0].distance / 1000; // meters to km
  } catch (err) {
    console.warn('Routing API failed, using straight-line distance');
    return haversineDistanceKm(from, to);
  }
};

const fetchTollCost = async (from: Coordinates, to: Coordinates): Promise<number> => {
  const apiKey = process.env.TOLLGURU_API_KEY;
  if (!apiKey) return 0;

  try {
    const body = {
      from: { lat: from.lat, lng: from.lon },
      to: { lat: to.lat, lng: to.lon },
      vehicleType: '2AxlesAuto'
    };

    const res = await fetch('https://api.tollguru.com/v1/calc/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Toll API failed');
    const data = await res.json();
    return data.route?.costs?.tag || data.route?.costs?.cash || 0;
  } catch (err) {
    console.error('Failed to fetch toll cost:', err);
    return 0;
  }
};

export const calculateFuelCost = async (options: FuelCostOptions): Promise<FuelCostResult> => {
  const originAddress = options.origin || COMPANY_BASE_ADDRESS;

  try {
    const [originCoords, destCoords] = await Promise.all([
      geocodeAddress(originAddress),
      geocodeAddress(options.destination)
    ]);
    const distanceOneWayKm = await getDrivingDistanceKm(originCoords, destCoords);
    const distanceKm = distanceOneWayKm * (options.roundTrip === false ? 1 : 2);

    const fuelLiters = distanceKm / options.fuelEfficiencyKmPerLiter;
    const fuelCost = fuelLiters * options.fuelPricePerLiter;

    let tollCost = options.tolls ?? 0;
    if (options.tolls === undefined) {
      tollCost = (await fetchTollCost(originCoords, destCoords)) * (options.roundTrip === false ? 1 : 2);
    }

    const totalCost = fuelCost + tollCost;
    return { distanceKm, fuelLiters, fuelCost, tollCost, totalCost };
  } catch (e) {
    console.error('Failed to calculate fuel cost:', e);
    return { distanceKm: 0, fuelLiters: 0, fuelCost: 0, tollCost: 0, totalCost: 0 };
  }
};
