import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const PixelColors = {
  // Entorno Altillo (Noche, maderas rústicas y polvo en el ático)
  bgDark: '#0e0a16',           // Fondo ático oscuro
  bgAtticFloor: '#1a1008',     // Piso de tablas de madera
  woodDark: '#2c1409',         // Vigas de madera oscura
  woodMedium: '#5c2d15',       // Madera intermedia
  woodLight: '#8a4823',        // Madera iluminada por la TV
  woodHighlight: '#b36332',    // Reborde de luz en estantes

  // Fósforos de Pantalla de Tubo (CRT)
  crtGlowCyan: '#00ffcc',      // Fósforo verde/cyan digital
  crtGlowAmber: '#ffb703',     // Fósforo ámbar cálido
  crtScreenBg: '#05110e',      // Cristal del tubo apagado/encendido tenue
  crtBezel: '#181818',         // Plástico rugoso de TV vintage
  crtKnob: '#4a4a4a',          // Perillas sintonizadoras

  // Colores Arcade / Cartuchos 8-Bits
  nesGray: '#b5b5b5',          // Plástico cartucho NES/GameBoy
  snesPurple: '#513d8a',       // Botones y bordes SNES
  genesisRed: '#d62828',       // Franja Sega Genesis
  psxBlue: '#003087',          // Logo PlayStation
  gbaIndigo: '#3a0ca3',        // Carcasa GBA

  // Luces de Estado y Texto
  textWhite: '#f8f9fa',
  textMuted: '#8d99ae',
  focusYellow: '#ffee32',      // Borde de selección activa con D-Pad
  dangerRed: '#e63946',        // Errores de sincronización
  successGreen: '#52b788',     // Sincronizado OK
};

export const PixelBorders = {
  // Marco clásico con esquina biselada estilo 8-bits
  retroCard: {
    borderWidth: 3,
    borderColor: PixelColors.woodHighlight,
    backgroundColor: PixelColors.woodDark,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,

  // Marco activo cuando el cursor de TV está encima
  focusedCard: {
    borderWidth: 3,
    borderColor: PixelColors.focusYellow,
    backgroundColor: PixelColors.woodMedium,
    shadowColor: PixelColors.crtGlowCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,

  // Marco de la TV de tubo
  tvCabinet: {
    borderWidth: 5,
    borderColor: PixelColors.woodHighlight,
    backgroundColor: PixelColors.woodDark,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  } as ViewStyle,

  // Bisel de pantalla
  tvScreenBezel: {
    borderWidth: 6,
    borderColor: PixelColors.crtBezel,
    borderRadius: 10,
    backgroundColor: PixelColors.crtScreenBg,
    overflow: 'hidden',
  } as ViewStyle,
};

export const PixelTypography = {
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: PixelColors.crtGlowAmber,
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  } as TextStyle,

  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PixelColors.crtGlowCyan,
    letterSpacing: 1.5,
  } as TextStyle,

  body: {
    fontSize: 11,
    color: PixelColors.textWhite,
    letterSpacing: 0.8,
  } as TextStyle,

  badge: {
    fontSize: 9,
    fontWeight: 'bold',
    color: PixelColors.textWhite,
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as TextStyle,
};
