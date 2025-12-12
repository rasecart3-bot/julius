import React from 'react';
import TemperatureConverter from './TemperatureConverter';
import HeatCapacitySim from './HeatCapacitySim';
import FirstLawSim from './FirstLawSim';
import SecondLawSim from './SecondLawSim';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="text-left">
        <h3 className="text-lg font-bold text-accent mb-2">{title}</h3>
        <div className="space-y-2 text-text-secondary text-sm">{children}</div>
    </div>
);

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 transform transition-all flex flex-col border border-gray-700 animate-scale-up"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-accent">Fundamentos de Termodinámica</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="py-4 space-y-6 overflow-y-auto">
                    <InfoSection title="¿Qué es la Termodinámica?">
                        <p>
                            La termodinámica es la rama de la física que estudia la energía, el calor, el trabajo y sus transformaciones. Se enfoca en las relaciones entre estas cantidades y las propiedades macroscópicas de la materia, como la temperatura, la presión y el volumen. Es fundamental para entender motores, refrigeradores, reacciones químicas y casi cualquier proceso que involucre transferencia de energía.
                        </p>
                    </InfoSection>

                    <InfoSection title="Escalas de Temperatura">
                        <p>
                            La temperatura es una medida de la energía cinética promedio de las partículas de un sistema. Existen varias escalas para medirla:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong className="text-text-primary">Celsius (°C):</strong> Comúnmente usada en la vida diaria. El punto de congelación del agua es 0 °C y el de ebullición es 100 °C.</li>
                            <li><strong className="text-text-primary">Kelvin (K):</strong> La escala absoluta usada en ciencia. Su punto cero (0 K) es el cero absoluto, la temperatura más baja posible. <strong>Conversión: K = °C + 273.15</strong>.</li>
                            <li><strong className="text-text-primary">Fahrenheit (°F):</strong> Usada principalmente en Estados Unidos. El agua se congela a 32 °F y hierve a 212 °F.</li>
                        </ul>
                        <TemperatureConverter />
                    </InfoSection>

                    <InfoSection title="Capacidad Calorífica">
                        <p>
                            La capacidad calorífica (C) es la cantidad de calor necesaria para aumentar la temperatura de una sustancia en una unidad (ej. un grado Celsius).
                        </p>
                         <ul className="list-disc list-inside space-y-1">
                            <li><strong className="text-text-primary">Calor Específico (c):</strong> Es la capacidad calorífica por unidad de masa (J/kg·K). Es una propiedad intrínseca de cada material.</li>
                            <li><strong className="text-text-primary">Capacidad a Presión Constante (c_p):</strong> Mide el calor necesario para aumentar la temperatura cuando la presión del sistema se mantiene constante.</li>
                            <li><strong className="text-text-primary">Capacidad a Volumen Constante (c_v):</strong> Mide el calor necesario cuando el volumen se mantiene constante. Toda la energía se convierte en energía interna.</li>
                        </ul>
                        <HeatCapacitySim />
                    </InfoSection>

                    <InfoSection title="Leyes de la Termodinámica">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-text-primary">Ley Cero</h4>
                                <p>Si dos sistemas están por separado en equilibrio térmico con un tercero, entonces están en equilibrio térmico entre sí. Define el concepto de temperatura.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary">Primera Ley (Conservación de la Energía)</h4>
                                <p>La energía no se crea ni se destruye, solo se transforma. El cambio en la energía interna de un sistema (ΔU) es igual al calor neto que se le transfiere (Q) menos el trabajo neto que hace (W). <strong>Fórmula: ΔU = Q - W</strong>.</p>
                                <FirstLawSim />
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary">Segunda Ley (Entropía)</h4>
                                <p>Establece que la entropía total de un sistema aislado siempre tiende a aumentar. Esto define la "flecha del tiempo" para los procesos físicos y explica por qué el calor fluye de cuerpos calientes a fríos.</p>
                                <SecondLawSim />
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary">Tercera Ley</h4>
                                <p>Afirma que es imposible alcanzar el cero absoluto (0 K) mediante un número finito de pasos. A medida que un sistema se acerca al cero absoluto, su entropía se aproxima a un valor mínimo constante.</p>
                            </div>
                        </div>
                    </InfoSection>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;