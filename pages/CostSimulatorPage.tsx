import React, { useState } from 'react';
import { calculateFuelCost } from '../services/costService';
import { FuelCostOptions, FuelCostResult } from '../types';
import { COMPANY_BASE_ADDRESS } from '../constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CostSimulatorPage: React.FC = () => {
  const [formData, setFormData] = useState<FuelCostOptions>({
    destination: '',
    fuelPricePerLiter: 6,
    fuelEfficiencyKmPerLiter: 10,
    tolls: undefined,
    origin: COMPANY_BASE_ADDRESS,
  });
  const [result, setResult] = useState<FuelCostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'destination'
          ? value
          : value === ''
          ? undefined
          : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await calculateFuelCost(formData);
      setResult(res);
    } catch (err) {
      setError('Falha ao calcular custo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-neutral-dark">Simulador de Custo de Deslocamento (ida e volta)</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-xl">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-neutral-dark">Endereço de Destino *</label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            value={formData.destination}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="fuelPricePerLiter" className="block text-sm font-medium text-neutral-dark">Preço do Litro de Combustível (R$)</label>
          <input
            id="fuelPricePerLiter"
            name="fuelPricePerLiter"
            type="number"
            step="0.01"
            value={formData.fuelPricePerLiter}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="fuelEfficiencyKmPerLiter" className="block text-sm font-medium text-neutral-dark">Consumo Médio (km/L)</label>
          <input
            id="fuelEfficiencyKmPerLiter"
            name="fuelEfficiencyKmPerLiter"
            type="number"
            step="0.1"
            value={formData.fuelEfficiencyKmPerLiter}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="tolls" className="block text-sm font-medium text-neutral-dark">Pedágios (R$) opcional</label>
          <input
            id="tolls"
            name="tolls"
            type="number"
            step="0.01"
            value={formData.tolls ?? ''}
            onChange={handleChange}
            placeholder="Deixe em branco para cálculo automático"
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-neutral-dark">Origem</label>
          <input
            id="origin"
            name="origin"
            type="text"
            value={formData.origin}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm bg-neutral-light sm:text-sm"
          />
        </div>
        {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded">{error}</p>}
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" color="text-white" /> : 'Calcular'}
        </button>
      </form>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow max-w-xl space-y-2">
          <p><strong>Distância:</strong> {result.distanceKm.toFixed(2)} km</p>
          <p><strong>Combustível Necessário:</strong> {result.fuelLiters.toFixed(2)} L</p>
          <p><strong>Custo de Combustível:</strong> R$ {result.fuelCost.toFixed(2)}</p>
          <p><strong>Pedágios:</strong> R$ {result.tollCost.toFixed(2)}</p>
          <p className="font-semibold"><strong>Custo Total:</strong> R$ {result.totalCost.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default CostSimulatorPage;
