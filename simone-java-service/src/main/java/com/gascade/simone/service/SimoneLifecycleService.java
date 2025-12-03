package com.gascade.simone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;   
import org.springframework.stereotype.Service;

import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi; 
import de.liwacom.simone.SimoneConst;
import jakarta.annotation.PreDestroy;

/**
 * Service-Klasse zur Verwaltung des Lebenszyklus der SIMONE API.
 */
@Service
public class SimoneLifecycleService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleService.class);

    private final SimoneApi simoneApi;
    private boolean isSimoneEnvironmentInitialized = false;
    
    // --- KONSTANTEN FÜR DEN REMOTE-SERVER ---
    private static final String API_SERVER_HOST = "winsimone01.gascadead.gascade.de";
    private static final int API_SERVER_PORT = 6612;
    private static final String CONFIG_FILENAME_WITHOUT_EXTENSION = "api_server"; 


    @Value("${simone.default.config.file.path}")
    private String defaultSimoneConfigFilePath;
    
    // Der fehlerhafte statische Ladeblock wurde entfernt.


    /**
     * Konstruktor, injiziert die Singleton-Instanz der SimoneApi.
     */
    public SimoneLifecycleService(SimoneApi simoneApi) {
        if (simoneApi == null) {
            logger.error("KRITISCH: SimoneApi Instanz konnte nicht injiziert werden. Die API ist nicht nutzbar.");
            throw new IllegalStateException("SimoneApi Instanz ist null. Native Bibliothek konnte nicht geladen oder die Bean nicht erstellt werden.");
        }
        this.simoneApi = simoneApi;
        logger.info("SIMONE-API-Instanz erfolgreich injiziert.");
    }

    /**
     * Gibt die API-Versionsnummer als lesbare Zeichenkette zurück.
     */
    public String getSimoneApiVersionString() {
        if (this.simoneApi == null) {
            return "Fehler: SIMONE API native Komponente nicht geladen (Instanz ist null).";
        }

        try {
            logger.info("Abfrage der SIMONE-API-Version...");
            
            // simone_set_remote_connection() wird nur hier aufgerufen, um Status 15 zu protokollieren.
            // Der fehlerhafte Status 15 beweist das falsche JNI-Binding.
            int connStatus = this.simoneApi.simone_set_remote_connection(API_SERVER_HOST, API_SERVER_PORT);
            logger.warn("simone_set_remote_connection Status (Health Check): {}", connStatus);

            int versionInt = this.simoneApi.simone_api_version();
            logger.info("Rohwert der SIMONE API-Version: {}", versionInt);

            return (versionInt >= 0)
                    ? versionInt + " (Rohwert)"
                    : "API-Fehlercode: " + versionInt;
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler bei simone_api_version(): {}", ule.getMessage(), ule);
            return "Fehler: Link-Fehler der nativen Remote Bibliothek.";
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei simone_api_version(): {}", t.getMessage(), t);
            return "Fehler beim Abrufen der SIMONE API-Version.";
        }
    }

    /**
     * Initialisiert die SIMONE-Umgebung.
     *
     * @param configFilePath Optionaler Pfad (IGNORIERT).
     * @param useTemporaryConfigCopy (IGNORIERT).
     * @return Ergebnistext zur Initialisierung.
     */
    public String initializeSimone(String configFilePath, Boolean useTemporaryConfigCopy) {
        
        if (this.simoneApi == null) {
            this.isSimoneEnvironmentInitialized = false;
            return "Initialisierung fehlgeschlagen: SIMONE API Instanz nicht verfügbar.";
        }
        if (this.isSimoneEnvironmentInitialized) {
            logger.warn("SIMONE API ist bereits initialisiert.");
            return "SIMONE API ist bereits initialisiert.";
        }
        
        // 1. Explizite Remote-Verbindung setzen
        int connStatus = this.simoneApi.simone_set_remote_connection(API_SERVER_HOST, API_SERVER_PORT);
        if (connStatus != 0) {
             // Wenn dies fehlschlägt (Status 15), kann init_ex nicht erfolgreich sein.
             logger.error("simone_set_remote_connection fehlgeschlagen. Status: {}", connStatus);
        }

        // 2. Explizite Konfiguration (Dateiname und TMP_CONFIG)
        final String initFilePath = CONFIG_FILENAME_WITHOUT_EXTENSION; 
        final int flags = SimoneConst.SIMONE_FLAG_TMP_CONFIG; 
        final String logPath = initFilePath + ".INI (Temporäre Kopie)"; 
        
        logger.info("Initialisiere SIMONE Remote API. Konfiguration: [{}] | Flags: {}", logPath, flags);

        try {
            // simone_init_ex wird mit dem Dateinamen ohne Endung und TMP_CONFIG aufgerufen.
            int status = this.simoneApi.simone_init_ex(initFilePath, flags); 
            logger.info("simone_init_ex Rückgabewert: {}", status);

            if (status == SimoneConst.simone_status_ok) {
                this.isSimoneEnvironmentInitialized = true;
                logger.info("SIMONE Remote API erfolgreich initialisiert mit Konfiguration: {}", logPath);
                return "SIMONE API erfolgreich initialisiert (Remote Verbindung hergestellt).";
            } else {
                this.isSimoneEnvironmentInitialized = false;
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                
                logger.error("Fehler bei Remote Initialisierung: Status: {}, SIMONE-Fehler: {}", status, errorMsg.getVal());
                return "Initialisierung fehlgeschlagen. Status: " + status + ". SIMONE Remote Fehler: " + errorMsg.getVal();
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler während Initialisierung: {}", ule.getMessage(), ule);
            return "Initialisierung fehlgeschlagen: Link-Fehler der nativen Bibliothek.";
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei Initialisierung: {}", t.getMessage(), t);
            return "Initialisierung fehlgeschlagen: Unerwarteter Fehler: " + t.getMessage();
        }
    }

    /**
     * Gibt die SIMONE-Umgebung als initialisiert zurück.
     */
    public boolean isSimoneEnvironmentInitialized() {
        return this.simoneApi != null && isSimoneEnvironmentInitialized;
    }

    /**
     * Terminierung der SIMONE API.
     */
    public String terminateSimone() {
        logger.info("SIMONE Remote API Termination wird durchgeführt (simone_end())...");

        if (this.simoneApi == null || !this.isSimoneEnvironmentInitialized) {
            if (this.isSimoneEnvironmentInitialized) {
                logger.warn("Beendigung der API-Session fehlgeschlagen, da API-Instanz null ist.");
            } else {
                 logger.info("SIMONE war nicht initialisiert – keine aktive Remote-Sitzung zum Beenden.");
            }
            this.isSimoneEnvironmentInitialized = false;
            return "SIMONE API war nicht initialisiert.";
        }

        try {
            int status = this.simoneApi.simone_end();
            logger.info("simone_end() Rückgabewert: {}", status);
            this.isSimoneEnvironmentInitialized = false;

            if (status == SimoneConst.simone_status_ok) {
                return "SIMONE API erfolgreich beendet (Remote-Sitzung geschlossen).";
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                logger.warn("Remote Beendigung lieferte Status: {}, SIMONE: {}", status, errorMsg.getVal());
                return "Beendigung SIMONE API fehlgeschlagen. Status " + status + ". SIMONE Fehler: " + errorMsg.getVal();
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler bei Beendigung: {}", ule.getMessage(), ule);
            return "Beendigung fehlgeschlagen: Link-Fehler der nativen Bibliothek.";
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei Beendigung: {}", t.getMessage(), t);
            return "Beendigung fehlgeschlagen: Unerwarteter Fehler: " + t.getMessage();
        }
    }

    @PreDestroy
    public void onShutdown() {
        logger.info("Anwendung wird beendet. Versuche SIMONE Remote API zu terminieren...");
        if (this.isSimoneEnvironmentInitialized && this.simoneApi != null) {
            terminateSimone();
        } else {
            logger.info("SIMONE war nicht initialisiert – keine Remote-Sitzung zum Beenden notwendig.");
        }
    }

    public synchronized String reinitializeSimone() {
        logger.warn("SIMONE Remote API wird neu initialisiert...");

        terminateSimone();

        String initMessage = initializeSimone(CONFIG_FILENAME_WITHOUT_EXTENSION, Boolean.TRUE);

        if (isSimoneEnvironmentInitialized()) {
            logger.info("SIMONE Remote API erfolgreich neu initialisiert.");
            return "SIMONE erfolgreich neu initialisiert.";
        } else {
            logger.error("Reinitialisierung fehlgeschlagen: {}", initMessage);
            throw new RuntimeException("Reinitialisierung SIMONE fehlgeschlagen: " + initMessage);
        }
    }
}