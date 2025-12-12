import React, { useState, useMemo } from 'react';

const PARTICLE_COUNT = 30;

const SecondLawSim: React.FC = () => {
    const [isMixed, setIsMixed] = useState(false);
    const [key, setKey] = useState(0); // to force re-render and get new random positions

    const particles = useMemo(() => {
        return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
            id: i,
            // If not mixed, position in the left 50%. Otherwise, anywhere.
            left: `${Math.random() * (isMixed ? 98 : 48)}%`,
            top: `${Math.random() * 98}%`,
        }));
    }, [isMixed, key]);
    
    const handleReset = () => {
        setIsMixed(false);
        setKey(prev => prev + 1); // change key to re-calculate positions
    }

    return (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-background">
             <p className="text-sm font-semibold text-center mb-3">Visualización de Entropía</p>
             <div className="relative w-full h-40 bg-gray-800 border border-gray-600 rounded-md overflow-hidden">
                {/* Divider */}
                {!isMixed && <div className="absolute left-1/2 top-0 h-full w-px bg-gray-500"></div>}
                
                {/* Particles */}
                {particles.map(p => (
                    <div 
                        key={p.id} 
                        className="absolute w-2 h-2 bg-accent rounded-full transition-all duration-1000 ease-in-out"
                        style={{ left: p.left, top: p.top }}
                    ></div>
                ))}
             </div>
             <div className="flex justify-center gap-4 mt-3">
                <button onClick={() => setIsMixed(true)} disabled={isMixed} className="bg-accent text-white font-bold py-1 px-4 rounded-lg hover:bg-secondary transition-colors shadow-md disabled:bg-gray-600">
                    Quitar Divisor
                </button>
                 <button onClick={handleReset} className="bg-gray-600 text-white font-bold py-1 px-4 rounded-lg hover:bg-gray-700 transition-colors shadow-md">
                    Reiniciar
                </button>
             </div>
        </div>
    );
};
export default SecondLawSim;