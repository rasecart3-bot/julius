
export interface Substance {
    name: string;
    type: 'idealGas' | 'real';
    properties: {
         molarMass?: number; // kg/kmol
         R?: number; // kJ/kg.K
         cp?: number; // kJ/kg.K
         cv?: number; // kJ/kg.K
         gamma?: number;
    };
    saturationData?: SaturationPoint[];
}

export interface SaturationPoint {
    P: number; // Pressure in kPa
    T: number; // Temperature in C
    vf: number; // m^3/kg
    vg: number; // m^3/kg
    hf: number; // kJ/kg
    hg: number; // kJ/kg
    sf: number; // kJ/kg.K
    sg: number; // kJ/kg.K
    uf: number;
    ug: number;
}


export interface StatePoint {
    name: string;
    P: number; // Pressure in kPa
    T: number; // Temperature in C
    v: number; // Specific volume in m^3/kg
    u: number; // Internal energy in kJ/kg
    h: number; // Enthalpy in kJ/kg
    s: number; // Entropy in kJ/kg.K
    x: number | null; // Quality (null if not in mixture region)
}

export interface Process {
    start: StatePoint;
    end: StatePoint;
    type: string;
    W?: number; // Work kJ/kg
    Q?: number; // Heat kJ/kg
}

export type DiagramType = 'T-s' | 'P-v' | 'P-h' | 'h-s';

export type CycleType = 'Rankine' | 'Brayton' | 'Carnot';
