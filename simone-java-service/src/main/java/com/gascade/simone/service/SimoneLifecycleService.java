// // src/main/java/com/gascade/simone/service/SimoneLifecycleService.java
// package com.gascade.simone.service;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory; // For SIMONE_NO_FLAG, SIMONE_FLAG_TMP_CONFIG, simone_status_ok
// import org.springframework.beans.factory.annotation.Value;   // For retrieving error messages
// import org.springframework.stereotype.Service;

// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimoneApi; // To inject properties
// import de.liwacom.simone.SimoneConst;
// import jakarta.annotation.PreDestroy;

// @Service
// public class SimoneLifecycleService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleService.class);
    
//     private final SimoneApi simoneApi;
//     private boolean isSimoneApiSuccessfullyInstantiated = false;
//     private boolean isSimoneEnvironmentInitialized = false;

//     // Inject configured paths from application.properties
//     @Value("${simone.installation.path}")
//     private String simoneInstallationPath;

//     @Value("${simone.default.config.file.path}")
//     private String defaultSimoneConfigFilePath;

//     public SimoneLifecycleService() {
//         SimoneApi tempApi = null;
//         try {
//             // Set SIMONE path before getting instance, as recommended by SimoneApi.html Javadoc for getInstance()
//             if (simoneInstallationPath != null && !simoneInstallationPath.isEmpty()) {
//                 logger.info("Setting SIMONE installation path to: {}", simoneInstallationPath);
//                 SimoneApi.simone_api_set_simone_path(simoneInstallationPath);
//             } else {
//                 // If not configured, SimoneApi.jar might rely on environment variables or default locations
//                 logger.warn("simone.installation.path property is not set. SimoneApi.jar might fail to find necessary files if not on system PATH.");
//             }
            
//             logger.info("Attempting to get SimoneAPI instance via SimoneApi.getInstance()...");
//             tempApi = SimoneApi.getInstance(); 
            
//             if (tempApi != null) {
//                 logger.info("SimoneAPI instance obtained successfully via getInstance().");
//                 isSimoneApiSuccessfullyInstantiated = true;
//             } else {
//                 logger.error("Failed to get SimoneAPI instance (SimoneApi.getInstance() returned null). " +
//                              "Native library issues or SIMONE environment problem likely.");
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("CRITICAL: UnsatisfiedLinkError obtaining SimoneAPI. Ensure SIMONE native libraries " +
//                          "(.dll/.so) are in java.library.path AND their dependencies are resolvable (e.g., via system PATH). " +
//                          "Error: {}", ule.getMessage(), ule);
//         } catch (Throwable t) {
//             logger.error("CRITICAL: Unexpected error obtaining SimoneAPI instance: {}", t.getMessage(), t);
//         }
//         this.simoneApi = tempApi; // Will be null if instantiation failed
//     }

//     private String formatSimoneVersionInt(int versionInt) {
//         return String.valueOf(versionInt) + " (raw integer)";
//     }

//     public String getSimoneApiVersionString() {
//         if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
//             return "Error: SIMONE API native component not loaded.";
//         }
//         try {
//             logger.info("Calling simoneApi.simone_api_version()...");
//             int versionInt = this.simoneApi.simone_api_version(); 
//             logger.info("Raw SIMONE API version integer: {}", versionInt);
//             if (versionInt < 0) { 
//                  return "API Error Code: " + versionInt;
//             }
//             return formatSimoneVersionInt(versionInt);
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError calling simone_api_version(): {}", ule.getMessage(), ule);
//             return "Error: Native library link error during version call.";
//         } catch (Throwable t) {
//             logger.error("Error calling simone_api_version(): {}", t.getMessage(), t);
//             return "Error retrieving SIMONE API version.";
//         }
//     }

//     public String initializeSimone(String configFilePath, Boolean useTemporaryConfigCopy) {
//         logger.info("Service: Attempting to initialize SIMONE. ConfigPath: [{}], UseTempCopy: {}", 
//             configFilePath == null || configFilePath.isEmpty() ? defaultSimoneConfigFilePath : configFilePath, 
//             useTemporaryConfigCopy);
            
//         if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
//             this.isSimoneEnvironmentInitialized = false;
//             return "Initialization Failed: SIMONE API native component not loaded.";
//         }
//         if (this.isSimoneEnvironmentInitialized) {
//             logger.warn("SIMONE API is already initialized. To re-initialize, terminate first.");
//             return "SIMONE API already initialized.";
//         }

//         String effectiveConfigPath = (configFilePath != null && !configFilePath.trim().isEmpty()) 
//                                      ? configFilePath.trim() 
//                                      : defaultSimoneConfigFilePath;
        
//         if (effectiveConfigPath == null || effectiveConfigPath.trim().isEmpty()) {
//             logger.error("SIMONE config file path is not specified and no default is configured.");
//             return "Initialization Failed: SIMONE configuration file path not specified.";
//         }

//         logger.info("Using SIMONE configuration file: {}", effectiveConfigPath);

//         try {
//             int flags = (useTemporaryConfigCopy != null && useTemporaryConfigCopy) 
//                         ? SimoneConst.SIMONE_FLAG_TMP_CONFIG 
//                         : SimoneConst.SIMONE_NO_FLAG;
            
//             // SimoneApi.html Javadoc shows: public int simone_init_ex(String init_file, int flags)
//             int status = this.simoneApi.simone_init_ex(effectiveConfigPath, flags);
//             logger.info("simone_init_ex called with status: {}", status);

//             if (status == SimoneConst.simone_status_ok) {
//                 this.isSimoneEnvironmentInitialized = true;
//                 logger.info("SIMONE API initialized successfully using config: {}", effectiveConfigPath);
//                 return "SIMONE API initialized successfully.";
//             } else {
//                 this.isSimoneEnvironmentInitialized = false;
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg); // Populate errorMsg
//                 String simoneError = errorMsg.getVal();
//                 logger.error("Failed to initialize SIMONE API. Status code: {}, SIMONE Error: {}", status, simoneError);
//                 return "Initialization Failed. Status: " + status + ". SIMONE says: " + simoneError;
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during SIMONE initialization: {}. Ensure native libraries and their dependencies are accessible.", ule.getMessage(), ule);
//             this.isSimoneEnvironmentInitialized = false;
//             return "Initialization Failed: Native library error during init.";
//         } catch (Throwable t) {
//             logger.error("Unexpected error during SIMONE initialization: {}", t.getMessage(), t);
//             this.isSimoneEnvironmentInitialized = false;
//             return "Initialization Failed: Unexpected error: " + t.getMessage();
//         }
//     }

//     public String terminateSimone() {
//         logger.info("Service: Attempting to terminate SIMONE API.");
//         if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
//             logger.warn("Termination skipped: SIMONE API native component was not loaded.");
//              this.isSimoneEnvironmentInitialized = false; 
//             return "Termination skipped: SIMONE API native part not loaded.";
//         }
//         if (!this.isSimoneEnvironmentInitialized) {
//             logger.info("SIMONE API was not previously initialized, no termination needed.");
//             return "SIMONE API was not initialized.";
//         }
//         try {
//             // SimoneApi.html Javadoc shows: public int simone_end()
//             int status = this.simoneApi.simone_end();
//             logger.info("simone_end() called with status: {}", status);
//             this.isSimoneEnvironmentInitialized = false; // Mark as not initialized regardless of simone_end status
//             if (status == SimoneConst.simone_status_ok) {
//                 return "SIMONE API terminated successfully.";
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 String simoneError = errorMsg.getVal();
//                 logger.warn("SIMONE API termination call returned status: {}. SIMONE says: {}", status, simoneError);
//                 return "SIMONE API termination returned status: " + status + ". SIMONE says: " + simoneError;
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("UnsatisfiedLinkError during SIMONE termination: {}. Native library may have become unavailable.", ule.getMessage(), ule);
//             this.isSimoneEnvironmentInitialized = false; // Ensure flag is false
//             return "Termination Failed: Native library error during end.";
//         } catch (Throwable t) {
//             logger.error("Unexpected error during SIMONE termination: {}", t.getMessage(), t);
//             this.isSimoneEnvironmentInitialized = false; // Ensure flag is false
//             return "Termination Failed: Unexpected error: " + t.getMessage();
//         }
//     }

//     @PreDestroy
//     public void onShutdown() {
//         logger.info("SimoneLifecycleService shutting down. Attempting to terminate SIMONE API if initialized.");
//         if (this.isSimoneEnvironmentInitialized && this.simoneApi != null) {
//             terminateSimone(); // Call the existing terminateSimone method
//         } else {
//             logger.info("SIMONE API not initialized or instance not available; no termination action during shutdown.");
//         }
//     }

//     // Getter for other services to check initialization status if needed
//     public boolean isSimoneEnvironmentInitialized() {
//         return isSimoneApiSuccessfullyInstantiated && isSimoneEnvironmentInitialized;
//     }

//     // Add this new method to the SimoneLifecycleService class

//     /**
//      * Terminates and then re-initializes the SIMONE environment.
//      * This is useful for recovering from connection or license errors.
//      * The 'synchronized' keyword prevents multiple threads from trying to
//      * re-initialize at the same time.
//      */
//     public synchronized String reinitializeSimone() {
//         logger.warn("Attempting to re-initialize SIMONE environment...");

//         // First, terminate any existing (potentially invalid) session.
//         terminateSimone();

//         // Now, initialize a new session using the default configuration.
//         // You might need to adjust this if you need to pass specific config paths.
//         String initializationMessage = initializeSimone(null, true);

//         if (isSimoneEnvironmentInitialized()) {
//             logger.info("SIMONE environment re-initialized successfully.");
//             return "SIMONE re-initialized successfully.";
//         } else {
//             logger.error("Failed to re-initialize SIMONE environment. Message: {}", initializationMessage);
//             throw new RuntimeException("Failed to re-initialize SIMONE: " + initializationMessage);
//         }
//     }
    
// }

// src/main/java/com/gascade/simone/service/SimoneLifecycleService.java
package com.gascade.simone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // For SIMONE_NO_FLAG, SIMONE_FLAG_TMP_CONFIG, simone_status_ok
import org.springframework.beans.factory.annotation.Value;   // For retrieving error messages
import org.springframework.stereotype.Service;

import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi; // To inject properties
import de.liwacom.simone.SimoneConst;
import jakarta.annotation.PreDestroy;

/**
 * Service-Klasse zur Verwaltung des Lebenszyklus der SIMONE API.
 * Verantwortlich für Initialisierung, Terminierung und Re-Initialisierung
 * inklusive Fehlerbehandlung für native Bibliotheken.
 */
@Service
public class SimoneLifecycleService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneLifecycleService.class);

    private final SimoneApi simoneApi;
    private boolean isSimoneApiSuccessfullyInstantiated = false;
    private boolean isSimoneEnvironmentInitialized = false;

    @Value("${simone.installation.path}")
    private String simoneInstallationPath;

    @Value("${simone.default.config.file.path}")
    private String defaultSimoneConfigFilePath;

    /**
     * Konstruktor, initialisiert die SIMONE-API, wenn möglich.
     */
    public SimoneLifecycleService() {
        SimoneApi tempApi = null;
        try {
            if (simoneInstallationPath != null && !simoneInstallationPath.isEmpty()) {
                logger.info("SIMONE-Installationspfad wird gesetzt: {}", simoneInstallationPath);
                SimoneApi.simone_api_set_simone_path(simoneInstallationPath);
            } else {
                logger.warn("Eigenschaft 'simone.installation.path' nicht gesetzt. Die Bibliothek könnte über Umgebungsvariablen gesucht werden.");
            }

            logger.info("Versuch, SIMONE-API-Instanz zu erzeugen...");
            tempApi = SimoneApi.getInstance();

            if (tempApi != null) {
                logger.info("SIMONE-API-Instanz erfolgreich erzeugt.");
                isSimoneApiSuccessfullyInstantiated = true;
            } else {
                logger.error("Fehler beim Erzeugen der SIMONE-API-Instanz: getInstance() lieferte null.");
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("KRITISCH: Native Bibliotheken nicht gefunden (UnsatisfiedLinkError): {}", ule.getMessage(), ule);
        } catch (Throwable t) {
            logger.error("KRITISCH: Unerwarteter Fehler bei der API-Initialisierung: {}", t.getMessage(), t);
        }
        this.simoneApi = tempApi;
    }

    /**
     * Gibt die API-Versionsnummer als lesbare Zeichenkette zurück.
     */
    public String getSimoneApiVersionString() {
        if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
            return "Fehler: SIMONE API native Komponente nicht geladen.";
        }

        try {
            logger.info("Abfrage der SIMONE-API-Version...");
            int versionInt = this.simoneApi.simone_api_version();
            logger.info("Rohwert der SIMONE API-Version: {}", versionInt);

            return (versionInt >= 0)
                    ? versionInt + " (Rohwert)"
                    : "API-Fehlercode: " + versionInt;
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler bei simone_api_version(): {}", ule.getMessage(), ule);
            return "Fehler: Link-Fehler der nativen Bibliothek.";
        } catch (Throwable t) {
            logger.error("Fehler bei simone_api_version(): {}", t.getMessage(), t);
            return "Fehler beim Abrufen der SIMONE API-Version.";
        }
    }

    /**
     * Initialisiert die SIMONE-Umgebung mit angegebener Konfigurationsdatei.
     *
     * @param configFilePath Pfad zur Konfigurationsdatei.
     * @param useTemporaryConfigCopy true = temporäre Kopie verwenden.
     * @return Ergebnistext zur Initialisierung.
     */
    public String initializeSimone(String configFilePath, Boolean useTemporaryConfigCopy) {
        logger.info("Initialisiere SIMONE mit Konfigurationsdatei [{}], temporäre Kopie: {}", 
            configFilePath == null ? defaultSimoneConfigFilePath : configFilePath, useTemporaryConfigCopy);

        if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
            this.isSimoneEnvironmentInitialized = false;
            return "Initialisierung fehlgeschlagen: SIMONE API nicht geladen.";
        }
        if (this.isSimoneEnvironmentInitialized) {
            logger.warn("SIMONE API ist bereits initialisiert.");
            return "SIMONE API ist bereits initialisiert.";
        }

        String effectiveConfigPath = (configFilePath != null && !configFilePath.trim().isEmpty())
                ? configFilePath.trim()
                : defaultSimoneConfigFilePath;

        if (effectiveConfigPath == null || effectiveConfigPath.trim().isEmpty()) {
            logger.error("Konfigurationspfad ist leer oder nicht gesetzt.");
            return "Initialisierung fehlgeschlagen: Kein Konfigurationspfad angegeben.";
        }

        try {
            int flags = Boolean.TRUE.equals(useTemporaryConfigCopy)
                    ? SimoneConst.SIMONE_FLAG_TMP_CONFIG
                    : SimoneConst.SIMONE_NO_FLAG;

            int status = this.simoneApi.simone_init_ex(effectiveConfigPath, flags);
            logger.info("simone_init_ex Rückgabewert: {}", status);

            if (status == SimoneConst.simone_status_ok) {
                this.isSimoneEnvironmentInitialized = true;
                logger.info("SIMONE erfolgreich initialisiert mit Konfiguration: {}", effectiveConfigPath);
                return "SIMONE API erfolgreich initialisiert.";
            } else {
                this.isSimoneEnvironmentInitialized = false;
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                logger.error("Fehler bei Initialisierung: Status: {}, SIMONE-Fehler: {}", status, errorMsg.getVal());
                return "Initialisierung fehlgeschlagen. Status: " + status + ". SIMONE: " + errorMsg.getVal();
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler während Initialisierung: {}", ule.getMessage(), ule);
            return "Initialisierung fehlgeschlagen: Link-Fehler der nativen Bibliothek.";
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei Initialisierung: {}", t.getMessage(), t);
            return "Initialisierung fehlgeschlagen: " + t.getMessage();
        }
    }

    /**
     * Terminierung der SIMONE API.
     *
     * @return Rückmeldung über die Beendigung.
     */
    public String terminateSimone() {
        logger.info("SIMONE-Termination wird durchgeführt...");

        if (!isSimoneApiSuccessfullyInstantiated || this.simoneApi == null) {
            logger.warn("Beendigung übersprungen: API war nicht geladen.");
            this.isSimoneEnvironmentInitialized = false;
            return "Beendigung übersprungen: SIMONE API nicht geladen.";
        }

        if (!this.isSimoneEnvironmentInitialized) {
            logger.info("SIMONE war nicht initialisiert – nichts zu tun.");
            return "SIMONE API war nicht initialisiert.";
        }

        try {
            int status = this.simoneApi.simone_end();
            logger.info("simone_end() Rückgabewert: {}", status);
            this.isSimoneEnvironmentInitialized = false;

            if (status == SimoneConst.simone_status_ok) {
                return "SIMONE API erfolgreich beendet.";
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                logger.warn("Beendigung lieferte Status: {}, SIMONE: {}", status, errorMsg.getVal());
                return "Beendigung SIMONE API: Status " + status + ". SIMONE: " + errorMsg.getVal();
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Link-Fehler bei Beendigung: {}", ule.getMessage(), ule);
            return "Beendigung fehlgeschlagen: Link-Fehler.";
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei Beendigung: {}", t.getMessage(), t);
            return "Beendigung fehlgeschlagen: " + t.getMessage();
        }
    }

    /**
     * Wird automatisch beim Beenden des Services aufgerufen.
     * Beendet die SIMONE-API falls noch initialisiert.
     */
    @PreDestroy
    public void onShutdown() {
        logger.info("Anwendung wird beendet. Versuche SIMONE zu terminieren...");
        if (this.isSimoneEnvironmentInitialized && this.simoneApi != null) {
            terminateSimone();
        } else {
            logger.info("SIMONE war nicht initialisiert – keine Aktion notwendig.");
        }
    }

    /**
     * Gibt zurück, ob die SIMONE-Umgebung erfolgreich initialisiert wurde.
     */
    public boolean isSimoneEnvironmentInitialized() {
        return isSimoneApiSuccessfullyInstantiated && isSimoneEnvironmentInitialized;
    }

    /**
     * Beendet und reinitialisiert die SIMONE API – z. B. bei Lizenzproblemen.
     *
     * @return Textmeldung zum Ergebnis.
     * @throws RuntimeException bei Fehlschlag der Neuinitialisierung.
     */
    public synchronized String reinitializeSimone() {
        logger.warn("SIMONE wird neu initialisiert...");

        terminateSimone();

        String initMessage = initializeSimone(null, true);

        if (isSimoneEnvironmentInitialized()) {
            logger.info("SIMONE erfolgreich neu initialisiert.");
            return "SIMONE erfolgreich neu initialisiert.";
        } else {
            logger.error("Reinitialisierung fehlgeschlagen: {}", initMessage);
            throw new RuntimeException("Reinitialisierung SIMONE fehlgeschlagen: " + initMessage);
        }
    }
}
