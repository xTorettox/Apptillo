import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';
import { Game } from '../types';
import { PixelColors, PixelTypography } from '../theme/pixelTheme';
import { GoogleDriveService } from '../services/GoogleDriveService';
import { DownloadManager } from '../services/DownloadManager';
import { EmulatorLauncher } from '../services/EmulatorLauncher';
import { saveSyncEngine } from '../services/SaveSyncEngine';
import { TVConsolePreview } from '../components/TVConsolePreview';
import { CartridgeShelf } from '../components/CartridgeShelf';
import { SyncIndicator } from '../components/SyncIndicator';

// Catálogo inicial por defecto (se expande al conectar Google Drive)
const INITIAL_GAMES: Game[] = [
  {
    id: 'snes_smw',
    title: 'SUPER MARIO WORLD',
    filename: 'Super Mario World (USA).sfc',
    system: 'SNES',
    core: 'snes9x_libretro_android.so',
    driveFileId: 'mock_drv_smw',
    fileSizeBytes: 524288,
    localRomPath: '',
    localSavePath: '',
    saveExtension: 'srm',
    isDownloaded: false,
  },
  {
    id: 'psx_sotn',
    title: 'CASTLEVANIA - SOTN',
    filename: 'Castlevania - Symphony of the Night (USA).chd',
    system: 'PSX',
    core: 'mednafen_psx_hw_libretro_android.so',
    driveFileId: 'mock_drv_sotn',
    fileSizeBytes: 380000000,
    localRomPath: '',
    localSavePath: '',
    saveExtension: 'mcd',
    isDownloaded: false,
  },
  {
    id: 'gen_sonic2',
    title: 'SONIC THE HEDGEHOG 2',
    filename: 'Sonic The Hedgehog 2 (USA, Europe).md',
    system: 'GENESIS',
    core: 'genesis_plus_gx_libretro_android.so',
    driveFileId: 'mock_drv_sonic2',
    fileSizeBytes: 1048576,
    localRomPath: '',
    localSavePath: '',
    saveExtension: 'srm',
    isDownloaded: false,
  },
  {
    id: 'gba_metroid',
    title: 'METROID FUSION',
    filename: 'Metroid Fusion (USA).gba',
    system: 'GBA',
    core: 'mgba_libretro_android.so',
    driveFileId: 'mock_drv_mfusion',
    fileSizeBytes: 8388608,
    localRomPath: '',
    localSavePath: '',
    saveExtension: 'srm',
    isDownloaded: false,
  },
  {
    id: 'nes_zelda',
    title: 'THE LEGEND OF ZELDA',
    filename: 'Legend of Zelda, The (USA).nes',
    system: 'NES',
    core: 'fceumm_libretro_android.so',
    driveFileId: 'mock_drv_zelda',
    fileSizeBytes: 131072,
    localRomPath: '',
    localSavePath: '',
    saveExtension: 'srm',
    isDownloaded: false,
  },
];

export const AltilloMainScreen: React.FC = () => {
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [selectedGame, setSelectedGame] = useState<Game | null>(INITIAL_GAMES[0]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<string>('CONECTAR DRIVE [Altillo8bits]');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar Google Sign-In
    GoogleDriveService.configure();

    // Inicializar motor de sincronización de Saves
    saveSyncEngine.init((statusText, syncing) => {
      setSyncStatus(statusText);
      setIsSyncing(syncing);
    });

    return () => {
      saveSyncEngine.destroy();
    };
  }, []);

  const handleConnectDrive = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('AUTENTICANDO CON GOOGLE...');
      const token = await GoogleDriveService.signIn();
      setSyncStatus('ESCANEANDO CARPETA Altillo8bits...');
      
      const driveGames = await GoogleDriveService.scanCatalogFromDrive();
      if (driveGames.length > 0) {
        setGames(driveGames);
        setSelectedGame(driveGames[0]);
        setSyncStatus(`DRIVE SINCRONIZADO: ${driveGames.length} JUEGOS ENCONTRADOS`);
      } else {
        setSyncStatus('CARPETA Altillo8bits VACÍA - USA TUS ROMs');
      }
      setIsSyncing(false);
    } catch (error: any) {
      setIsSyncing(false);
      setSyncStatus(`ERROR DRIVE: ${error.message || 'Fallo de autenticación'}`);
    }
  };

  const handleLaunchGame = async (gameToLaunch?: Game) => {
    const game = gameToLaunch || selectedGame;
    if (!game) return;

    try {
      setIsDownloading(true);
      setDownloadPercent(0);
      setSyncStatus(`PREPARANDO ${game.title}...`);

      // 1. Descarga o verificación en almacenamiento local
      const localRomPath = await DownloadManager.ensureRomLocally(game, (percent) => {
        setDownloadPercent(percent);
        setSyncStatus(`DESCARGANDO ${game.title}: ${percent}%`);
      });

      // 2. Preparar motor de saves
      await saveSyncEngine.prepareLaunch(game);

      setIsDownloading(false);
      setSyncStatus(`EJECUTANDO RETROARCH [${game.system}]...`);

      // 3. Lanzar emulador externo
      const launched = await EmulatorLauncher.launchGame(localRomPath, game.system, game.core);
      if (!launched) {
        Alert.alert(
          'RetroArch no detectado',
          'Por favor instala RetroArch (64-bit o 32-bit) desde la tienda o F-Droid para ejecutar el juego.'
        );
      }
    } catch (err: any) {
      setIsDownloading(false);
      setSyncStatus(`ERROR AL LANZAR: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* 1. Vigas y Techo de Madera del Altillo */}
      <View style={styles.topBeam}>
        <View style={styles.beamKnot} />
        <View style={styles.beamKnotRight} />
      </View>

      {/* 2. Header Superior: Título Retro y Conexión Drive */}
      <View style={styles.headerRow}>
        <View>
          <Text style={PixelTypography.title}>★ EL ALTILLO 8-BITS ★</Text>
          <Text style={styles.headerSubtitle}>RETRO LAUNCHER & CLOUD SYNC</Text>
        </View>

        <View style={styles.headerRight}>
          <SyncIndicator statusText={syncStatus} isSyncing={isSyncing || isDownloading} />
          <Pressable
            focusable={true}
            onPress={handleConnectDrive}
            style={({ pressed }) => [
              styles.driveButton,
              pressed && styles.driveButtonPressed,
            ]}
          >
            <Text style={styles.driveButtonText}>
              {userEmail ? `👤 ${userEmail}` : '☁ CONECTAR DRIVE'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Escenario Principal: TV CRT a la izquierda, Estante a la derecha */}
      <View style={styles.mainStage}>
        <TVConsolePreview
          game={selectedGame}
          isDownloading={isDownloading}
          downloadPercent={downloadPercent}
          onPressLaunch={() => handleLaunchGame()}
        />

        <CartridgeShelf
          games={games}
          selectedGame={selectedGame}
          onSelectGame={(g) => setSelectedGame(g)}
          onLaunchGame={(g) => handleLaunchGame(g)}
        />
      </View>

      {/* 4. Footer con Mapa de Controles / Teclas */}
      <View style={styles.footerRow}>
        <Text style={styles.footerHelpText}>
          [D-PAD / FLECHAS] NAVEGAR   |   [A / ENTER] JUGAR   |   [B / ESC] VOLVER
        </Text>
        <Text style={styles.footerVersion}>v1.0.0 (PSX READY)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PixelColors.bgDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  topBeam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: PixelColors.woodLight,
    borderBottomWidth: 3,
    borderBottomColor: PixelColors.woodDark,
  },
  beamKnot: {
    position: 'absolute',
    left: 40,
    top: 3,
    width: 20,
    height: 6,
    backgroundColor: PixelColors.woodDark,
    borderRadius: 3,
  },
  beamKnotRight: {
    position: 'absolute',
    right: 100,
    top: 3,
    width: 28,
    height: 6,
    backgroundColor: PixelColors.woodDark,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: PixelColors.woodDark,
  },
  headerSubtitle: {
    color: PixelColors.woodHighlight,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driveButton: {
    backgroundColor: PixelColors.woodDark,
    borderWidth: 2,
    borderColor: PixelColors.crtGlowCyan,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  driveButtonPressed: {
    backgroundColor: PixelColors.woodLight,
  },
  driveButtonText: {
    color: PixelColors.crtGlowCyan,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  mainStage: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 2,
    borderTopColor: PixelColors.woodDark,
  },
  footerHelpText: {
    color: PixelColors.textMuted,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  footerVersion: {
    color: PixelColors.crtGlowAmber,
    fontSize: 8,
    fontWeight: 'bold',
  },
});
