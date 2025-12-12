import { Substance, StatePoint, SaturationPoint, CycleType, Process } from '../types';

// Helper to convert Celsius to Kelvin
const CtoK = (T_C: number) => T_C + 273.15;
// Helper to convert Kelvin to Celsius
const KtoC = (T_K: number) => T_K - 273.15;

// --- Unit Conversion Helpers ---

// Converts any pressure unit to kPa (base unit)
const convertPressureToKpa = (value: number, unit: string | undefined): number => {
    if (!unit) return value;
    switch (unit.toLowerCase()) {
        case 'kpa': return value;
        case 'bar': return value * 100;
        case 'atm': return value * 101.325;
        default: return value;
    }
};

// Converts any temperature unit to Celsius (base unit)
const convertTempToCelsius = (value: number, unit: string | undefined): number => {
    if (!unit) return value;
    switch (unit.toLowerCase()) {
        case '°c': return value;
        case 'k': return KtoC(value);
        default: return value;
    }
};


// --- Property Calculation Helpers ---

function getIdealGasProperties(substance: Substance, P: number, T_C: number): Omit<StatePoint, 'name'> {
    const { R, cv } = substance.properties;
    if (!R || !cv) throw new Error("Las propiedades de gas ideal (R, cv) no están definidas.");
    const T_K = CtoK(T_C);
    const v = (R * T_K) / P;
    const u = cv * T_K; // Reference u=0 at T=0K
    const h = u + P * v;
    // For an ideal gas, s - s_ref = cp * ln(T/T_ref) - R * ln(P/P_ref)
    // We'll calculate entropy changes in processes, absolute value is less important here.
    const s = substance.properties.cp! * Math.log(T_K) - R * Math.log(P);
    return { P, T: T_C, v, u, h, s, x: null };
}

function findSatPointByP(substance: Substance, P: number): SaturationPoint | null {
    // This would be an interpolation in a real system. Here we find the closest point.
    return substance.saturationData?.reduce((prev, curr) => 
        Math.abs(curr.P - P) < Math.abs(prev.P - P) ? curr : prev
    ) || null;
}

function findSatPointByT(substance: Substance, T: number): SaturationPoint | null {
    return substance.saturationData?.reduce((prev, curr) => 
        Math.abs(curr.T - T) < Math.abs(prev.T - T) ? curr : prev
    ) || null;
}

function getRealSubstanceProperties(substance: Substance, prop1: string, val1: number, prop2: string, val2: number): Omit<StatePoint, 'name'> {
    // This is a highly simplified model. A real one would use complex equations of state or interpolation.
    let P: number | undefined, T: number | undefined, v: number | undefined, h: number | undefined, s: number | undefined, u: number | undefined, x: number | null = null;
    
    const props = { [prop1]: val1, [prop2]: val2 };

    if ('P' in props && 'T' in props) {
        P = props['P'];
        T = props['T'];
        
        const satPoint = findSatPointByP(substance, P);
        if (!satPoint) throw new Error("No se encontraron datos de saturación para la presión dada.");

        if (T > satPoint.T) { // Superheated
            const cp_vapor = 2.0; // kJ/kg.K approx for steam
            h = satPoint.hg + cp_vapor * (T - satPoint.T); 
            s = satPoint.sg + cp_vapor * Math.log(CtoK(T) / CtoK(satPoint.T));
            v = satPoint.vg * (CtoK(T) / CtoK(satPoint.T)); // Ideal gas law approx from sat point
            x = null;
        } else if (T < satPoint.T) { // Compressed Liquid
            const satPointAtT = findSatPointByT(substance, T);
            if (!satPointAtT) throw new Error("No se encontraron datos de saturación para la temperatura dada.");
            // Approximate as saturated liquid at the given temperature
            h = satPointAtT.hf;
            s = satPointAtT.sf;
            v = satPointAtT.vf;
            x = null;
        } else { // Saturated Mixture - cannot determine x from P and T
            throw new Error("No se puede determinar el estado solo con P y T en la región de saturación. Proporcione la calidad (x) u otra propiedad.");
        }
    } else if ('P' in props && 'x' in props) {
         P = props['P'];
         x = props['x'];
         if (x < 0 || x > 1) throw new Error("La calidad (x) debe estar entre 0 y 1.");
         const satPoint = findSatPointByP(substance, P);
         if (!satPoint) throw new Error("No se encontraron datos de saturación para la presión dada.");
         T = satPoint.T;
         v = satPoint.vf + x * (satPoint.vg - satPoint.vf);
         h = satPoint.hf + x * (satPoint.hg - satPoint.hf);
         s = satPoint.sf + x * (satPoint.sg - satPoint.sf);
    } else if ('P' in props && 's' in props) {
        P = props['P'];
        s = props['s'];
        const satPoint = findSatPointByP(substance, P);
        if (!satPoint) throw new Error("No se encontraron datos de saturación para la presión dada.");
        T = satPoint.T;
        
        if (s >= satPoint.sf && s <= satPoint.sg) { // Saturated Mixture
            x = (s - satPoint.sf) / (satPoint.sg - satPoint.sf);
            v = satPoint.vf + x * (satPoint.vg - satPoint.vf);
            h = satPoint.hf + x * (satPoint.hg - satPoint.hf);
        } else if (s > satPoint.sg) { // Superheated vapor
            const cp_vapor = 2.0;
            T = KtoC(CtoK(satPoint.T) * Math.exp((s - satPoint.sg) / cp_vapor));
            h = satPoint.hg + cp_vapor * (T - satPoint.T);
            v = satPoint.vg * CtoK(T) / CtoK(satPoint.T);
            x = null;
        } else { // Compressed liquid
            // h = hf@P + vf@P * (P - Psat@T_for_s) - not easily calculable here
            // Let's just approximate as incompressible liquid, h is slightly higher than hf
             h = satPoint.hf + satPoint.vf * (P - satPoint.P); // h_comp = h_f + v_f(P - P_sat)
             v = satPoint.vf;
             T = satPoint.T; // In reality T would rise slightly
             x = null;
        }
    } else if ('T' in props && 'x' in props) {
        T = props['T'];
        x = props['x'];
        if (x < 0 || x > 1) throw new Error("La calidad (x) debe estar entre 0 y 1.");
        const satPoint = findSatPointByT(substance, T);
        if (!satPoint) throw new Error("No se encontraron datos de saturación para la temperatura dada.");
        P = satPoint.P;
        v = satPoint.vf + x * (satPoint.vg - satPoint.vf);
        h = satPoint.hf + x * (satPoint.hg - satPoint.hf);
        s = satPoint.sf + x * (satPoint.sg - satPoint.sf);
    } else if ('T' in props && 's' in props) {
        T = props['T'];
        s = props['s'];
        const satPoint = findSatPointByT(substance, T);
        if (!satPoint) throw new Error("No se encontraron datos de saturación para la temperatura dada.");
        P = satPoint.P;
         if (s >= satPoint.sf && s <= satPoint.sg) { // Saturated Mixture
            x = (s - satPoint.sf) / (satPoint.sg - satPoint.sf);
            v = satPoint.vf + x * (satPoint.vg - satPoint.vf);
            h = satPoint.hf + x * (satPoint.hg - satPoint.hf);
        } else {
            throw new Error(`El estado con T=${T} y s=${s} está fuera del domo de saturación y no está implementado en este modelo simplificado.`);
        }
    }
    else {
        throw new Error(`La combinación de propiedades (${prop1}, ${prop2}) aún no es compatible con este modelo simplificado.`);
    }

    if (P === undefined || T === undefined || v === undefined || h === undefined || s === undefined) {
      throw new Error("No se pudieron calcular todas las propiedades de estado.");
    }

    u = h - P * v;
    return { P, T, v, u, h, s, x };
}

// --- Main Service Functions ---

export const calculateStateProperties = (substance: Substance, properties: { prop1: string, value1: number, unit1: string, prop2: string, value2: number, unit2: string }): Omit<StatePoint, 'name'> => {
    
    let { prop1, value1, unit1, prop2, value2, unit2 } = properties;

    // Convert inputs to base units (kPa, °C) before calculation
    let baseValue1 = value1;
    if (prop1 === 'P') baseValue1 = convertPressureToKpa(value1, unit1);
    if (prop1 === 'T') baseValue1 = convertTempToCelsius(value1, unit1);
    
    let baseValue2 = value2;
    if (prop2 === 'P') baseValue2 = convertPressureToKpa(value2, unit2);
    if (prop2 === 'T') baseValue2 = convertTempToCelsius(value2, unit2);


    if (substance.type === 'idealGas') {
        let P: number, T: number;
        if ((prop1 === 'P' && prop2 === 'T') || (prop1 === 'T' && prop2 === 'P')) {
             P = prop1 === 'P' ? baseValue1 : baseValue2;
             T = prop1 === 'T' ? baseValue1 : baseValue2;
        } else {
            throw new Error("Para gas ideal, por favor proporcione P y T.");
        }
        return getIdealGasProperties(substance, P, T);
    } else {
        return getRealSubstanceProperties(substance, prop1, baseValue1, prop2, baseValue2);
    }
};

export const calculateProcess = (substance: Substance, startState: StatePoint, processType: string, endCondition: { prop: string, value: number }): { endState: Omit<StatePoint, 'name'>, processData: { Q: number, W: number } } => {
    let endState: Omit<StatePoint, 'name'>;
    let Q = 0, W = 0;
    const { R, cv, cp, gamma } = substance.properties;
    
    // NOTE: Process/Cycle inputs are assumed to be in base units (kPa, °C) for this simplified implementation.
    // The new unit selection functionality applies only to the "Define State" tab.
    const endStateParams = {
        prop1: '', value1: 0, unit1: '',
        prop2: endCondition.prop, value2: endCondition.value, unit2: ''
    };


    // Simplified calculation for end state
    switch (processType) {
        case 'isobaric': // Constant P
            endStateParams.prop1 = 'P';
            endStateParams.value1 = startState.P;
            endState = calculateStateProperties(substance, endStateParams);
            W = startState.P * (endState.v - startState.v); // W = integral(P*dv) = P * delta(v)
            Q = endState.h - startState.h; // First law for closed system, isobaric process Q = delta(h)
            break;
        case 'isochoric': // Constant v
            endStateParams.prop1 = 'v';
            endStateParams.value1 = startState.v;
            endState = calculateStateProperties(substance, endStateParams);
            W = 0;
            Q = endState.u - startState.u; // Q = delta(u) for isochoric
            break;
        case 'isothermal': // Constant T
             endStateParams.prop1 = 'T';
             endStateParams.value1 = startState.T;
             endState = calculateStateProperties(substance, endStateParams);
             if (substance.type === 'idealGas' && R) {
                W = R * CtoK(startState.T) * Math.log(endState.v / startState.v);
                Q = W; // For ideal gas, delta(u) = 0, so Q = W
             } else {
                 Q = CtoK(startState.T) * (endState.s - endState.s); // Q = T * delta(s)
                 W = Q - (endState.u - startState.u); // W = Q - delta(u)
             }
            break;
        case 'isentropic': // Constant s
            endStateParams.prop1 = 's';
            endStateParams.value1 = startState.s;
            endState = calculateStateProperties(substance, endStateParams);
            Q = 0;
            W = -(endState.u - startState.u);
             if (substance.type === 'idealGas' && gamma && R && cv) { // Recalculate for ideal gas with specific formula
                if (endCondition.prop !== 'P') throw new Error("Para un proceso isentrópico de gas ideal, por favor proporcione una presión final (P).");
                const P2 = endCondition.value;
                const T2_K = CtoK(startState.T) * Math.pow(P2 / startState.P, (gamma - 1) / gamma);
                endState = getIdealGasProperties(substance, P2, KtoC(T2_K));
                Q = 0;
                W = -(endState.u - startState.u); // W = -delta(u)
            }
            break;
        default:
            throw new Error(`El tipo de proceso "${processType}" no es compatible.`);
    }

    if (!endState) {
        throw new Error("No se pudo calcular el estado final para el proceso.");
    }

    return { endState, processData: { Q, W } };
};


export const calculateCycle = (substance: Substance, cycleType: CycleType, params: any): { states: StatePoint[], processes: Process[], results: any } => {
    const calculatedStates: StatePoint[] = [];
    const calculatedProcesses: Process[] = [];
    let results = {};

    if (cycleType === 'Rankine') {
        if (substance.type !== 'real') throw new Error("El ciclo Rankine requiere una sustancia real (ej. Agua).");
        const { p_low, p_high } = params;

        const state1 = { name: 'Estado 1 (Entrada Bomba)', ...calculateStateProperties(substance, { prop1: 'P', value1: p_low, unit1: 'kPa', prop2: 'x', value2: 0, unit2: '' }) };
        const state2 = { name: 'Estado 2 (Entrada Caldera)', ...calculateStateProperties(substance, { prop1: 'P', value1: p_high, unit1: 'kPa', prop2: 's', value2: state1.s, unit2: '' }) };
        const state3 = { name: 'Estado 3 (Entrada Turbina)', ...calculateStateProperties(substance, { prop1: 'P', value1: p_high, unit1: 'kPa', prop2: 'x', value2: 1, unit2: '' }) };
        const state4 = { name: 'Estado 4 (Entrada Condensador)', ...calculateStateProperties(substance, { prop1: 'P', value1: p_low, unit1: 'kPa', prop2: 's', value2: state3.s, unit2: '' }) };
        
        calculatedStates.push(state1, state2, state3, state4);

        const W_p = state2.h - state1.h;
        const Q_in = state3.h - state2.h;
        const W_t = state3.h - state4.h;
        const Q_out = state4.h - state1.h;
        const W_net = W_t - W_p;
        const efficiency = W_net / Q_in;
        
        results = { W_net, Q_in, Q_out, efficiency, "Trabajo Bomba (entrada)": W_p, "Trabajo Turbina (salida)": W_t };
        calculatedProcesses.push(
            { start: state1, end: state2, type: 'Compresión Isentrópica', W: -W_p, Q: 0 },
            { start: state2, end: state3, type: 'Adición de Calor Isobárica', Q: Q_in, W: p_high * (state3.v - state2.v)},
            { start: state3, end: state4, type: 'Expansión Isentrópica', W: W_t, Q: 0 },
            { start: state4, end: state1, type: 'Rechazo de Calor Isobárico', Q: -Q_out, W: p_low * (state1.v - state4.v)}
        );
    } else if (cycleType === 'Brayton') {
        if (substance.type !== 'idealGas') throw new Error("El ciclo Brayton requiere un gas ideal (ej. Aire).");
        const { pressure_ratio, t_min_c, t_max_c } = params;
        const { cp, gamma } = substance.properties;
        if (!cp || !gamma) throw new Error("Propiedades de gas ideal (cp, gamma) no definidas.");

        const p_low = 100; // Assume atmospheric pressure in kPa
        const p_high = p_low * pressure_ratio;

        const state1 = { name: 'Estado 1 (Entrada Compresor)', ...getIdealGasProperties(substance, p_low, t_min_c)};
        const T2_K = CtoK(state1.T) * Math.pow(pressure_ratio, (gamma-1)/gamma);
        const state2 = { name: 'Estado 2 (Entrada Cámara Combustión)', ...getIdealGasProperties(substance, p_high, KtoC(T2_K))};
        const state3 = { name: 'Estado 3 (Entrada Turbina)', ...getIdealGasProperties(substance, p_high, t_max_c)};
        const T4_K = CtoK(state3.T) * Math.pow(1/pressure_ratio, (gamma-1)/gamma);
        const state4 = { name: 'Estado 4 (Escape)', ...getIdealGasProperties(substance, p_low, KtoC(T4_K))};

        calculatedStates.push(state1, state2, state3, state4);

        const W_c = cp * (T2_K - CtoK(state1.T));
        const Q_in = cp * (CtoK(state3.T) - T2_K);
        const W_t = cp * (CtoK(state3.T) - T4_K);
        const Q_out = cp * (T4_K - CtoK(state1.T));
        const W_net = W_t - W_c;
        const efficiency = W_net / Q_in;
        
        results = { W_net, Q_in, Q_out, efficiency, "Trabajo Compresor (entrada)": W_c, "Trabajo Turbina (salida)": W_t };
        calculatedProcesses.push(
            { start: state1, end: state2, type: 'Compresión Isentrópica', W: -W_c, Q: 0 },
            { start: state2, end: state3, type: 'Adición de Calor Isobárica', Q: Q_in, W: substance.properties.R! * (CtoK(state3.T) - T2_K) },
            { start: state3, end: state4, type: 'Expansión Isentrópica', W: W_t, Q: 0 },
            { start: state4, end: state1, type: 'Rechazo de Calor Isobárico', Q: -Q_out, W: substance.properties.R! * (CtoK(state1.T) - T4_K) }
        );
    } else if (cycleType === 'Carnot') {
        if (substance.type !== 'real') throw new Error("Este modelo de ciclo de Carnot requiere una sustancia real.");
        const { t_max_c: t_high_c, t_min_c: t_low_c } = params;
        const T_H_K = CtoK(t_high_c);
        const T_L_K = CtoK(t_low_c);

        const state1 = { name: 'Estado 1', ...calculateStateProperties(substance, { prop1: 'T', value1: t_high_c, unit1: '°C', prop2: 'x', value2: 0, unit2: '' })};
        const state2 = { name: 'Estado 2', ...calculateStateProperties(substance, { prop1: 'T', value1: t_high_c, unit1: '°C', prop2: 'x', value2: 1, unit2: '' })};
        const state3 = { name: 'Estado 3', ...calculateStateProperties(substance, { prop1: 'T', value1: t_low_c, unit1: '°C', prop2: 's', value2: state2.s, unit2: '' })};
        const state4 = { name: 'Estado 4', ...calculateStateProperties(substance, { prop1: 'T', value1: t_low_c, unit1: '°C', prop2: 's', value2: state1.s, unit2: '' })};
        
        calculatedStates.push(state1, state2, state3, state4);

        const Q_in = T_H_K * (state2.s - state1.s);
        const Q_out = T_L_K * (state3.s - state4.s); // s3=s2, s4=s1
        const W_net = Q_in - Q_out;
        const efficiency = W_net / Q_in;

        results = { W_net, Q_in, Q_out, efficiency };
        calculatedProcesses.push(
            { start: state1, end: state2, type: 'Adición de Calor Isotérmica', Q: Q_in, W: Q_in - (state2.u - state1.u) },
            { start: state2, end: state3, type: 'Expansión Isentrópica', Q: 0, W: state2.u - state3.u },
            { start: state3, end: state4, type: 'Rechazo de Calor Isotérmico', Q: -Q_out, W: -Q_out - (state4.u - state3.u) },
            { start: state4, end: state1, type: 'Compresión Isentrópica', Q: 0, W: state4.u - state1.u }
        );
    } else {
        throw new Error(`El tipo de ciclo "${cycleType}" aún no está implementado.`);
    }

    return { states: calculatedStates, processes: calculatedProcesses, results };
};