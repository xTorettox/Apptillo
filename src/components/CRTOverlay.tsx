import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CRTOverlayProps {
  opacity?: number;
}

export const CRTOverlay: React.FC<CRTOverlayProps> = ({ opacity = 0.25 }) => {
  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* Líneas de scanline simuladas con patrón de repetición */}
      <View style={[styles.scanlinePattern, { opacity }]} />
      {/* Sombra de viñeteado en las esquinas del tubo */}
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  scanlinePattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
