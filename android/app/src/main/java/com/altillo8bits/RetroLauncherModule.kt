package com.altillo8bits

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class RetroLauncherModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "RetroLauncher"

    /**
     * Verifica si una aplicación / emulador está instalado en el dispositivo.
     */
    @ReactMethod
    fun isEmulatorInstalled(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
            promise.resolve(true)
        } catch (e: PackageManager.NameNotFoundException) {
            promise.resolve(false)
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_INSTALLED", e.message, e)
        }
    }

    /**
     * Devuelve las rutas de almacenamiento de la app para ROMs y Saves.
     */
    @ReactMethod
    fun getStoragePaths(promise: Promise) {
        try {
            val map = Arguments.createMap()
            val cacheDir = reactContext.cacheDir
            val filesDir = reactContext.filesDir
            val externalFilesDir = reactContext.getExternalFilesDir(null)

            val romsDir = File(filesDir, "roms").apply { mkdirs() }
            val savesDir = File(filesDir, "saves").apply { mkdirs() }

            map.putString("cachePath", cacheDir.absolutePath)
            map.putString("filesPath", filesDir.absolutePath)
            map.putString("romsPath", romsDir.absolutePath)
            map.putString("savesPath", savesDir.absolutePath)
            map.putString("externalFilesPath", externalFilesDir?.absolutePath ?: filesDir.absolutePath)

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_STORAGE_PATHS", e.message, e)
        }
    }

    /**
     * Lanza un juego enviando un Intent explícito a RetroArch (32/64 bit).
     */
    @ReactMethod
    fun launchGame(
        romPath: String,
        coreName: String,
        packageName: String?,
        customConfig: String?,
        promise: Promise
    ) {
        try {
            val targetPackage = packageName ?: detectRetroArchPackage()
            if (targetPackage == null) {
                promise.reject(
                    "ERR_EMULATOR_NOT_FOUND",
                    "No se encontró RetroArch instalado (probado: com.retroarch.aarch64, com.retroarch, com.retroarch.ra32)"
                )
                return
            }

            val romFile = File(romPath)
            if (!romFile.exists()) {
                promise.reject("ERR_ROM_NOT_FOUND", "El archivo de ROM no existe en la ruta: $romPath")
                return
            }

            // Generar URI segura vía FileProvider
            val romUri: Uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                romFile
            )

            val intent = Intent(Intent.ACTION_MAIN).apply {
                component = ComponentName(
                    targetPackage,
                    "com.retroarch.browser.retroactivity.RetroActivityFuture"
                )
                putExtra("ROM", romFile.absolutePath)
                putExtra("LIBRETRO", "/data/data/$targetPackage/cores/$coreName")
                if (!customConfig.isNullOrEmpty()) {
                    putExtra("CONFIGFILE", customConfig)
                }
                data = romUri
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_GRANT_READ_URI_PERMISSION or
                        Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            }

            // Otorga permisos explícitos de lectura a RetroArch
            reactContext.grantUriPermission(
                targetPackage,
                romUri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            )

            val currentActivity = reactContext.currentActivity
            if (currentActivity != null) {
                currentActivity.startActivity(intent)
            } else {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
            }

            val result = Arguments.createMap()
            result.putBoolean("success", true)
            result.putString("targetPackage", targetPackage)
            result.putString("coreName", coreName)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCH_FAILED", "Error al lanzar RetroArch: ${e.message}", e)
        }
    }

    private fun detectRetroArchPackage(): String? {
        val candidates = listOf("com.retroarch.aarch64", "com.retroarch", "com.retroarch.ra32")
        val pm = reactContext.packageManager
        for (pkg in candidates) {
            try {
                pm.getPackageInfo(pkg, PackageManager.GET_ACTIVITIES)
                return pkg
            } catch (_: PackageManager.NameNotFoundException) {
                // Continuar buscando
            }
        }
        return null
    }
}
