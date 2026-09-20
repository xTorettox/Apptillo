import ReactNativeBlobUtil from 'react-native-blob-util';
import { Game } from '../types';
import { GoogleDriveService } from './GoogleDriveService';
import { EmulatorLauncher } from './EmulatorLauncher';

export class DownloadManager {
  /**
   * Garantiza que el juego esté en el almacenamiento local antes de ejecutar.
   * Si ya existe, no vuelve a descargarlo.
   */
  public static async ensureRomLocally(
    game: Game,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const paths = await EmulatorLauncher.getStoragePaths();
    const targetPath = `${paths.romsPath}/${game.filename}`;

    const exists = await ReactNativeBlobUtil.fs.exists(targetPath);
    if (exists) {
      const stat = await ReactNativeBlobUtil.fs.stat(targetPath);
      // Si el tamaño coincide con el archivo de Drive, usar el local
      if (game.fileSizeBytes === 0 || Number(stat.size) === game.fileSizeBytes) {
        if (onProgress) onProgress(100);
        return targetPath;
      }
    }

    // Si no existe o está incompleto, descargar desde Google Drive
    await GoogleDriveService.downloadFile(game.driveFileId, targetPath, (received, total) => {
      if (onProgress && total > 0) {
        const percent = Math.round((received / total) * 100);
        onProgress(percent);
      }
    });

    return targetPath;
  }

  /**
   * Elimina un juego de la caché local para liberar espacio.
   */
  public static async removeLocalRom(game: Game): Promise<boolean> {
    const paths = await EmulatorLauncher.getStoragePaths();
    const targetPath = `${paths.romsPath}/${game.filename}`;
    if (await ReactNativeBlobUtil.fs.exists(targetPath)) {
      await ReactNativeBlobUtil.fs.unlink(targetPath);
      return true;
    }
    return false;
  }
}
