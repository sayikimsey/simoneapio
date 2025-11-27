
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
 * Verantwortlich für Initialisierung, Terminierung und Re-Initialisierung
 * der Remote API Verbindung.
 */
@Service
public class SimoneLifecycleService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleService.class);

    private final SimoneApi simoneApi;
    private boolean isSimoneEnvironmentInitialized = false;
    
    // Pfad zur api.ini auf dem WINDOWS SERVER (Remote API). Dieser Pfad wird 
    // verwendet, wenn das Frontend keinen expliziten Pfad übergibt.
    @Value("${simone.default.config.file.path}")
    private String defaultSimoneConfigFilePath;

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
     * Führt eine Normalisierung des Pfades durch, um Forward Slashes (/) durch Backslashes (\) 
     * zu ersetzen, was für die Windows-basierte SIMONE API oft zuverlässiger ist.
     * @param path Der einzugebende Pfad (kann null sein).
     * @return Der bereinigte Pfad oder null.
     */
    private String normalizeWindowsPath(String path) {
        if (path == null) {
            return null;
        }
        // Ersetzt alle Forward Slashes durch Backslashes.
        return path.trim().replace('/', '\\');
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
            int versionInt = this.simoneApi.simone_api_version();
            logger.info("Rohwert der SIMONE API-Version: {}", versionInt);

            return (versionInt >= 0)
                    ? versionInt + " (Rohwert)"
                    : "API-Fehlercode: " + versionInt;
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler bei simone_api_version() (Native Methode nicht gefunden): {}", ule.getMessage(), ule);
            return "Fehler: Link-Fehler der nativen Remote Bibliothek.";
        } catch (Throwable t) {
            logger.error("Fehler bei simone_api_version(): {}", t.getMessage(), t);
            return "Fehler beim Abrufen der SIMONE API-Version.";
        }
    }

    /**
     * Initialisiert die SIMONE-Umgebung mit angegebener Konfigurationsdatei.
     * Dies baut die Verbindung zum SIMONE API Server auf dem Windows Server auf.
     *
     * @param configFilePath Optionaler Pfad zur Konfigurationsdatei auf dem Windows Server.
     * @param useTemporaryConfigCopy true = temporäre Kopie verwenden (SIMONE_FLAG_TMP_CONFIG).
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

        // Zuerst den effektiven Pfad bestimmen
        String pathFromRequest = normalizeWindowsPath(configFilePath);
        String pathFromDefault = normalizeWindowsPath(defaultSimoneConfigFilePath);

        String effectiveConfigPath = (pathFromRequest != null && !pathFromRequest.trim().isEmpty())
                ? pathFromRequest.trim()
                : pathFromDefault;

        if (effectiveConfigPath == null || effectiveConfigPath.trim().isEmpty()) {
            logger.error("Konfigurationspfad ist leer oder nicht gesetzt.");
            return "Initialisierung fehlgeschlagen: Kein Konfigurationspfad angegeben.";
        }
        
        logger.info("Initialisiere SIMONE Remote API mit Konfigurationsdatei auf Windows Server: [{}]", effectiveConfigPath);
        logger.info("Temporäre Kopie verwenden: {}", useTemporaryConfigCopy);


        try {
            int flags = Boolean.TRUE.equals(useTemporaryConfigCopy)
                    ? SimoneConst.SIMONE_FLAG_TMP_CONFIG
                    : SimoneConst.SIMONE_NO_FLAG;

            // simone_init_ex wird mit dem bereinigten WINDOWS-Pfad aufgerufen.
            int status = this.simoneApi.simone_init_ex(effectiveConfigPath, flags); 
            logger.info("simone_init_ex Rückgabewert: {}", status);

            if (status == SimoneConst.simone_status_ok) {
                this.isSimoneEnvironmentInitialized = true;
                logger.info("SIMONE Remote API erfolgreich initialisiert mit Konfiguration: {}", effectiveConfigPath);
                return "SIMONE API erfolgreich initialisiert (Remote Verbindung hergestellt).";
            } else {
                this.isSimoneEnvironmentInitialized = false;
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                // Der Fehlertext kommt vom Remote API Server
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
     * Terminierung der SIMONE API.
     * Beendet die Remote-Sitzung.
     *
     * @return Rückmeldung über die Beendigung.
     */
    public String terminateSimone() {
        logger.info("SIMONE Remote API Termination wird durchgeführt (simone_end())...");

        if (this.simoneApi == null) {
            logger.warn("Beendigung übersprungen: API-Instanz war nicht verfügbar.");
            this.isSimoneEnvironmentInitialized = false;
            return "Beendigung übersprungen: SIMONE API nicht geladen.";
        }

        if (!this.isSimoneEnvironmentInitialized) {
            logger.info("SIMONE war nicht initialisiert – keine aktive Remote-Sitzung zum Beenden.");
            return "SIMONE API war nicht initialisiert.";
        }

        try {
            // simone_end() beendet die Remote-Sitzung und den Slave API Server auf dem Windows Host.
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

    /**
     * Wird automatisch beim Beenden des Services aufgerufen.
     * Beendet die SIMONE-API falls noch initialisiert.
     */
    @PreDestroy
    public void onShutdown() {
        logger.info("Anwendung wird beendet. Versuche SIMONE Remote API zu terminieren...");
        if (this.isSimoneEnvironmentInitialized && this.simoneApi != null) {
            terminateSimone();
        } else {
            logger.info("SIMONE war nicht initialisiert – keine Remote-Sitzung zum Beenden notwendig.");
        }
    }

    /**
     * Gibt zurück, ob die SIMONE-Umgebung erfolgreich initialisiert wurde und die Remote-Sitzung aktiv ist.
     */
    public boolean isSimoneEnvironmentInitialized() {
        return this.simoneApi != null && isSimoneEnvironmentInitialized;
    }

    /**
     * Beendet und reinitialisiert die SIMONE API – z. B. bei Verbindungs- oder Lizenzproblemen.
     *
     * @return Textmeldung zum Ergebnis.
     * @throws RuntimeException bei Fehlschlag der Neuinitialisierung.
     */
    public synchronized String reinitializeSimone() {
        logger.warn("SIMONE Remote API wird neu initialisiert...");

        terminateSimone();

        // Übergabe von null für den configFilePath führt zur Verwendung des defaultSimoneConfigFilePath
        String initMessage = initializeSimone(null, true);

        if (isSimoneEnvironmentInitialized()) {
            logger.info("SIMONE Remote API erfolgreich neu initialisiert.");
            return "SIMONE erfolgreich neu initialisiert.";
        } else {
            logger.error("Reinitialisierung fehlgeschlagen: {}", initMessage);
            throw new RuntimeException("Reinitialisierung SIMONE fehlgeschlagen: " + initMessage);
        }
    }
}