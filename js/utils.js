// js/utils.js

/**
 * Calcula el modificador de una estadística base.
 * @param {number} val - El valor de la estadística (ej: 18)
 * @returns {string} El modificador formateado con su signo (ej: "+4")
 */
export function getStatModifier(val) {
    const m = Math.floor((val - 10) / 2);
    return m >= 0 ? '+' + m : m.toString();
}

/**
 * Calcula los datos numéricos y heurísticos visuales para las barras de salud.
 * @param {number} current - HP actual del personaje
 * @param {number} max - HP máximo del personaje
 * @returns {Object} { percent: number, color: string }
 */
export function getHealthBarData(current, max) {
    // Protección estricta contra divisiones por 0 o valores defectuosos
    const safeMax = max > 0 ? max : 1;
    const percent = Math.max(0, Math.min(100, (current / safeMax) * 100));

    // Unificación formal de paleta de colores del ecosistema (Hexadecimales)
    let color;
    if (percent > 50) {
        color = '#556b2f'; // Verde oliva oscuro
    } else if (percent > 20) {
        color = '#b8860b'; // Dorado oscuro
    } else {
        color = '#8b0000'; // Rojo oscuro
    }

    return { percent, color };
}
