import { NativeModules } from 'react-native';
import { RetroSystem, SystemConfig } from '../types';
import { PixelColors } from '../theme/pixelTheme';

const { RetroLauncher } = NativeModules;

export const SYSTEM_CONFIGS: Record<RetroSystem, SystemConfig> = {
  NES: {
    system: 'NES',
    displayName: 'Nintendo NES',
    defaultCore: 'fceumm_libretro_android.so',
    alternateCores: ['nestopia_libretro_android.so', 'mesen_libretro_android.so'],
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.nes', '.fds', '.unf', '.zip', '.7z'],
    themeColor: PixelColors.genesisRed,
    iconName: 'gamepad-variant-outline',
  },
  SNES: {
    system: 'SNES',
    displayName: 'Super Nintendo',
    defaultCore: 'snes9x_libretro_android.so',
    alternateCores: ['snes9x2010_libretro_android.so', 'bsnes_libretro_android.so'],
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.smc', '.sfc', '.fig', '.zip', '.7z'],
    themeColor: PixelColors.snesPurple,
    iconName: 'gamepad',
  },
  GENESIS: {
    system: 'GENESIS',
    displayName: 'Sega Genesis / MegaDrive',
    defaultCore: 'genesis_plus_gx_libretro_android.so',
    alternateCores: ['picodrive_libretro_android.so'],
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.bin', '.gen', '.smd', '.md', '.zip', '.7z'],
    themeColor: '#000000',
    iconName: 'controller-classic',
  },
  GBA: {
    system: 'GBA',
    displayName: 'Game Boy Advance',
    defaultCore: 'mgba_libretro_android.so',
    alternateCores: ['vba_next_libretro_android.so'],
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.gba', '.zip', '.7z'],
    themeColor: PixelColors.gbaIndigo,
    iconName: 'gamepad-square',
  },
  GB: {
    system: 'GB',
    displayName: 'Game Boy',
    defaultCore: 'gambatte_libretro_android.so',
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.gb', '.zip', '.7z'],
    themeColor: '#8b956d',
    iconName: 'gamepad-square',
  },
  GBC: {
    system: 'GBC',
    displayName: 'Game Boy Color',
    defaultCore: 'gambatte_libretro_android.so',
    saveExtensions: ['srm', 'state'],
    romExtensions: ['.gbc', '.zip', '.7z'],
    themeColor: '#4d194d',
    iconName: 'gamepad-square',
  },
  PSX: {
    system: 'PSX',
    displayName: 'Sony PlayStation 1',
    defaultCore: 'mednafen_psx_hw_libretro_android.so',
    alternateCores: ['swanstation_libretro_android.so', 'pcsx_rearmed_libretro_android.so'],
    saveExtensions: ['srm', 'mcd', 'mcr', 'state'],
    romExtensions: ['.chd', '.cue', '.iso', '.pbp', '.bin'],
    themeColor: PixelColors.psxBlue,
    iconName: 'playstation',
  },
  N64: {
    system: 'N64',
    displayName: 'Nintendo 64',
    defaultCore: 'mupen64plus_next_libretro_android.so',
    saveExtensions: ['srm', 'eep', 'fla', 'mpk', 'state'],
    romExtensions: ['.z64', '.n64', '.v64', '.zip', '.7z'],
    themeColor: '#007f5f',
    iconName: 'nintendo-switch',
  },
  ARCADE: {
    system: 'ARCADE',
    displayName: 'Arcade MAME / FBNeo',
    defaultCore: 'fbneo_libretro_android.so',
    saveExtensions: ['fs', 'state'],
    romExtensions: ['.zip', '.7z'],
    themeColor: '#f77f00',
    iconName: 'space-invaders',
  },
  NEOGEO: {
    system: 'NEOGEO',
    displayName: 'SNK Neo Geo',
    defaultCore: 'fbneo_libretro_android.so',
    saveExtensions: ['fs', 'nv', 'state'],
    romExtensions: ['.zip', '.7z'],
    themeColor: '#d90429',
    iconName: 'space-invaders',
  },
};

export class EmulatorLauncher {
  public static async getStoragePaths(): Promise<{
    cachePath: string;
    filesPath: string;
    romsPath: string;
    savesPath: string;
    externalFilesPath: string;
  }> {
    if (!RetroLauncher) {
      return {
        cachePath: '/data/user/0/com.altillo8bits/cache',
        filesPath: '/data/user/0/com.altillo8bits/files',
        romsPath: '/data/user/0/com.altillo8bits/files/roms',
        savesPath: '/data/user/0/com.altillo8bits/files/saves',
        externalFilesPath: '/storage/emulated/0/Android/data/com.altillo8bits/files',
      };
    }
    return await RetroLauncher.getStoragePaths();
  }

  public static async isRetroArchInstalled(): Promise<boolean> {
    if (!RetroLauncher) return false;
    const is64Installed = await RetroLauncher.isEmulatorInstalled('com.retroarch.aarch64');
    if (is64Installed) return true;
    const is32Installed = await RetroLauncher.isEmulatorInstalled('com.retroarch');
    if (is32Installed) return true;
    return await RetroLauncher.isEmulatorInstalled('com.retroarch.ra32');
  }

  public static async launchGame(
    romPath: string,
    system: RetroSystem,
    customCore?: string
  ): Promise<boolean> {
    const config = SYSTEM_CONFIGS[system];
    const coreToUse = customCore || config.defaultCore;

    if (!RetroLauncher) {
      console.warn(`[EmulatorLauncher] Módulo nativo no disponible. Simulando lanzamiento de ${romPath} con core ${coreToUse}`);
      return true;
    }

    const result = await RetroLauncher.launchGame(romPath, coreToUse, null, null);
    return result.success;
  }
}
