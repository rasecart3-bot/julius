import React, { useState } from 'react';

const FirstLawSim: React.FC = () => {
    const [heat, setHeat] = useState(50); // Q
    const [work, setWork] = useState(20); // W
    
    const deltaU = heat - work;

    return (
         <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-background">
            <p className="text-sm font-semibold text-center mb-3">Simulador: ΔU = Q - W</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary">Calor Añadido al Sistema (Q): {heat} J</label>
                    <input type="range" min="-100" max="100" value={heat} onChange={e => setHeat(parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent" />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-text-secondary">Trabajo Hecho por el Sistema (W): {work} J</label>
                    <input type="range" min="-100" max="100" value={work} onChange={e => setWork(parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent" />
                </div>
                <div className="text-center bg-gray-800 p-3 rounded-lg shadow-inner">
                    <p className="text-sm text-text-secondary">Cambio en Energía Interna (ΔU)</p>
                    <p className={`text-2xl font-bold ${deltaU > 0 ? 'text-green-400' : deltaU < 0 ? 'text-red-400' : 'text-text-primary'}`}>
                        {deltaU} J
                    </p>
                    <p className="text-sm font-mono text-gray-500">{deltaU} = {heat} - {work}</p>
                </div>
            </div>
         </div>
    );
};
export default FirstLawSim;