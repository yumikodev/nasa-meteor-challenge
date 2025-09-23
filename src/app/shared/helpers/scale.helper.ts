const SCALE_FACTOR = 1_000_000;

/**
 *  Convierte km reales -> unidades en Three.js
 * @param realMeasure Medida real a convertir
 */
export function toScaledValue(realMeasure: number) {
  return realMeasure / SCALE_FACTOR;
}

/**
 * Convierte unidades en Three.js -> km reales
 * @param scaledValue Unidade en Three.js
 */
export function toRealValue(scaledValue: number) {
  return scaledValue * SCALE_FACTOR;
}
