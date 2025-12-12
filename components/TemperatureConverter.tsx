import React, { useState } from 'react';

const format = (val: number | undefined) => val === undefined ? '' : parseFloat(val.toFixed(2)).toString();

const TemperatureConverter: React.FC = () => {
    const [celsius, setCelsius] = useState<string>('25');

    const handleCelsiusChange = (value: string) => {
        setCelsius(value);
    };
    
    const handleFahrenheitChange = (value: string) => {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) {
            setCelsius('');
        } else {
            setCelsius(format((numVal - 32) * 5 / 9));
        }
    };

    const handleKelvinChange = (value: string) => {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) {
            setCelsius('');
        } else {
            setCelsius(format(numVal - 273.15));
        }
    };
    
    const cNum = parseFloat(celsius);
    const fahrenheit = isNaN(cNum) ? '' : format(cNum * 9 / 5 + 32);
    const kelvin = isNaN(cNum) ? '' : format(cNum + 273.15);

    return (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-background">
            <p className="text-sm font-semibold text-center mb-3">Conversor Interactivo</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-text-secondary">Celsius (°C)</label>
                    <input type="number" value={celsius} onChange={(e) => handleCelsiusChange(e.target.value)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-text-primary shadow-sm focus:ring-accent focus:border-accent" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary">Fahrenheit (°F)</label>
                    <input type="number" value={fahrenheit} onChange={(e) => handleFahrenheitChange(e.target.value)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-text-primary shadow-sm focus:ring-accent focus:border-accent" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary">Kelvin (K)</label>
                    <input type="number" value={kelvin} onChange={(e) => handleKelvinChange(e.target.value)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-text-primary shadow-sm focus:ring-accent focus:border-accent" />
                </div>
            </div>
        </div>
    );
};
export default TemperatureConverter;