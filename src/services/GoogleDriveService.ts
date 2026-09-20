import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { DriveItem, Game, RetroSystem } from '../types';
import { SYSTEM_CONFIGS } from './EmulatorLauncher';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export class GoogleDriveService {
  private static accessToken: string | null = null;
  private static rootFolderId: string | null = null;

  public static configure(webClientId?: string) {
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
      webClientId: webClientId || '',
      offlineAccess: true,
    });
  }

  public static async signIn(): Promise<string> {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    this.accessToken = tokens.accessToken;
    return this.accessToken;
  }

  public static async getValidAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;
    const tokens = await GoogleSignin.getTokens();
    this.accessToken = tokens.accessToken;
    return this.accessToken;
  }

  /**
   * Busca o crea la carpeta raíz 'Altillo8bits' en el Drive del usuario.
   */
  public static async getAltilloRootFolder(): Promise<string> {
    if (this.rootFolderId) return this.rootFolderId;
    const token = await this.getValidAccessToken();

    const query = encodeURIComponent("name = 'Altillo8bits' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const response = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      this.rootFolderId = data.files[0].id;
      return this.rootFolderId!;
    }

    // Si no existe, crear la carpeta raíz 'Altillo8bits'
    const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Altillo8bits',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const newFolder = await createResponse.json();
    this.rootFolderId = newFolder.id;
    return this.rootFolderId!;
  }

  /**
   * Obtiene la lista de juegos explorando las subcarpetas del Altillo.
   */
  public static async scanCatalogFromDrive(): Promise<Game[]> {
    const rootId = await this.getAltilloRootFolder();
    const token = await this.getValidAccessToken();

    // Buscar todos los archivos no eliminados dentro de Altillo8bits
    const query = encodeURIComponent(`'${rootId}' in parents and trashed = false`);
    const response = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime)`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    const items: DriveItem[] = result.files || [];
    const games: Game[] = [];

    for (const item of items) {
      // Deducir el sistema por la extensión del archivo
      const lower = item.name.toLowerCase();
      let matchedSystem: RetroSystem | null = null;

      for (const [sysKey, config] of Object.entries(SYSTEM_CONFIGS)) {
        if (config.romExtensions.some(ext => lower.endsWith(ext))) {
          matchedSystem = sysKey as RetroSystem;
          break;
        }
      }

      if (matchedSystem) {
        const cleanTitle = item.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').toUpperCase();
        games.push({
          id: item.id,
          title: cleanTitle,
          filename: item.name,
          system: matchedSystem,
          core: SYSTEM_CONFIGS[matchedSystem].defaultCore,
          driveFileId: item.id,
          fileSizeBytes: parseInt(item.size || '0', 10),
          localRomPath: '',
          localSavePath: '',
          saveExtension: SYSTEM_CONFIGS[matchedSystem].saveExtensions[0],
          isDownloaded: false,
        });
      }
    }

    return games;
  }

  /**
   * Descarga un archivo de ROM en streaming directo al almacenamiento local.
   */
  public static async downloadFile(
    fileId: string,
    destinationPath: string,
    onProgress?: (received: number, total: number) => void
  ): Promise<string> {
    const token = await this.getValidAccessToken();
    const url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;

    const res = await ReactNativeBlobUtil.config({
      path: destinationPath,
      fileCache: true,
    })
      .fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      })
      .progress((received, total) => {
        if (onProgress) {
          onProgress(Number(received), Number(total));
        }
      });

    return res.path();
  }

  /**
   * Sube o reemplaza un archivo de partida guardada (.srm / .mcd / .state) en Google Drive.
   */
  public static async uploadSaveFile(
    gameId: string,
    saveFilename: string,
    localSavePath: string
  ): Promise<string> {
    const token = await this.getValidAccessToken();
    const rootId = await this.getAltilloRootFolder();

    // 1. Buscar si ya existe un save previo para este juego
    const query = encodeURIComponent(`name = '${saveFilename}' and '${rootId}' in parents and trashed = false`);
    const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchData = await searchRes.json();
    const existingFileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

    // 2. Leer bytes del archivo local y subir a Drive
    const base64Data = await ReactNativeBlobUtil.fs.readFile(localSavePath, 'base64');
    
    if (existingFileId) {
      // Actualizar archivo existente (PATCH)
      const patchUrl = `${DRIVE_UPLOAD_URL}/${existingFileId}?uploadType=media`;
      await ReactNativeBlobUtil.fetch(
        'PATCH',
        patchUrl,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
        base64Data
      );
      return existingFileId;
    } else {
      // Crear nuevo archivo multipart
      const metadata = JSON.stringify({
        name: saveFilename,
        parents: [rootId],
      });

      const uploadRes = await ReactNativeBlobUtil.fetch(
        'POST',
        `${DRIVE_UPLOAD_URL}?uploadType=multipart`,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/related; boundary=foo_bar_baz',
        },
        [
          { name: 'metadata', data: metadata, type: 'application/json; charset=UTF-8' },
          { name: 'file', filename: saveFilename, type: 'application/octet-stream', data: base64Data },
        ]
      );

      const json = await uploadRes.json();
      return json.id;
    }
  }
}
