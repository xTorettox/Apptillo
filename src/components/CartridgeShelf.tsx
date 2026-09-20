import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Game } from '../types';
import { PixelColors, PixelBorders } from '../theme/pixelTheme';
import { SYSTEM_CONFIGS } from '../services/EmulatorLauncher';

interface CartridgeShelfProps {
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
}

export const CartridgeShelf: React.FC<CartridgeShelfProps> = ({
  games,
  selectedGame,
  onSelectGame,
  onLaunchGame,
}) => {
  return (
    <View style={styles.shelfContainer}>
      <View style={styles.shelfHeader}>
        <Text style={styles.shelfTitle}>══ ESTANTERÍA DE CARTUCHOS ══</Text>
        <Text style={styles.gameCountTag}>{games.length} JUEGOS</Text>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedGame?.id === item.id;
          const systemConfig = SYSTEM_CONFIGS[item.system];

          return (
            <Pressable
              hasTVPreferredFocus={index === 0}
              focusable={true}
              onFocus={() => onSelectGame(item)}
              onPress={() => {
                onSelectGame(item);
                onLaunchGame(item);
              }}
              style={[
                styles.cartridgeRow,
                isSelected ? PixelBorders.focusedCard : PixelBorders.retroCard,
              ]}
            >
              {/* Franja de Color del Sistema (Lateral del Cartucho) */}
              <View
                style={[
                  styles.systemColorStrip,
                  { backgroundColor: systemConfig?.themeColor || PixelColors.genesisRed },
                ]}
              />

              {/* Ranura del Cartucho */}
              <View style={styles.cartridgeGrip}>
                <View style={styles.gripLine} />
                <View style={styles.gripLine} />
              </View>

              {/* Título del Juego */}
              <View style={styles.infoColumn}>
                <Text
                  style={[
                    styles.gameTitleText,
                    isSelected && styles.gameTitleFocused,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={styles.systemSubText}>{systemConfig?.displayName || item.system}</Text>
              </View>

              {/* Tag del Sistema */}
              <View style={styles.badgeContainer}>
                <Text style={styles.systemBadgeText}>{item.system}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shelfContainer: {
    flex: 1.3,
    height: '100%',
    backgroundColor: 'rgba(26, 16, 8, 0.85)',
    borderWidth: 4,
    borderColor: PixelColors.woodLight,
    padding: 8,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: PixelColors.woodMedium,
  },
  shelfTitle: {
    color: PixelColors.crtGlowAmber,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gameCountTag: {
    color: PixelColors.textMuted,
    fontSize: 9,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
    gap: 8,
  },
  cartridgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 8,
  },
  systemColorStrip: {
    width: 8,
    height: '100%',
    borderRadius: 1,
  },
  cartridgeGrip: {
    width: 6,
    height: 16,
    justifyContent: 'space-between',
  },
  gripLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoColumn: {
    flex: 1,
  },
  gameTitleText: {
    color: PixelColors.textWhite,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  gameTitleFocused: {
    color: PixelColors.focusYellow,
  },
  systemSubText: {
    color: PixelColors.textMuted,
    fontSize: 8,
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: PixelColors.woodHighlight,
  },
  systemBadgeText: {
    color: PixelColors.crtGlowAmber,
    fontSize: 8,
    fontWeight: 'bold',
  },
});
