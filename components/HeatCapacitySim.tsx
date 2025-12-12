import React, { useState } from 'react';

const materials = {
    'Agua': { c: 4.184, color: 'bg-blue-500' },
    'Cobre': { c: 0.385, color: 'bg-orange-500' },
    'Aire': { c: 1.005, color: 'bg-slate-400' }
};
type Material = keyof typeof materials;

const HeatCapacitySim: React.FC = () => {
    const [heat, setHeat] = useState(100); // in kJ
    const [material, setMaterial] = useState<Material>('Agua');
    const mass = 1; // kg
    const initialTemp = 20; // °C

    const deltaT = heat / (mass * materials[material].c);
    const finalTemp = initialTemp + deltaT;
    const thermometerHeight = Math.min(100, (finalTemp / 1.5)); // scale for visualization

    return (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-background">
            <p className="text-sm font-semibold text-center mb-3">Simulador de Calor Específico</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Material (1 kg)</label>
                        <select value={material} onChange={e => setMaterial(e.target.value as Material)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-text-primary shadow-sm focus:ring-accent focus:border-accent">
                            {Object.keys(materials).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Calor Añadido (Q): {heat} kJ</label>
                        <input type="range" min="0" max="1000" value={heat} onChange={e => setHeat(parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent" />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg shadow-inner">
                    <div className="text-center mb-4">
                         <p className="text-sm font-medium text-text-secondary">Temperatura Final</p>
                         <p className="font-bold text-3xl text-accent">{finalTemp.toFixed(1)} °C</p>
                         <p className="text-xs text-text-secondary">(Temp. Inicial: {initialTemp}°C)</p>
                    </div>
                    <div className="w-10 h-40 bg-gray-700 rounded-full flex items-end overflow-hidden border border-gray-600">
                        <div 
                            className="w-full bg-gradient-to-t from-orange-500 to-red-600 rounded-full transition-all duration-300"
                            style={{ height: `${thermometerHeight}%` }}
                        ></div>
                    </div>
                    <div className={`w-24 h-12 rounded-lg mt-4 flex items-center justify-center text-white font-bold text-sm shadow-md ${materials[material].color}`}>
                        {material}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HeatCapacitySim;