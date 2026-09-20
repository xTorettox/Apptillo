import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Game } from '../types';
import { GoogleDriveService } from './GoogleDriveService';
import { EmulatorLauncher } from './EmulatorLauncher';

export type SaveSyncCallback = (statusText: string, isSyncing: boolean) => void;

export class SaveSyncEngine {
  private static instance: SaveSyncEngine | null = null;
  private appStateSubscription: NativeEventSubscription | null = null;
  private activeGameWatch: {
    game: Game;
    localSavePath: string;
    saveFilename: string;
    lastMtime: number;
  } | null = null;
  private listener: SaveSyncCallback | null = null;

  private constructor() {}

  public static getInstance(): SaveSyncEngine {
    if (!this.instance) {
      this.instance = new SaveSyncEngine();
    }
    return this.instance;
  }

  public init(callback?: SaveSyncCallback) {
    if (callback) this.listener = callback;
    if (!this.appStateSubscription) {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    }
  }

  public setListener(callback: SaveSyncCallback) {
    this.listener = callback;
  }

  /**
   * Prepara el entorno de partidas antes de abrir el juego en RetroArch.
   */
  public async prepareLaunch(game: Game): Promise<{ localSavePath: string }> {
    const paths = await EmulatorLauncher.getStoragePaths();
    // RetroArch guarda por defecto con el mismo nombre base que la ROM
    const baseName = game.filename.substring(0, game.filename.lastIndexOf('.'));
    const saveFilename = `${baseName}.${game.saveExtension}`;
    const localSavePath = `${paths.savesPath}/${saveFilename}`;

    let lastMtime = 0;
    if (await ReactNativeBlobUtil.fs.exists(localSavePath)) {
      const stat = await ReactNativeBlobUtil.fs.stat(localSavePath);
      lastMtime = Number(stat.lastModified);
    }

    this.activeGameWatch = {
      game,
      localSavePath,
      saveFilename,
      lastMtime,
    };

    return { localSavePath };
  }

  private handleAppStateChange = async (nextState: AppStateStatus) => {
    // Al volver del emulador a la aplicación del Altillo
    if (nextState === 'active' && this.activeGameWatch) {
      const { game, localSavePath, saveFilename, lastMtime } = this.activeGameWatch;
      try {
        if (await ReactNativeBlobUtil.fs.exists(localSavePath)) {
          const stat = await ReactNativeBlobUtil.fs.stat(localSavePath);
          const currentMtime = Number(stat.lastModified);

          if (currentMtime > lastMtime) {
            this.notify(`💾 NUEVA PARTIDA DETECTADA: SUBIENDO A DRIVE...`, true);
            await GoogleDriveService.uploadSaveFile(game.id, saveFilename, localSavePath);
            this.activeGameWatch.lastMtime = currentMtime;
            this.notify(`★ PARTIDA GUARDADA EN GOOGLE DRIVE [${saveFilename}] ★`, false);
          } else {
            this.notify(`SIN CAMBIOS EN PARTIDA GUARDADA`, false);
          }
        }
      } catch (err: any) {
        this.notify(`⚠️ ERROR AL SINCRONIZAR SAVE: ${err.message}`, false);
      }
    }
  };

  private notify(text: string, isSyncing: boolean) {
    if (this.listener) {
      this.listener(text, isSyncing);
    }
  }

  public destroy() {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }
}

export const saveSyncEngine = SaveSyncEngine.getInstance();
