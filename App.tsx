import React, { useState, useCallback } from 'react';
import { Substance, StatePoint, Process, DiagramType, CycleType } from './types';
import { SUBSTANCES } from './constants';
import Controls from './components/Controls';
import ThermoDiagram from './components/ThermoDiagram';
import Results from './components/Results';
import ShareModal from './components/ShareModal';
import InfoModal from './components/InfoModal';
import { calculateStateProperties, calculateProcess, calculateCycle } from './services/thermoService';

const App: React.FC = () => {
    const [substance, setSubstance] = useState<Substance>(SUBSTANCES['Agua']);
    const [states, setStates] = useState<StatePoint[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [cycleResults, setCycleResults] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [diagramType, setDiagramType] = useState<DiagramType>('T-s');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const clearError = () => setError(null);

    const handleReset = useCallback(() => {
        setStates([]);
        setProcesses([]);
        setCycleResults(null);
        clearError();
    }, []);

    const handleAddState = (properties: { prop1: string, value1: number, unit1: string, prop2: string, value2: number, unit2: string }) => {
        clearError();
        try {
            const newState = calculateStateProperties(substance, properties);
            if (states.length >= 10) {
                 setStates(prev => [...prev.slice(1), { ...newState, name: `Estado ${states.length + 1}` }]);
            } else {
                 setStates(prev => [...prev, { ...newState, name: `Estado ${states.length + 1}` }]);
            }
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleAddProcess = (startStateIndex: number, processType: string, endCondition: { prop: string, value: number }) => {
        clearError();
        if (startStateIndex < 0 || startStateIndex >= states.length) {
            setError("Estado inicial inválido para el proceso.");
            return;
        }
        try {
            const startState = states[startStateIndex];
            const { endState, processData } = calculateProcess(substance, startState, processType, endCondition);
            
            const finalEndState = { ...endState, name: `Estado ${states.length + 1}` };
            setStates(prev => [...prev, finalEndState]);
            setProcesses(prev => [...prev, { start: startState, end: finalEndState, type: processType, ...processData }]);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleCalculateCycle = (cycleType: CycleType, params: any) => {
        clearError();
        handleReset();
        try {
            const { states: cycleStates, processes: cycleProcesses, results } = calculateCycle(substance, cycleType, params);
            setStates(cycleStates);
            setProcesses(cycleProcesses);
            setCycleResults(results);
        } catch (e) {
            setError((e as Error).message);
        }
    };
    
    const handleSubstanceChange = (substanceName: string) => {
        handleReset();
        setSubstance(SUBSTANCES[substanceName]);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
             <header className="sticky top-0 z-10 bg-primary/80 backdrop-blur-sm border-b border-gray-700 shadow-xl p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-wider text-white">Simulador Termodinámico</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="bg-accent/80 hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md transform hover:scale-105"
                        aria-label="Ver fundamentos de termodinámica"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span className="hidden sm:inline">Fundamentos</span>
                    </button>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="bg-accent/80 hover:bg-accent text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md transform hover:scale-105"
                        aria-label="Compartir simulador"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span className="hidden sm:inline">Compartir</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
                <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
                    <Controls
                        substance={substance}
                        onSubstanceChange={handleSubstanceChange}
                        onAddState={handleAddState}
                        onAddProcess={handleAddProcess}
                        onCalculateCycle={handleCalculateCycle}
                        onReset={handleReset}
                        states={states}
                        setError={setError}
                    />
                </div>

                <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-4">
                    <div className="bg-surface rounded-xl shadow-2xl p-4 flex-grow border border-gray-700/50">
                        <div className="flex justify-center mb-4">
                            <select
                                value={diagramType}
                                onChange={(e) => setDiagramType(e.target.value as DiagramType)}
                                className="p-2 border border-gray-600 rounded-lg bg-gray-800 text-text-primary shadow-sm focus:ring-accent focus:border-accent transition-colors"
                            >
                                <option value="T-s">Diagrama T-s</option>
                                <option value="P-v">Diagrama P-v</option>
                                <option value="P-h">Diagrama P-h</option>
                                <option value="h-s">Diagrama h-s (Mollier)</option>
                            </select>
                        </div>
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <ThermoDiagram
                            substance={substance}
                            states={states}
                            processes={processes}
                            diagramType={diagramType}
                        />
                    </div>
                     <div className="bg-surface rounded-xl shadow-2xl p-4 border border-gray-700/50">
                        <Results states={states} processes={processes} cycleResults={cycleResults} />
                    </div>
                </div>
            </main>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
        </div>
    );
};

export default App;