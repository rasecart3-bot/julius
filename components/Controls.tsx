import React, { useState, useEffect } from 'react';
import { SUBSTANCES, VALID_PROPERTY_PAIRS, PROPERTY_OPTIONS } from '../constants';
import { Substance, StatePoint, CycleType } from '../types';

interface ControlsProps {
    substance: Substance;
    onSubstanceChange: (name: string) => void;
    onAddState: (properties: { prop1: string, value1: number, unit1: string, prop2: string, value2: number, unit2: string }) => void;
    onAddProcess: (startStateIndex: number, processType: string, endCondition: { prop: string, value: number }) => void;
    onCalculateCycle: (cycleType: CycleType, params: any) => void;
    onReset: () => void;
    states: StatePoint[];
    setError: (message: string | null) => void;
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; disabled?: boolean }> = ({ label, value, onChange, type = "number", disabled = false }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-800/50 disabled:cursor-not-allowed transition-colors"
                step="any"
                disabled={disabled}
            />
        </div>
    </div>
);

const UnitSelector: React.FC<{ property: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ property, value, onChange }) => {
    const commonClasses = "w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent transition-colors";
    if (property === 'P') {
        return (
             <select value={value} onChange={onChange} className={commonClasses} title="Seleccionar unidad de presión">
                <option value="kPa">kPa</option>
                <option value="bar">bar</option>
                <option value="atm">atm</option>
            </select>
        );
    }
    if (property === 'T') {
        return (
             <select value={value} onChange={onChange} className={commonClasses} title="Seleccionar unidad de temperatura">
                <option value="°C">°C</option>
                <option value="K">K</option>
            </select>
        );
    }
    return <div className="h-10"></div>; // Placeholder for alignment
};


const Controls: React.FC<ControlsProps> = ({ substance, onSubstanceChange, onAddState, onAddProcess, onCalculateCycle, onReset, states, setError }) => {
    const [activeTab, setActiveTab] = useState<'state' | 'process' | 'cycle'>('state');

    // State for "Define State"
    const [prop1, setProp1] = useState('P');
    const [value1, setValue1] = useState('');
    const [unit1, setUnit1] = useState('kPa');
    const [prop2, setProp2] = useState('T');
    const [value2, setValue2] = useState('');
    const [unit2, setUnit2] = useState('°C');

    // State for "Define Process"
    const [startState, setStartState] = useState('0');
    const [processType, setProcessType] = useState('isobaric');
    const [endProp, setEndProp] = useState('T');
    const [endValue, setEndValue] = useState('');

    // State for "Simulate Cycle"
    const [cycleType, setCycleType] = useState<CycleType>('Rankine');
    const [cycleParams, setCycleParams] = useState({
        p_high: '3000',
        p_low: '10',
        pressure_ratio: '8',
        t_min_c: '25',
        t_max_c: '1200'
    });
    
    useEffect(() => {
        // Reset unit when property changes
        if (prop1 === 'P') setUnit1('kPa');
        else if (prop1 === 'T') setUnit1('°C');
        else setUnit1('');
    }, [prop1]);

    useEffect(() => {
        // Reset unit when property changes
        if (prop2 === 'P') setUnit2('kPa');
        else if (prop2 === 'T') setUnit2('°C');
        else setUnit2('');
    }, [prop2]);


    useEffect(() => {
        if (substance.type === 'idealGas') {
            setProp1('P');
            setProp2('T');
        } else {
            const validPartners = VALID_PROPERTY_PAIRS[prop1] || [];
            if (!validPartners.includes(prop2)) {
                setProp2(validPartners[0] || '');
            }
        }
    }, [prop1, prop2, substance.type]);
    
    const handleCycleParamChange = (param: keyof typeof cycleParams, value: string) => {
        setCycleParams(prev => ({...prev, [param]: value}));
    };

    const handleAddStateClick = () => {
        if (!value1 || !value2) {
            setError("Por favor, complete ambos valores de propiedad.");
            return;
        }
        if (prop1 === prop2) {
            setError("Por favor, seleccione dos propiedades diferentes.");
            return;
        }
        onAddState({ prop1, value1: parseFloat(value1), unit1, prop2, value2: parseFloat(value2), unit2 });
        setValue1('');
        setValue2('');
    };
    
    const handleAddProcessClick = () => {
        if (states.length === 0) {
            setError("Añada al menos un estado antes de definir un proceso.");
            return;
        }
        if (!endValue) {
            setError("Por favor, proporcione un valor para la condición final del proceso.");
            return;
        }
        onAddProcess(parseInt(startState), processType, { prop: endProp, value: parseFloat(endValue) });
        setEndValue('');
    };

    const handleCalculateCycleClick = () => {
        let params: any = {};
        if (cycleType === 'Rankine') {
            params = { p_high: parseFloat(cycleParams.p_high), p_low: parseFloat(cycleParams.p_low) };
        } else if (cycleType === 'Brayton') {
            params = { pressure_ratio: parseFloat(cycleParams.pressure_ratio), t_min_c: parseFloat(cycleParams.t_min_c), t_max_c: parseFloat(cycleParams.t_max_c) };
        } else if (cycleType === 'Carnot') {
            params = { t_min_c: parseFloat(cycleParams.t_min_c), t_max_c: parseFloat(cycleParams.t_max_c) };
        }

        if (Object.values(params).some(v => isNaN(v as number))) {
            setError("Por favor, proporcione parámetros numéricos válidos para el ciclo.");
            return;
        }
        onCalculateCycle(cycleType, params);
    };

    const renderStateInputs = () => {
        const isIdealGas = substance.type === 'idealGas';
        const prop1Options = isIdealGas ? ['P', 'T'] : ['P', 'T', 'x', 's'];
        const prop2Options = isIdealGas 
            ? (prop1 === 'P' ? ['T'] : ['P'])
            : (VALID_PROPERTY_PAIRS[prop1] || []).filter(p => p !== prop1);

        return (
            <div className="space-y-4">
                <p className="text-xs text-text-secondary italic pb-2">
                    Defina un punto termodinámico especificando dos propiedades independientes.
                </p>
                <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-text-secondary mb-1">Propiedad 1</label>
                        <select value={prop1} onChange={e => setProp1(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent">
                            {prop1Options.map(p => <option key={p} value={p}>{PROPERTY_OPTIONS[p]}</option>)}
                        </select>
                    </div>
                    <InputField label="Valor 1" value={value1} onChange={e => setValue1(e.target.value)} />
                    <div className="flex flex-col">
                         <label className="text-sm font-medium text-text-secondary mb-1">Unidad</label>
                         <UnitSelector property={prop1} value={unit1} onChange={e => setUnit1(e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-text-secondary mb-1">Propiedad 2</label>
                        <select value={prop2} onChange={e => setProp2(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent">
                            {prop2Options.map(p => <option key={p} value={p}>{PROPERTY_OPTIONS[p]}</option>)}
                        </select>
                    </div>
                    <InputField label="Valor 2" value={value2} onChange={e => setValue2(e.target.value)} />
                    <div className="flex flex-col">
                         <label className="text-sm font-medium text-text-secondary mb-1">Unidad</label>
                         <UnitSelector property={prop2} value={unit2} onChange={e => setUnit2(e.target.value)} />
                    </div>
                </div>
                <button onClick={handleAddStateClick} className="w-full bg-gradient-to-r from-accent to-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md transform hover:-translate-y-0.5">Añadir Estado</button>
            </div>
        );
    };
    
    const renderProcessInputs = () => {
        const isProcessDisabled = states.length === 0;
        const processOptions: { [key: string]: string } = {
            'isobaric': 'Isobárico (P constante)',
            'isothermal': 'Isotérmico (T constante)',
            'isochoric': 'Isocórico (v constante)',
            'isentropic': 'Isentrópico (s constante)'
        };
        const propOptions = substance.type === 'real' 
            ? ['P', 'T', 'v', 'h', 's', 'x'] 
            : ['P', 'T', 'v'];
            
        return (
             <div className="space-y-4">
                {isProcessDisabled && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-3 rounded-lg">
                        <p className="text-sm">
                            Primero debe añadir al menos un estado para poder definir un proceso.
                        </p>
                    </div>
                )}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-1">Estado Inicial</label>
                    <select value={startState} onChange={e => setStartState(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-800/50 disabled:cursor-not-allowed" disabled={isProcessDisabled}>
                        {states.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-1">Tipo de Proceso</label>
                    <select value={processType} onChange={e => setProcessType(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-800/50 disabled:cursor-not-allowed" disabled={isProcessDisabled}>
                        {Object.entries(processOptions).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-text-secondary mb-1">Prop. Final</label>
                        <select value={endProp} onChange={e => setEndProp(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-800/50 disabled:cursor-not-allowed" disabled={isProcessDisabled}>
                            {propOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <InputField label={`Valor Final (${endProp})`} value={endValue} onChange={e => setEndValue(e.target.value)} disabled={isProcessDisabled} />
                </div>
                <button onClick={handleAddProcessClick} className="w-full bg-gradient-to-r from-accent to-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:-translate-y-0.5" disabled={isProcessDisabled}>Añadir Proceso</button>
            </div>
        );
    };

    const renderCycleInputs = () => (
        <div className="space-y-4">
             <div className="flex flex-col">
                <label className="text-sm font-medium text-text-secondary mb-1">Tipo de Ciclo</label>
                <select value={cycleType} onChange={e => setCycleType(e.target.value as CycleType)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent">
                    <option value="Rankine">Rankine (Agua)</option>
                    <option value="Brayton">Brayton (Aire)</option>
                    <option value="Carnot">Carnot (Vapor)</option>
                </select>
            </div>
            {cycleType === 'Rankine' && (
                <>
                    <InputField label="Presión Alta (kPa)" value={cycleParams.p_high} onChange={e => handleCycleParamChange('p_high', e.target.value)} />
                    <InputField label="Presión Baja (kPa)" value={cycleParams.p_low} onChange={e => handleCycleParamChange('p_low', e.target.value)} />
                </>
            )}
            {cycleType === 'Brayton' && (
                <>
                    <InputField label="Relación de Presión" value={cycleParams.pressure_ratio} onChange={e => handleCycleParamChange('pressure_ratio', e.target.value)} />
                    <InputField label="Temperatura Mínima (°C)" value={cycleParams.t_min_c} onChange={e => handleCycleParamChange('t_min_c', e.target.value)} />
                    <InputField label="Temperatura Máxima (°C)" value={cycleParams.t_max_c} onChange={e => handleCycleParamChange('t_max_c', e.target.value)} />
                </>
            )}
             {cycleType === 'Carnot' && (
                <>
                    <InputField label="Temperatura Alta (°C)" value={cycleParams.t_max_c} onChange={e => handleCycleParamChange('t_max_c', e.target.value)} />
                    <InputField label="Temperatura Baja (°C)" value={cycleParams.t_min_c} onChange={e => handleCycleParamChange('t_min_c', e.target.value)} />
                </>
            )}
            <button onClick={handleCalculateCycleClick} className="w-full bg-gradient-to-r from-accent to-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md transform hover:-translate-y-0.5">Calcular Ciclo</button>
        </div>
    );
    
    return (
        <div className="bg-surface rounded-xl shadow-2xl p-4 space-y-4 border border-gray-700/50">
            <div className="flex flex-col">
                <label htmlFor="substance-select" className="text-sm font-medium text-text-secondary mb-1">Sustancia de Trabajo</label>
                <select id="substance-select" value={substance.name} onChange={e => onSubstanceChange(e.target.value)} className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-2 focus:ring-accent focus:border-accent transition-colors">
                    {Object.keys(SUBSTANCES).map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <div>
                <div className="relative border-b-2 border-gray-700">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('state')} className={`${activeTab === 'state' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'} py-2 px-4 font-medium text-sm transition-colors z-10`}>Estado</button>
                        <button onClick={() => setActiveTab('process')} className={`${activeTab === 'process' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'} py-2 px-4 font-medium text-sm transition-colors z-10`}>Proceso</button>
                        <button onClick={() => setActiveTab('cycle')} className={`${activeTab === 'cycle' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'} py-2 px-4 font-medium text-sm transition-colors z-10`}>Ciclo</button>
                    </nav>
                     <div className={`absolute bottom-[-2px] h-0.5 bg-accent transition-all duration-300 ease-in-out ${activeTab === 'state' ? 'left-0 w-20' : activeTab === 'process' ? 'left-[88px] w-24' : 'left-[184px] w-20'}`}></div>
                </div>
            </div>

            <div className="pt-4">
                {activeTab === 'state' && renderStateInputs()}
                {activeTab === 'process' && renderProcessInputs()}
                {activeTab === 'cycle' && renderCycleInputs()}
            </div>
            
            <hr className="border-gray-700" />

            <button onClick={onReset} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md transform hover:-translate-y-0.5">Reiniciar Simulación</button>
        </div>
    );
};

export default Controls;