import React from 'react';
import { StatePoint, Process } from '../types';

interface ResultsProps {
    states: StatePoint[];
    processes: Process[];
    cycleResults: any | null;
}

const formatValue = (value: number | null | undefined, precision: number = 4) => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    if (Math.abs(value) < 1e-4 && value !== 0) return value.toExponential(2);
    return value.toPrecision(precision);
};

const Results: React.FC<ResultsProps> = ({ states, processes, cycleResults }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-accent border-b border-gray-700 pb-2">Resultados</h2>

            {cycleResults && (
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Resumen del Ciclo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-900/50 to-surface p-4 rounded-lg text-center border border-blue-700/50">
                            <div className="text-sm text-blue-300">Trabajo Neto</div>
                            <div className="text-2xl font-bold text-white">{formatValue(cycleResults.W_net)}</div>
                             <div className="text-xs text-blue-400">kJ/kg</div>
                        </div>
                         <div className="bg-gradient-to-br from-green-900/50 to-surface p-4 rounded-lg text-center border border-green-700/50">
                             <div className="text-sm text-green-300">Calor Entrada</div>
                            <div className="text-2xl font-bold text-white">{formatValue(cycleResults.Q_in)}</div>
                            <div className="text-xs text-green-400">kJ/kg</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/50 to-surface p-4 rounded-lg text-center border border-red-700/50">
                             <div className="text-sm text-red-300">Calor Salida</div>
                             <div className="text-2xl font-bold text-white">{formatValue(cycleResults.Q_out)}</div>
                             <div className="text-xs text-red-400">kJ/kg</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/50 to-surface p-4 rounded-lg text-center border border-purple-700/50">
                             <div className="text-sm text-purple-300">Eficiencia</div>
                            <div className="text-2xl font-bold text-white">{formatValue(cycleResults.efficiency * 100, 3)}</div>
                            <div className="text-xs text-purple-400">%</div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Propiedades de Estado</h3>
                <p className="text-xs text-text-secondary mb-3 italic">
                    <b>P</b>: Presión, <b>T</b>: Temperatura, <b>v</b>: Volumen esp., <b>u</b>: Energía int., <b>h</b>: Entalpía, <b>s</b>: Entropía, <b>x</b>: Calidad
                </p>
                <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                    <table className="min-w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-gray-300 uppercase bg-surface/50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Estado</th>
                                <th scope="col" className="px-4 py-3">P (kPa)</th>
                                <th scope="col" className="px-4 py-3">T (°C)</th>
                                <th scope="col" className="px-4 py-3">v (m³/kg)</th>
                                <th scope="col" className="px-4 py-3">u (kJ/kg)</th>
                                <th scope="col" className="px-4 py-3">h (kJ/kg)</th>
                                <th scope="col" className="px-4 py-3">s (kJ/kg·K)</th>
                                <th scope="col" className="px-4 py-3">Calidad (x)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.map((state, index) => (
                                <tr key={index} className="bg-surface border-t border-gray-700/50 odd:bg-surface/50 hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-text-primary">{state.name}</td>
                                    <td className="px-4 py-3">{formatValue(state.P)}</td>
                                    <td className="px-4 py-3">{formatValue(state.T)}</td>
                                    <td className="px-4 py-3">{formatValue(state.v)}</td>
                                    <td className="px-4 py-3">{formatValue(state.u)}</td>
                                    <td className="px-4 py-3">{formatValue(state.h)}</td>
                                    <td className="px-4 py-3">{formatValue(state.s)}</td>
                                    <td className="px-4 py-3">{formatValue(state.x, 3) ?? '--'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {states.length === 0 && <p className="text-center text-text-secondary py-4">No hay estados definidos.</p>}
            </div>

            {processes.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Análisis de Procesos</h3>
                     <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                        <table className="min-w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs text-gray-300 uppercase bg-surface/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Proceso</th>
                                    <th scope="col" className="px-4 py-3">Tipo</th>
                                    <th scope="col" className="px-4 py-3">Trabajo (kJ/kg)</th>
                                    <th scope="col" className="px-4 py-3">Calor (kJ/kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                               {processes.map((p, i) => (
                                   <tr key={i} className="bg-surface border-t border-gray-700/50 odd:bg-surface/50 hover:bg-gray-700/50 transition-colors">
                                       <td className="px-4 py-3 font-medium text-text-primary">{`${p.start.name} → ${p.end.name}`}</td>
                                       <td className="px-4 py-3">{p.type}</td>
                                       <td className="px-4 py-3">{formatValue(p.W)}</td>
                                       <td className="px-4 py-3">{formatValue(p.Q)}</td>
                                   </tr>
                               ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;