import type { Substance, SaturationPoint } from './types';

// Simplified Saturation Table for Water (H2O)
// Data is illustrative and not exhaustive/precise
const WATER_SATURATION_DATA: SaturationPoint[] = [
    { P: 1.228, T: 10, vf: 0.001000, vg: 106.3, hf: 42.02, hg: 2519.2, sf: 0.1511, sg: 9.155, uf: 42.0, ug: 2388.7 },
    { P: 12.35, T: 50, vf: 0.001012, vg: 12.03, hf: 209.3, hg: 2591.3, sf: 0.7038, sg: 8.074, uf: 209.3, ug: 2442.9 },
    { P: 101.4, T: 100, vf: 0.001043, vg: 1.672, hf: 419.1, hg: 2675.6, sf: 1.3072, sg: 7.354, uf: 418.9, ug: 2506.0 },
    { P: 476.2, T: 150, vf: 0.001091, vg: 0.3925, hf: 632.1, hg: 2745.9, sf: 1.8418, sg: 6.836, uf: 631.6, ug: 2558.9 },
    { P: 1555, T: 200, vf: 0.001157, vg: 0.1272, hf: 852.2, hg: 2792.0, sf: 2.3307, sg: 6.430, uf: 850.4, ug: 2594.2 },
    { P: 3976, T: 250, vf: 0.001252, vg: 0.0500, hf: 1085.9, hg: 2801.0, sf: 2.7935, sg: 6.071, uf: 1080.8, ug: 2601.8 },
    { P: 8588, T: 300, vf: 0.001404, vg: 0.0216, hf: 1345.0, hg: 2749.6, sf: 3.2549, sg: 5.706, uf: 1332.9, ug: 2562.5 },
    { P: 22064, T: 373.9, vf: 0.003106, vg: 0.003106, hf: 2084.3, hg: 2084.3, sf: 4.4070, sg: 4.4070, uf: 2015.7, ug: 2015.7 } // Critical Point
];

// Simplified Saturation Table for R-134a
const R134A_SATURATION_DATA: SaturationPoint[] = [
    { P: 132.82, T: -20, vf: 0.000736, vg: 0.1473, hf: 174.07, hg: 386.56, sf: 0.9009, sg: 1.7413, uf: 173.97, ug: 367.04 },
    { P: 292.8, T: 0, vf: 0.000773, vg: 0.0692, hf: 200.0, hg: 398.59, sf: 1.0, sg: 1.7272, uf: 199.8, ug: 377.62 },
    { P: 572.07, T: 20, vf: 0.000816, vg: 0.0359, hf: 225.9, hg: 409.5, sf: 1.096, sg: 1.716, uf: 225.6, ug: 387.0 },
    { P: 1017.0, T: 40, vf: 0.000872, vg: 0.0200, hf: 256.4, hg: 419.6, sf: 1.190, sg: 1.708, uf: 255.8, ug: 395.1 },
    { P: 4060.4, T: 101.6, vf: 0.00196, vg: 0.00196, hf: 337.3, hg: 337.3, sf: 1.48, sg: 1.48, uf: 329.3, ug: 329.3 }, // Critical Point
];

// Simplified Saturation Table for Ammonia (R-717)
const AMMONIA_SATURATION_DATA: SaturationPoint[] = [
    { P: 190.2, T: -20, vf: 0.001504, vg: 0.6236, hf: 89.79, hg: 1418.0, sf: 0.3676, sg: 5.6155, uf: 88.9, ug: 1300.0 },
    { P: 429.6, T: 0, vf: 0.001566, vg: 0.2892, hf: 179.69, hg: 1442.2, sf: 0.7114, sg: 5.3108, uf: 179.0, ug: 1319.7 },
    { P: 857.5, T: 20, vf: 0.001638, vg: 0.1492, hf: 274.3, hg: 1460.2, sf: 1.0408, sg: 5.0861, uf: 272.9, ug: 1332.2 },
    { P: 2033.5, T: 50, vf: 0.001777, vg: 0.0633, hf: 421.4, hg: 1471.6, sf: 1.5113, sg: 4.7644, uf: 417.8, ug: 1330.1 },
    { P: 11333, T: 132.4, vf: 0.00425, vg: 0.00425, hf: 859.0, hg: 859.0, sf: 2.85, sg: 2.85, uf: 810.0, ug: 810.0 } // Critical Point
];

// Simplified Saturation Table for Carbon Dioxide (CO2, R-744)
const CO2_SATURATION_DATA: SaturationPoint[] = [
    { P: 1970, T: -20, vf: 0.00101, vg: 0.0195, hf: 154.5, hg: 472.5, sf: 0.811, sg: 2.015, uf: 152.5, ug: 434.3 },
    { P: 3486, T: 0, vf: 0.00116, vg: 0.0101, hf: 200.0, hg: 450.0, sf: 1.0, sg: 1.83, uf: 196.0, ug: 414.0 },
    { P: 5729, T: 20, vf: 0.00140, vg: 0.0053, hf: 243.6, hg: 412.0, sf: 1.16, sg: 1.65, uf: 235.6, ug: 381.8 },
    { P: 7377, T: 31.0, vf: 0.00214, vg: 0.00214, hf: 285.0, hg: 285.0, sf: 1.3, sg: 1.3, uf: 269.0, ug: 269.0 } // Critical Point
];


export const SUBSTANCES: { [key: string]: Substance } = {
    'Agua': {
        name: 'Agua',
        type: 'real',
        properties: {},
        saturationData: WATER_SATURATION_DATA,
    },
    'R-134a (Tetrafluoroetano)': {
        name: 'R-134a (Tetrafluoroetano)',
        type: 'real',
        properties: {},
        saturationData: R134A_SATURATION_DATA,
    },
    'Amoníaco (R-717)': {
        name: 'Amoníaco (R-717)',
        type: 'real',
        properties: {},
        saturationData: AMMONIA_SATURATION_DATA,
    },
    'Dióxido de Carbono (R-744)': {
        name: 'Dióxido de Carbono (R-744)',
        type: 'real',
        properties: {},
        saturationData: CO2_SATURATION_DATA,
    },
    'Aire': {
        name: 'Aire',
        type: 'idealGas',
        properties: {
            molarMass: 28.97,
            R: 0.287, // kJ/kg.K
            cp: 1.005, // kJ/kg.K at 300K
            cv: 0.718, // kJ/kg.K at 300K
            gamma: 1.4,
        },
    },
};

export const PROPERTY_OPTIONS: { [key: string]: string } = {
    'P': 'P (Presión)',
    'T': 'T (Temperatura)',
    'v': 'v (Volumen esp.)',
    'h': 'h (Entalpía)',
    's': 's (Entropía)',
    'x': 'x (Calidad)',
};

// Based on the implemented functions in thermoService.ts
export const VALID_PROPERTY_PAIRS: { [key: string]: string[] } = {
    'P': ['T', 'x', 's'],
    'T': ['P', 'x', 's'],
    'x': ['P', 'T'],
    's': ['P', 'T'],
    'h': [], // 'h' is not supported as an input property in the simplified model
    'v': [], // 'v' is not supported as an input property in the simplified model
};
