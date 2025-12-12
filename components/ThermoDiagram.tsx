import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter, ZAxis, Label, ReferenceDot } from 'recharts';
import type { Substance, StatePoint, Process, DiagramType, SaturationPoint } from '../types';

interface ThermoDiagramProps {
    substance: Substance;
    states: StatePoint[];
    processes: Process[];
    diagramType: DiagramType;
}

const ThermoDiagram: React.FC<ThermoDiagramProps> = ({ substance, states, processes, diagramType }) => {
    const getAxisKeys = () => {
        switch (diagramType) {
            case 'T-s': return { x: 's', y: 'T', xUnit: 'kJ/kg·K', yUnit: '°C' };
            case 'P-v': return { x: 'v', y: 'P', xUnit: 'm³/kg', yUnit: 'kPa' };
            case 'P-h': return { x: 'h', y: 'P', xUnit: 'kJ/kg', yUnit: 'kPa' };
            case 'h-s': return { x: 's', y: 'h', xUnit: 'kJ/kg·K', yUnit: 'kJ/kg' };
            default: return { x: 's', y: 'T', xUnit: 'kJ/kg·K', yUnit: '°C' };
        }
    };
    
    const propFullNames: { [key: string]: string } = {
        's': 'Entropía',
        'T': 'Temperatura',
        'v': 'Volumen esp.',
        'P': 'Presión',
        'h': 'Entalpía',
    };


    const { x: xKey, y: yKey, xUnit, yUnit } = getAxisKeys();
    const xLabel = propFullNames[xKey] || xKey.toUpperCase();
    const yLabel = propFullNames[yKey] || yKey.toUpperCase();


    let satLiquidLine: any[] = [];
    let satVaporLine: any[] = [];
    if(substance.saturationData) {
        satLiquidLine = substance.saturationData.map(p => ({
            [xKey]: p[`${xKey[0]}f` as keyof SaturationPoint],
            [yKey]: yKey === 'h' ? p.hf : p[yKey as 'P' | 'T']
        }));
        satVaporLine = substance.saturationData.map(p => ({
            [xKey]: p[`${xKey[0]}g` as keyof SaturationPoint],
            [yKey]: yKey === 'h' ? p.hg : p[yKey as 'P' | 'T']
        })).reverse();
    }
    const domeData = [...satLiquidLine, ...satVaporLine];

    const allPoints = [
      ...states, 
      ...domeData.filter(p => isFinite(p[xKey]) && isFinite(p[yKey])),
      ...processes.flatMap(p => [p.start, p.end])
    ];

    const getDomain = (key: keyof StatePoint) => {
      const values = allPoints.map(p => p[key]).filter(v => typeof v === 'number' && isFinite(v)) as number[];
      if (values.length === 0) return ['auto', 'auto'];
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (min === max) return [min * 0.9, max * 1.1];
      const padding = (max - min) * 0.15; // Increased padding for labels
      return [min - padding, max + padding];
    };
    
    const xDomain = getDomain(xKey as keyof StatePoint);
    const yDomain = getDomain(yKey as keyof StatePoint);

    const legendFormatter = (value: string) => {
        return <span className="text-text-secondary" style={{ margin: '0 15px' }}>{value}</span>;
    };


    return (
        <div style={{ width: '100%', height: '50vh', minHeight: '400px' }}>
            <ResponsiveContainer>
                <LineChart margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                        type="number" 
                        dataKey={xKey}
                        domain={xDomain}
                        tickFormatter={(tick) => tick.toPrecision(3)}
                        allowDataOverflow={true}
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8" }}
                    >
                      <Label value={`${xLabel} (${xUnit})`} offset={-25} position="insideBottom" fill="#94a3b8" />
                    </XAxis>
                    <YAxis 
                        type="number"
                        dataKey={yKey}
                        domain={yDomain}
                        tickFormatter={(tick) => tick.toPrecision(4)}
                        scale={yKey === 'P' ? 'log' : 'linear'}
                        allowDataOverflow={true}
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8" }}
                    >
                        <Label value={`${yLabel} (${yUnit})`} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#94a3b8" />
                    </YAxis>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value, name) => [`${(value as number).toPrecision(4)}`, name]}
                        labelFormatter={(label) => `${xKey}: ${label.toPrecision(4)}`}
                    />
                    <Legend 
                        verticalAlign="bottom"
                        formatter={legendFormatter}
                        wrapperStyle={{ color: '#f8fafc', paddingTop: '40px' }}
                    />

                    {substance.type === 'real' && domeData.length > 0 && (
                        <Line type="monotone" data={domeData} dataKey={yKey} stroke="#d946ef" name="Domo de Saturación" dot={false} strokeWidth={2.5} />
                    )}

                    {processes.map((process, index) => (
                        <Line
                            key={`process-${index}`}
                            type="linear"
                            data={[process.start, process.end]}
                            dataKey={yKey}
                            stroke="#f59e0b"
                            strokeWidth={3}
                            name={`Proceso ${process.start.name}→${process.end.name}`}
                            dot={false}
                            legendType="none"
                        />
                    ))}

                    <Scatter name="Estados" data={states} fill="#10b981" legendType='none' />
                      
                    {states.map((state, index) => (
                        <ReferenceDot 
                            key={`dot-${index}`}
                            x={state[xKey as keyof StatePoint] as number}
                            y={state[yKey as keyof StatePoint] as number}
                            r={6}
                            fill="#10b981"
                            stroke="#1e293b"
                            strokeWidth={2}
                        >
                            <Label 
                                value={state.name} 
                                position={index % 2 === 0 ? 'top' : 'bottom'} 
                                offset={12} 
                                fill="#f8fafc" 
                                fontSize={12}
                                style={{ pointerEvents: 'none' }}
                            />
                        </ReferenceDot>
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ThermoDiagram;