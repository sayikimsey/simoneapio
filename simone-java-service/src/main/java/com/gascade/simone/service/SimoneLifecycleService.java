package com.gascade.simone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final String API_SERVER_HOST = "winsimone01.gascadead.gascade.de";
    private static final int API_SERVER_PORT = 6612;
    private static final String CONFIG_FILENAME = "api_server"; 

    public SimoneLifecycleService(SimoneApi simoneApi) {
        this.simoneApi = simoneApi;
        logger.info("SimoneLifecycleService gestartet.");
    }

    /**
     * Konfiguriert die Remote-Verbindung.
     * Dies muss erfolgreich sein, damit alles andere funktioniert.
     */
    private boolean setupRemoteConnection() {
        try {
            logger.info("Setze Remote-Verbindung: {}:{}", API_SERVER_HOST, API_SERVER_PORT);
            int status = this.simoneApi.simone_set_remote_connection(API_SERVER_HOST, API_SERVER_PORT);
            
            if (status == SimoneConst.simone_status_ok) {
                return true;
            } else {
                // Status 15 (Not Implemented) bedeutet, wir nutzen immer noch die falsche (lokale) Lib.
                logger.error("simone_set_remote_connection fehlgeschlagen. Status: {}", status);
                return false;
            }
        } catch (Throwable t) {
            logger.error("Exception bei setupRemoteConnection: {}", t.getMessage());
            return false;
        }
    }

    public synchronized String getSimoneApiVersionString() {
        logger.info("Diagnose-Abfrage gestartet...");
        
        // 1. Verbindung setzen
        if (!setupRemoteConnection()) {
            return "Fehler: Konnte Remote-Verbindung nicht setzen (Lokal-Modus aktiv?).";
        }

        try {
            // 2. Runmode prüfen
            int runMode = this.simoneApi.simone_get_runmode();
            logger.info("Runmode: {} (Erwartet: 2)", runMode);

            // 3. Version abrufen (löst Netzwerkverbindung aus)
            int versionInt = this.simoneApi.simone_api_remote_version();
            logger.info("Remote Version: {}", versionInt);
            
            if (versionInt < 0) {
                logger.warn("Remote Version ist negativ. Versuche Standard API Version...");
                int localVer = this.simoneApi.simone_api_version();
                return "Remote:-1 / Lokal:" + localVer;
            }

            return String.valueOf(versionInt);

        } catch (Exception e) {
            logger.error("Fehler bei Diagnose: {}", e.getMessage());
            return "Exception: " + e.getMessage();
        }
    }

    public synchronized String initializeSimone(String ignoredPath, Boolean ignoredBool) {
        if (this.isSimoneEnvironmentInitialized) {
            return "Bereits initialisiert.";
        }

        // 1. Verbindung setzen
        if (!setupRemoteConnection()) {
            return "Initialisierung abgebrochen: Setup fehlgeschlagen.";
        }

        logger.info("Starte simone_init_ex (TMP_CONFIG)...");
        try {
            // 2. Init
            int flags = SimoneConst.SIMONE_FLAG_TMP_CONFIG;
            int status = this.simoneApi.simone_init_ex(CONFIG_FILENAME, flags);

            if (status == SimoneConst.simone_status_ok) {
                this.isSimoneEnvironmentInitialized = true;
                logger.info("simone_init_ex erfolgreich.");
                return "Initialisierung erfolgreich.";
            } else {
                SimString errMsg = new SimString();
                this.simoneApi.simone_last_error(errMsg);
                String errText = errMsg.getVal();
                logger.error("Init fehlgeschlagen: Status {}, Text: {}", status, errText);
                return "Fehler (" + status + "): " + errText;
            }
        } catch (Exception e) {
            logger.error("Exception bei Init: {}", e.getMessage(), e);
            return "Exception: " + e.getMessage();
        }
    }

    public synchronized String terminateSimone() {
        if (!this.isSimoneEnvironmentInitialized) return "Nicht aktiv.";
        try {
            int status = this.simoneApi.simone_end();
            this.isSimoneEnvironmentInitialized = false;
            if (status == SimoneConst.simone_status_ok) return "Beendet.";
            
            SimString err = new SimString();
            this.simoneApi.simone_last_error(err);
            return "Fehler beim Beenden (" + status + "): " + err.getVal();
        } catch (Exception e) {
            this.isSimoneEnvironmentInitialized = false;
            return "Fehler: " + e.getMessage();
        }
    }

    public boolean isSimoneEnvironmentInitialized() {
        return isSimoneEnvironmentInitialized;
    }

    @PreDestroy
    public void onShutdown() {
        if (isSimoneEnvironmentInitialized) terminateSimone();
    }

    public synchronized String reinitializeSimone() {
        terminateSimone();
        return initializeSimone(null, null);
    }
}
