import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Game } from '../types';
import { PixelColors, PixelBorders, PixelTypography } from '../theme/pixelTheme';
import { CRTOverlay } from './CRTOverlay';
import { SYSTEM_CONFIGS } from '../services/EmulatorLauncher';

interface TVConsolePreviewProps {
  game: Game | null;
  isDownloading: boolean;
  downloadPercent: number;
  onPressLaunch: () => void;
  isTVFocused?: boolean;
}

export const TVConsolePreview: React.FC<TVConsolePreviewProps> = ({
  game,
  isDownloading,
  downloadPercent,
  onPressLaunch,
}) => {
  const systemConfig = game ? SYSTEM_CONFIGS[game.system] : null;

  return (
    <View style={styles.cabinetContainer}>
      {/* 1. Mueble de Madera de la TV */}
      <View style={styles.tvWoodCabinet}>
        
        {/* 2. Bisel Plástico y Pantalla de Tubo */}
        <View style={styles.screenBezel}>
          <View style={styles.crtGlass}>
            {game ? (
              <View style={styles.screenContent}>
                {/* Badge del Sistema */}
                <View
                  style={[
                    styles.systemBadge,
                    { backgroundColor: systemConfig?.themeColor || PixelColors.genesisRed },
                  ]}
                >
                  <Text style={styles.systemBadgeText}>{game.system}</Text>
                </View>

                {/* Título del Juego */}
                <Text style={styles.gameTitle} numberOfLines={2}>
                  {game.title}
                </Text>

                {/* Estado: Descargando o Listo para jugar */}
                {isDownloading ? (
                  <View style={styles.downloadContainer}>
                    <ActivityIndicator size="small" color={PixelColors.crtGlowCyan} />
                    <Text style={styles.downloadText}>
                      DESCARGANDO: {downloadPercent}%
                    </Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${downloadPercent}%` }]} />
                    </View>
                  </View>
                ) : (
                  <Pressable
                    hasTVPreferredFocus={false}
                    onPress={onPressLaunch}
                    style={({ pressed }) => [
                      styles.launchButton,
                      pressed && styles.launchButtonPressed,
                    ]}
                  >
                    <Text style={styles.launchButtonText}>▶ INSERTAR Y JUGAR</Text>
                    <Text style={styles.coreTag}>CORE: {game.core}</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.noSignalContainer}>
                <Text style={styles.noSignalText}>★ SIN CARTUCHO ★</Text>
                <Text style={styles.noSignalSubText}>SELECCIONA UN JUEGO</Text>
              </View>
            )}

            {/* Efecto de Scanlines CRT */}
            <CRTOverlay opacity={0.3} />
          </View>
        </View>

        {/* 3. Panel de Control de la TV (Perillas y Parlante) */}
        <View style={styles.controlPanel}>
          <View style={styles.knobContainer}>
            <View style={styles.knob}>
              <View style={styles.knobNotch} />
            </View>
            <Text style={styles.knobLabel}>VOL</Text>
          </View>
          <View style={styles.knobContainer}>
            <View style={styles.knob}>
              <View style={styles.knobNotch} />
            </View>
            <Text style={styles.knobLabel}>CH</Text>
          </View>
          <View style={styles.speakerGrill}>
            <View style={styles.grillSlot} />
            <View style={styles.grillSlot} />
            <View style={styles.grillSlot} />
            <View style={styles.grillSlot} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cabinetContainer: {
    flex: 1.1,
    height: '100%',
    padding: 4,
  },
  tvWoodCabinet: {
    ...PixelBorders.tvCabinet,
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  screenBezel: {
    ...PixelBorders.tvScreenBezel,
    flex: 1,
  },
  crtGlass: {
    flex: 1,
    backgroundColor: PixelColors.crtScreenBg,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  systemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  systemBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gameTitle: {
    ...PixelTypography.title,
    textAlign: 'center',
    fontSize: 16,
    color: PixelColors.crtGlowCyan,
    marginBottom: 12,
  },
  downloadContainer: {
    alignItems: 'center',
    width: '80%',
    marginTop: 6,
  },
  downloadText: {
    color: PixelColors.crtGlowAmber,
    fontSize: 9,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: PixelColors.crtGlowCyan,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PixelColors.crtGlowCyan,
  },
  launchButton: {
    backgroundColor: PixelColors.woodMedium,
    borderWidth: 2,
    borderColor: PixelColors.focusYellow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: PixelColors.focusYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  launchButtonPressed: {
    backgroundColor: PixelColors.woodHighlight,
  },
  launchButtonText: {
    color: PixelColors.focusYellow,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  coreTag: {
    color: PixelColors.textMuted,
    fontSize: 8,
    marginTop: 2,
  },
  noSignalContainer: {
    alignItems: 'center',
  },
  noSignalText: {
    color: PixelColors.crtGlowAmber,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  noSignalSubText: {
    color: PixelColors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },
  controlPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: PixelColors.woodMedium,
    gap: 12,
  },
  knobContainer: {
    alignItems: 'center',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PixelColors.crtKnob,
    borderWidth: 2,
    borderColor: '#7a7a7a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobNotch: {
    width: 2,
    height: 8,
    backgroundColor: '#fff',
  },
  knobLabel: {
    color: PixelColors.textMuted,
    fontSize: 7,
    marginTop: 2,
    fontWeight: 'bold',
  },
  speakerGrill: {
    flex: 1,
    height: 20,
    justifyContent: 'space-evenly',
  },
  grillSlot: {
    height: 2,
    backgroundColor: '#1f1f1f',
  },
});
