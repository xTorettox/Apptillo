export type RetroSystem =
  | 'NES'
  | 'SNES'
  | 'GENESIS'
  | 'GBA'
  | 'PSX'
  | 'N64'
  | 'GB'
  | 'GBC'
  | 'ARCADE'
  | 'NEOGEO';

export interface SystemConfig {
  system: RetroSystem;
  displayName: string;
  defaultCore: string;
  alternateCores?: string[];
  saveExtensions: string[];
  romExtensions: string[];
  themeColor: string;
  iconName: string;
}

export interface Game {
  id: string;
  title: string;
  filename: string;
  system: RetroSystem;
  core: string;
  driveFileId: string;
  fileSizeBytes: number;
  localRomPath: string;
  localSavePath: string;
  saveExtension: string;
  isDownloaded: boolean;
  lastPlayedTimestamp?: number;
  coverDriveId?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
}

export type SyncState =
  | 'IDLE'
  | 'AUTHENTICATING'
  | 'SCANNING_DRIVE'
  | 'DOWNLOADING_ROM'
  | 'SYNCING_SAVE_DOWN'
  | 'SYNCING_SAVE_UP'
  | 'LAUNCHING_EMULATOR'
  | 'READY'
  | 'ERROR';

export interface SyncMessage {
  state: SyncState;
  message: string;
  progressPercent?: number;
  timestamp: number;
}
