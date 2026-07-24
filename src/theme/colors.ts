/**
 * Colores de la identidad visual de Campo Maq.
 * Usar siempre estos tokens en lugar de colores "hardcodeados".
 */
export const colors = {
  // Marca
  primary: '#EBD600', // amarillo Campo Maq
  primaryDark: '#D9A300',
  onPrimary: '#1A1A1A', // texto sobre amarillo

  // Neutros
  black: '#1A1A1A',
  grayDark: '#4A4A4A',
  gray: '#8A8A8A',
  grayLight: '#D9D9D9',
  background: '#F5F5F5',
  surface: '#FFFFFF',

  // Estados (usados por ejemplo en etiquetas de stock)
  success: '#2E9E4F',
  warning: '#f5b810',
  danger: '#D64545',
  stockd: '#9df391',
  // Bordes
  border: '#E5E5E5',
} as const;
