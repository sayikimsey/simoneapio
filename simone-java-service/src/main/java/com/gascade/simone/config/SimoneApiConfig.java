package com.gascade.simone.config;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;

/**
 * Konfigurationsklasse für die SIMONE API.
 * Lädt die native Remote-Bibliothek und erzwingt deren Nutzung durch "Library Masquerading".
 */
@Configuration
public class SimoneApiConfig {

    private static final Logger log = LoggerFactory.getLogger(SimoneApiConfig.class);

    // Name der Remote-Lib für JNI (Java erwartet libSimoneRemoteApiJava.so)
    private static final String LIB_NAME_REMOTE = "libSimoneRemoteApiJava.so";
    // Name der Lokalen-Lib für JNI (Java erwartet libSimoneApiJava.so)
    private static final String LIB_NAME_LOCAL = "libSimoneApiJava.so";

    @Value("${simone.api.library.path}")
    private String simoneApiLibraryPath;

    @Bean
    public SimoneApi simoneApi() {
        log.info("=== Initialisierung SIMONE Remote API (Masquerade Mode) ===");
        log.info("Quell-Bibliothek: {}", simoneApiLibraryPath);

        if (simoneApiLibraryPath == null || simoneApiLibraryPath.trim().isEmpty()) {
            throw new IllegalStateException("Property 'simone.api.library.path' ist nicht gesetzt.");
        }

        try {
            File sourceLibFile = new File(simoneApiLibraryPath);
            if (!sourceLibFile.exists()) {
                throw new IllegalStateException("Bibliotheksdatei nicht gefunden: " + simoneApiLibraryPath);
            }

            // 1. Installationspfad setzen (z.B. /opt/simone/Simone-V6_37)
            // Dies ist notwendig, damit die Bibliothek ihre Abhängigkeiten (z.B. shlib) findet.
            String installPath = sourceLibFile.getParentFile().getParent();
            log.info("Setze SIMONE Installationspfad auf: {}", installPath);
            SimoneApi.simone_api_set_simone_path(installPath);

            // 2. Masquerading: Wir laden die Remote-Lib unter BEIDEN Namen.
            // Das verhindert, dass SimoneApi.java aus Versehen die echte lokale Lib lädt,
            // falls diese im System-Pfad liegt.
            loadLibraryAs(sourceLibFile, LIB_NAME_REMOTE); // Für getRemoteApiInstance()
            loadLibraryAs(sourceLibFile, LIB_NAME_LOCAL);  // Falls getInstance() intern aufgerufen wird

            // 3. Instanz holen
            // Wir rufen getRemoteApiInstance auf, da dies der korrekte Einstiegspunkt ist.
            SimoneApi api = SimoneApi.getRemoteApiInstance();
            
            // 4. Check: Ist der Modus jetzt korrekt? (Sollte 2 sein)
            // Da wir die Libs manuell geladen haben, sollte selbst ein interner Fallback
            // auf "Local" jetzt unseren Remote-Code ausführen.
            try {
                int runMode = api.simone_get_runmode();
                String modeStr = (runMode == SimoneConst.SIMONE_RUNMODE_REMOTE) ? "REMOTE" : "LOCAL";
                log.info("API Run-Mode nach Laden: {} ({})", runMode, modeStr);
                
                if (runMode != SimoneConst.SIMONE_RUNMODE_REMOTE) {
                    log.warn("ACHTUNG: API meldet immer noch LOCAL-Modus. Dies ist unerwartet nach Masquerading.");
                }
            } catch (Throwable t) {
                log.warn("Konnte Runmode nicht prüfen: {}", t.getMessage());
            }

            return api;

        } catch (UnsatisfiedLinkError e) {
            log.error("Link-Fehler: {}", e.getMessage());
            throw new RuntimeException("Konnte native SIMONE Bibliothek nicht laden.", e);
        } catch (Exception e) {
            log.error("Fehler in API Config: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Kopiert die Quell-Bibliothek in das Temp-Verzeichnis unter dem Zielnamen und lädt sie.
     */
    private void loadLibraryAs(File sourceFile, String targetName) throws IOException {
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        File tempFile = new File(tempDir, targetName);

        // Alte Datei löschen, um sicherzugehen
        if (tempFile.exists()) {
            try {
                tempFile.delete();
            } catch (Exception e) {
                log.warn("Konnte alte Temp-Datei {} nicht löschen: {}", targetName, e.getMessage());
            }
        }

        log.info("Kopiere '{}' nach '{}'...", sourceFile.getName(), tempFile.getAbsolutePath());
        Files.copy(sourceFile.toPath(), tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        tempFile.deleteOnExit();

        log.info("Lade Bibliothek: {}", targetName);
        System.load(tempFile.getAbsolutePath());
    }
}
