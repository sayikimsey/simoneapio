// // src/main/java/com/gascade/simone/service/SimoneNetworkService.java
// package com.gascade.simone.service;

// import java.util.ArrayList;
// import java.util.Collections;
// import java.util.List;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;

// import com.gascade.simone.dto.NetworkObjectDto;

// import de.liwacom.simone.SimInt;
// import de.liwacom.simone.SimString;
// import de.liwacom.simone.SimoneApi;
// import de.liwacom.simone.SimoneConst;

// /**
//  * Service-Klasse zur Verwaltung von SIMONE-Netzwerken.
//  * Beinhaltet Funktionen zum Auflisten, Auswählen, Abwählen und Abfragen von Netzwerkobjekten.
//  */
// @Service
// public class SimoneNetworkService {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneNetworkService.class);
//     private final SimoneApi simoneApi;
//     private final boolean isSimoneApiInstantiated;
//     private final SimoneLifecycleService lifecycleService;

//     @Value("${simone.default.network.directory}")
//     private String defaultNetworkDirectory;

//     private String currentSelectedNetworkNameCache = null;

//     public SimoneNetworkService(SimoneLifecycleService lifecycleService) {
//         this.lifecycleService = lifecycleService;
//         SimoneApi tempApi = null;
//         boolean instantiated = false;
//         try {
//             tempApi = SimoneApi.getInstance();
//             if (tempApi != null) {
//                 logger.info("SimoneNetworkService: SimoneAPI-Instanz erfolgreich geladen.");
//                 instantiated = true;
//             } else {
//                 logger.error("SimoneNetworkService: Konnte SimoneAPI-Instanz nicht erzeugen (null zurückgegeben).");
//             }
//         } catch (UnsatisfiedLinkError ule) {
//             logger.error("Kritischer Fehler: UnsatisfiedLinkError beim Laden der SimoneAPI. Fehlen native Bibliotheken? {}", ule.getMessage());
//         } catch (Throwable t) {
//             logger.error("Kritischer Fehler: Unerwarteter Fehler beim Laden der SimoneAPI-Instanz: {}", t.getMessage(), t);
//         }
//         this.simoneApi = tempApi;
//         this.isSimoneApiInstantiated = instantiated;
//     }

//     private void checkApiReadyForNetworkOps() {
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API ist nicht geladen.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE-Umgebung ist nicht initialisiert. Bitte zuerst /initialize aufrufen.");
//         }
//         if (this.currentSelectedNetworkNameCache == null || this.currentSelectedNetworkNameCache.trim().isEmpty()) {
//             throw new IllegalStateException("Kein Netzwerk ausgewählt. Bitte zuerst /networks/current/select aufrufen.");
//         }
//     }

//     /**
//      * Listet alle verfügbaren SIMONE-Netzwerke in einem angegebenen Verzeichnis auf.
//      *
//      * @param requestedDirectoryPath Optionaler Pfad zum Netzwerkverzeichnis. Wenn null, wird das Standardverzeichnis verwendet.
//      * @return Liste mit Netzwerk-Namen.
//      */
//     public List<String> listNetworks(String requestedDirectoryPath) {
//         logger.info("Service: Netzwerkliste wird abgerufen. Angefordertes Verzeichnis: [{}]", requestedDirectoryPath == null ? "Standard" : requestedDirectoryPath);

//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API nicht geladen. Auflistung nicht möglich.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE-Umgebung nicht initialisiert.");
//         }

//         String targetDirectory = (requestedDirectoryPath != null && !requestedDirectoryPath.trim().isEmpty())
//                 ? requestedDirectoryPath.trim()
//                 : defaultNetworkDirectory;

//         if (targetDirectory == null || targetDirectory.trim().isEmpty()) {
//             throw new IllegalArgumentException("Pfad zum Netzwerkverzeichnis ist nicht definiert.");
//         }

//         SimString error = new SimString();
//         int changeDirStatus = this.simoneApi.simone_change_network_dir(targetDirectory, SimoneConst.SIMONE_FLAG_MAKE_NETWORK_DIR);
//         if (changeDirStatus != SimoneConst.simone_status_ok) {
//             this.simoneApi.simone_last_error(error);
//             throw new RuntimeException("Fehler beim Setzen des Netzwerkverzeichnisses: " + error.getVal());
//         }
//         logger.info("Netzwerkverzeichnis erfolgreich gesetzt: {}", targetDirectory);

//         List<String> networkNames = new ArrayList<>();
//         SimString networkNameOutput = new SimString();

//         try {
//             int status = this.simoneApi.simone_network_list_start(SimoneConst.SIMONE_NO_FLAG);
//             if (status == SimoneConst.simone_status_not_found) {
//                 return Collections.emptyList();
//             } else if (status != SimoneConst.simone_status_ok) {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 throw new RuntimeException("Fehler beim Start der Netzwerkliste: " + errorMsg.getVal());
//             }

//             while (true) {
//                 status = this.simoneApi.simone_network_list_next(networkNameOutput, SimoneConst.SIMONE_NO_FLAG);
//                 if (status == SimoneConst.simone_status_ok) {
//                     String name = networkNameOutput.getVal();
//                     if (name != null && !name.isEmpty()) networkNames.add(name);
//                 } else if (status == SimoneConst.simone_status_not_found) {
//                     break;
//                 } else {
//                     SimString errorMsg = new SimString();
//                     this.simoneApi.simone_last_error(errorMsg);
//                     logger.error("Fehler beim Abrufen der nächsten Netzwerkzeile: {}", errorMsg.getVal());
//                     break;
//                 }
//             }
//         } catch (Throwable t) {
//             logger.error("Unerwarteter Fehler beim Abrufen der Netzwerkliste: {}", t.getMessage(), t);
//             throw new RuntimeException("Fehler beim Abrufen der Netzwerkliste: " + t.getMessage(), t);
//         }

//         return networkNames;
//     }

//     /**
//      * Wählt ein bestimmtes Netzwerk aus.
//      *
//      * @param networkName Name des zu wählenden Netzwerks.
//      * @return Erfolgsnachricht.
//      */
//     public String selectNetwork(String networkName) {
//         logger.info("Service: Auswahl des Netzwerks '{}'", networkName);

//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API ist nicht geladen.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             throw new IllegalStateException("SIMONE-Umgebung ist nicht initialisiert.");
//         }
//         if (networkName == null || networkName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Netzwerkname darf nicht leer sein.");
//         }

//         try {
//             int status = this.simoneApi.simone_select(networkName.trim());
//             if (status == SimoneConst.simone_status_ok) {
//                 this.currentSelectedNetworkNameCache = networkName.trim();
//                 logger.info("Netzwerk '{}' erfolgreich ausgewählt.", this.currentSelectedNetworkNameCache);
//                 return "Netzwerk '" + this.currentSelectedNetworkNameCache + "' erfolgreich ausgewählt.";
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 this.currentSelectedNetworkNameCache = null;
//                 throw new RuntimeException("Fehler bei der Netzwerkauswahl: " + errorMsg.getVal());
//             }
//         } catch (Throwable t) {
//             logger.error("Unerwarteter Fehler bei der Netzwerkauswahl '{}': {}", networkName, t.getMessage(), t);
//             throw new RuntimeException("Netzwerkauswahl fehlgeschlagen: " + t.getMessage(), t);
//         }
//     }

//     /**
//      * Gibt das aktuell ausgewählte Netzwerk zurück.
//      *
//      * @return Netzwerkname oder null.
//      */
//     public String getCurrentNetwork() {
//         logger.info("Service: Aktuell ausgewähltes Netzwerk wird abgefragt.");

//         try {
//             return tryGetCurrentNetworkOnce();
//         } catch (RuntimeException ex) {
//             if (ex.getMessage() != null && ex.getMessage().contains("no license")) {
//                 logger.warn("SIMONE-Lizenz ungültig. Reinitialisierung wird versucht.");
//                 lifecycleService.reinitializeSimone();
//                 return tryGetCurrentNetworkOnce();
//             } else {
//                 throw ex;
//             }
//         }
//     }

//     private String tryGetCurrentNetworkOnce() {
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API ist nicht geladen.");
//         }
//         if (!lifecycleService.isSimoneEnvironmentInitialized()) {
//             logger.warn("SIMONE-Umgebung ist nicht initialisiert.");
//             return null;
//         }

//         SimString currentNetworkInfo = new SimString();
//         try {
//             int status = this.simoneApi.simone_get_info(
//                 SimoneConst.SIMONE_CONFIGURED_NETWORK,
//                 currentNetworkInfo,
//                 SimoneConst.SIMONE_NO_FLAG
//             );

//             if (status == SimoneConst.simone_status_ok) {
//                 String name = currentNetworkInfo.getVal();
//                 logger.info("Aktuelles Netzwerk aus SIMONE gelesen: '{}'", name);
//                 this.currentSelectedNetworkNameCache = (name != null && !name.isEmpty()) ? name : null;
//                 return this.currentSelectedNetworkNameCache;
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 throw new RuntimeException("Fehler beim Abrufen des Netzwerks: " + errorMsg.getVal());
//             }
//         } catch (Throwable t) {
//             logger.error("Fehler bei simone_get_info: {}", t.getMessage(), t);
//             throw new RuntimeException("Fehler beim Abrufen des aktuellen Netzwerks: " + t.getMessage(), t);
//         }
//     }

//     /**
//      * Hebt die Auswahl des aktuell gesetzten Netzwerks auf.
//      *
//      * @return Erfolgsnachricht.
//      */
//     public String deselectNetwork() {
//         logger.info("Service: Aktuell ausgewähltes Netzwerk wird abgewählt.");
//         if (!isSimoneApiInstantiated || this.simoneApi == null) {
//             throw new IllegalStateException("SIMONE API ist nicht geladen.");
//         }

//         try {
//             int status = this.simoneApi.simone_deselect(SimoneConst.SIMONE_NO_FLAG);
//             if (status == SimoneConst.simone_status_ok) {
//                 this.currentSelectedNetworkNameCache = null;
//                 logger.info("Netzwerk erfolgreich abgewählt.");
//                 return "Netzwerk wurde erfolgreich abgewählt.";
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 throw new RuntimeException("Fehler beim Abwählen des Netzwerks: " + errorMsg.getVal());
//             }
//         } catch (Throwable t) {
//             logger.error("Fehler beim Abwählen des Netzwerks: {}", t.getMessage(), t);
//             throw new RuntimeException("Fehler beim Abwählen: " + t.getMessage(), t);
//         }
//     }

// /**
//  * Hilfsmethode zur Umwandlung eines Objekt-Typs in einen lesbaren Namen.
//  *
//  * @param objectTypeCode SIMONE-Konstante für den Objekt-Typ.
//  * @return Menschlich lesbarer Objekt-Typ als String.
//  */
//     private String getObjectTypeName(int objectTypeCode) {
//         return switch (objectTypeCode) {
//             // Corrected SIMONE_OBJTYPE_NODE to SIMONE_OBJTYPE_NO for generic node
//             case SimoneConst.SIMONE_OBJTYPE_NO -> "Node"; 
//             case SimoneConst.SIMONE_OBJTYPE_CS -> "Compressor Station";
//             case SimoneConst.SIMONE_OBJTYPE_CV -> "Control Valve";
//             case SimoneConst.SIMONE_OBJTYPE_PIPE -> "Pipe";
//             case SimoneConst.SIMONE_OBJTYPE_RECP -> "Reciprocating Compressor";
//             case SimoneConst.SIMONE_OBJTYPE_VA -> "Valve";
//             case SimoneConst.SIMONE_OBJTYPE_SE -> "Special Element";
//             case SimoneConst.SIMONE_OBJTYPE_RE -> "Regulator";
//             case SimoneConst.SIMONE_OBJTYPE_NS -> "Network Station";
//             case SimoneConst.SIMONE_OBJTYPE_SUB -> "Subsystem";
//             case SimoneConst.SIMONE_OBJTYPE_SOURCE -> "Source/Sink";
//             case SimoneConst.SIMONE_OBJTYPE_FUNCTION -> "Function";
//             case SimoneConst.SIMONE_OBJTYPE_PROFILE -> "Profile";
//             case SimoneConst.SIMONE_OBJTYPE_SYS -> "System";
//             // SIMONE_OBJTYPE_ALL is for requesting, not usually a type of an object itself
//             default -> "Unknown Type (" + objectTypeCode + ")";
//         };
//     }

// /**
//  * Listet alle Netzwerkobjekte des aktuell ausgewählten Netzwerks, gefiltert nach Typ und Subsystem.
//  *
//  * @param requestedObjectType Objekt-Typ (z. B. SIMONE_OBJTYPE_NODE, SIMONE_OBJTYPE_PIPE, ...).
//  * @param requestedSubsystemName Optionaler Name des Subsystems zur Filterung.
//  * @return Liste der gefundenen Netzwerkobjekte als DTOs.
//  * @throws RuntimeException bei Fehlern in der SIMONE API oder Initialisierungsproblemen.
//  */
// public List<NetworkObjectDto> listNetworkObjects(int requestedObjectType, String requestedSubsystemName) {
//     logger.info("Service: listNetworkObjects aufgerufen. Angeforderter Objekt-Typ: {}, Subsystem: '{}'", 
//         requestedObjectType, requestedSubsystemName == null ? "ALLE" : requestedSubsystemName);

//     checkApiReadyForNetworkOps();

//     logger.info("Objekte werden für ausgewähltes Netzwerk '{}' geladen.", this.currentSelectedNetworkNameCache);

//     List<NetworkObjectDto> objectList = new ArrayList<>();
//     SimInt objIdOutput = new SimInt();
//     SimString objNameOutput = new SimString();
//     SimInt objectTypeOutput = new SimInt();
//     SimString subsystemNameOutput = new SimString();

//     String effectiveReqSubsystemName = (requestedSubsystemName != null && !requestedSubsystemName.trim().isEmpty())
//             ? requestedSubsystemName.trim()
//             : null;

//     try {
//         logger.debug("simone_get_first_object wird aufgerufen mit Typ: {}, Subsystem: '{}'", 
//             requestedObjectType, effectiveReqSubsystemName);

//         int status = this.simoneApi.simone_get_first_object(
//             requestedObjectType, effectiveReqSubsystemName,
//             objIdOutput, objNameOutput, objectTypeOutput, subsystemNameOutput
//         );
//         logger.info("simone_get_first_object Rückgabewert: {}", status);

//         if (status == SimoneConst.simone_status_not_found) {
//             logger.info("Keine passenden Objekte gefunden für die angegebenen Kriterien.");
//             return Collections.emptyList();
//         } else if (status != SimoneConst.simone_status_ok) {
//             SimString errorMsg = new SimString();
//             this.simoneApi.simone_last_error(errorMsg);
//             throw new RuntimeException("Fehler beim Start der Objektauflistung. SIMONE-Fehler: " + errorMsg.getVal());
//         }

//         // Erstes Objekt hinzufügen
//         objectList.add(new NetworkObjectDto(
//             objIdOutput.getVal(),
//             objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : "N/A",
//             objectTypeOutput.getVal(),
//             getObjectTypeName(objectTypeOutput.getVal()),
//             subsystemNameOutput.getVal() != null ? subsystemNameOutput.getVal().trim() : "N/A"
//         ));

//         // Weitere Objekte iterativ abfragen
//         while (true) {
//             status = this.simoneApi.simone_get_next_object(
//                 objIdOutput, objNameOutput, objectTypeOutput, subsystemNameOutput
//             );
//             logger.debug("simone_get_next_object Status: {}", status);

//             if (status == SimoneConst.simone_status_ok) {
//                 objectList.add(new NetworkObjectDto(
//                     objIdOutput.getVal(),
//                     objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : "N/A",
//                     objectTypeOutput.getVal(),
//                     getObjectTypeName(objectTypeOutput.getVal()),
//                     subsystemNameOutput.getVal() != null ? subsystemNameOutput.getVal().trim() : "N/A"
//                 ));
//             } else if (status == SimoneConst.simone_status_not_found) {
//                 break; // Ende der Liste erreicht
//             } else {
//                 SimString errorMsg = new SimString();
//                 this.simoneApi.simone_last_error(errorMsg);
//                 logger.error("Fehler beim Lesen des nächsten Objekts. Status: {}, SIMONE-Fehler: {}", status, errorMsg.getVal());
//                 break;
//             }
//         }
//     } catch (Throwable t) {
//         logger.error("Unerwarteter Fehler bei der Objektauflistung: {}", t.getMessage(), t);
//         throw new RuntimeException("Fehler bei der Objektauflistung: " + t.getMessage(), t);
//     }

//     logger.info("Objektauflistung abgeschlossen. Anzahl gefundener Objekte: {}", objectList.size());
//     return objectList;
// }

// }
    


// src/main/java/com/gascade/simone/service/SimoneNetworkService.java
package com.gascade.simone.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gascade.simone.dto.NetworkObjectDto;

import de.liwacom.simone.SimInt;
import de.liwacom.simone.SimString;
import de.liwacom.simone.SimoneApi;
import de.liwacom.simone.SimoneConst;

/**
 * Service-Klasse zur Verwaltung von SIMONE-Netzwerken.
 * Beinhaltet Funktionen zum Auflisten, Auswählen, Abwählen und Abfragen von Netzwerkobjekten.
 */
@Service
public class SimoneNetworkService {

    private static final Logger logger = LoggerFactory.getLogger(SimoneNetworkService.class);
    private final SimoneApi simoneApi;
    private final boolean isSimoneApiInstantiated;
    private final SimoneLifecycleService lifecycleService;

    @Value("${simone.default.network.directory}")
    private String defaultNetworkDirectory;

    private String currentSelectedNetworkNameCache = null;
    // ✅ Cache für das vom Benutzer gesetzte Netzwerkverzeichnis
    private String currentUserNetworkDirectoryCache = null;

    public SimoneNetworkService(SimoneLifecycleService lifecycleService) {
        this.lifecycleService = lifecycleService;
        SimoneApi tempApi = null;
        boolean instantiated = false;
        try {
            tempApi = SimoneApi.getInstance();
            if (tempApi != null) {
                logger.info("SimoneNetworkService: SimoneAPI-Instanz erfolgreich geladen.");
                instantiated = true;
            } else {
                logger.error("SimoneNetworkService: Konnte SimoneAPI-Instanz nicht erzeugen (null zurückgegeben).");
            }
        } catch (UnsatisfiedLinkError ule) {
            logger.error("Kritischer Fehler: UnsatisfiedLinkError beim Laden der SimoneAPI. Fehlen native Bibliotheken? {}", ule.getMessage());
        } catch (Throwable t) {
            logger.error("Kritischer Fehler: Unerwarteter Fehler beim Laden der SimoneAPI-Instanz: {}", t.getMessage(), t);
        }
        this.simoneApi = tempApi;
        this.isSimoneApiInstantiated = instantiated;
    }

    // ✅ KORRIGIERT: Überprüft nur die API-Instanziierung und -Initialisierung
    private void checkApiAndEnvReady() {
        if (!isSimoneApiInstantiated || this.simoneApi == null) {
            throw new IllegalStateException("SIMONE API ist nicht geladen.");
        }
        if (!lifecycleService.isSimoneEnvironmentInitialized()) {
            throw new IllegalStateException("SIMONE-Umgebung ist nicht initialisiert.");
        }
    }

    private void checkApiReadyForNetworkOps() {
        checkApiAndEnvReady();
        if (this.currentSelectedNetworkNameCache == null || this.currentSelectedNetworkNameCache.trim().isEmpty()) {
            throw new IllegalStateException("Kein Netzwerk ausgewählt. Bitte zuerst /networks/current/select aufrufen.");
        }
    }
    
    /**
     * ✅ NEU: Setzt das Netzwerkverzeichnis für den aktuellen Benutzer.
     * @param networkPath Der Pfad zum Netzwerkordner.
     * @return Eine Erfolgsmeldung.
     */
    public String setNetworkDirectory(String networkPath) {
        if (networkPath == null || networkPath.trim().isEmpty()) {
            throw new IllegalArgumentException("Netzwerkpfad darf nicht leer sein.");
        }
        this.currentUserNetworkDirectoryCache = networkPath.trim();
        logger.info("Individuelles Netzwerkverzeichnis für Benutzer-Sitzung gesetzt: {}", this.currentUserNetworkDirectoryCache);
        return "Individuelles Netzwerkverzeichnis erfolgreich gesetzt.";
    }

    /**
     * ✅ KORRIGIERT: Listet alle verfügbaren SIMONE-Netzwerke in einem angegebenen Verzeichnis auf.
     * Verwendet das vom Benutzer gesetzte Verzeichnis, falls vorhanden, andernfalls das Standardverzeichnis.
     *
     * @param requestedDirectoryPath Optionaler Pfad zum Netzwerkverzeichnis. Wenn null, wird das Standardverzeichnis verwendet.
     * @return Liste mit Netzwerk-Namen.
     */
    public List<String> listNetworks(String requestedDirectoryPath) {
        logger.info("Service: Netzwerkliste wird abgerufen. Angefordertes Verzeichnis: [{}]", requestedDirectoryPath == null ? "Standard" : requestedDirectoryPath);

        checkApiAndEnvReady();

        // ✅ KORRIGIERT: Bevorzugt das vom Benutzer gesetzte Verzeichnis
        String targetDirectory = (requestedDirectoryPath != null && !requestedDirectoryPath.trim().isEmpty())
            ? requestedDirectoryPath.trim()
            : (this.currentUserNetworkDirectoryCache != null ? this.currentUserNetworkDirectoryCache : defaultNetworkDirectory);

        if (targetDirectory == null || targetDirectory.trim().isEmpty()) {
            throw new IllegalArgumentException("Pfad zum Netzwerkverzeichnis ist nicht definiert.");
        }

        SimString error = new SimString();
        // Rufe simone_change_network_dir auf, um das aktive Verzeichnis zu setzen.
        int changeDirStatus = this.simoneApi.simone_change_network_dir(targetDirectory, SimoneConst.SIMONE_FLAG_MAKE_NETWORK_DIR);
        if (changeDirStatus != SimoneConst.simone_status_ok) {
            this.simoneApi.simone_last_error(error);
            throw new RuntimeException("Fehler beim Setzen des Netzwerkverzeichnisses: " + error.getVal());
        }
        logger.info("Netzwerkverzeichnis erfolgreich gesetzt: {}", targetDirectory);

        List<String> networkNames = new ArrayList<>();
        SimString networkNameOutput = new SimString();

        try {
            int status = this.simoneApi.simone_network_list_start(SimoneConst.SIMONE_NO_FLAG);
            if (status == SimoneConst.simone_status_not_found) {
                return Collections.emptyList();
            } else if (status != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                throw new RuntimeException("Fehler beim Start der Netzwerkliste: " + errorMsg.getVal());
            }

            while (true) {
                status = this.simoneApi.simone_network_list_next(networkNameOutput, SimoneConst.SIMONE_NO_FLAG);
                if (status == SimoneConst.simone_status_ok) {
                    String name = networkNameOutput.getVal();
                    if (name != null && !name.isEmpty()) networkNames.add(name);
                } else if (status == SimoneConst.simone_status_not_found) {
                    break; // Ende der Liste erreicht
                } else {
                    SimString errorMsg = new SimString();
                    this.simoneApi.simone_last_error(errorMsg);
                    logger.error("Fehler beim Abrufen der nächsten Netzwerkzeile: {}", errorMsg.getVal());
                    break;
                }
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler beim Abrufen der Netzwerkliste: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler beim Abrufen der Netzwerkliste: " + t.getMessage(), t);
        }

        return networkNames;
    }

    /**
     * Wählt ein bestimmtes Netzwerk aus.
     *
     * @param networkName Name des zu wählenden Netzwerks.
     * @return Erfolgsnachricht.
     */
    public String selectNetwork(String networkName) {
        logger.info("Service: Auswahl des Netzwerks '{}'", networkName);

        checkApiAndEnvReady();
        if (networkName == null || networkName.trim().isEmpty()) {
            throw new IllegalArgumentException("Netzwerkname darf nicht leer sein.");
        }

        try {
            int status = this.simoneApi.simone_select(networkName.trim());
            if (status == SimoneConst.simone_status_ok) {
                this.currentSelectedNetworkNameCache = networkName.trim();
                logger.info("Netzwerk '{}' erfolgreich ausgewählt.", this.currentSelectedNetworkNameCache);
                return "Netzwerk '" + this.currentSelectedNetworkNameCache + "' erfolgreich ausgewählt.";
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                this.currentSelectedNetworkNameCache = null;
                throw new RuntimeException("Fehler bei der Netzwerkauswahl: " + errorMsg.getVal());
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei der Netzwerkauswahl '{}': {}", networkName, t.getMessage(), t);
            throw new RuntimeException("Netzwerkauswahl fehlgeschlagen: " + t.getMessage(), t);
        }
    }

    /**
     * Gibt das aktuell ausgewählte Netzwerk zurück.
     *
     * @return Netzwerkname oder null.
     */
    public String getCurrentNetwork() {
        logger.info("Service: Aktuell ausgewähltes Netzwerk wird abgefragt.");

        try {
            return tryGetCurrentNetworkOnce();
        } catch (RuntimeException ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("no license")) {
                logger.warn("SIMONE-Lizenz ungültig. Reinitialisierung wird versucht.");
                lifecycleService.reinitializeSimone();
                return tryGetCurrentNetworkOnce();
            } else {
                throw ex;
            }
        }
    }

    private String tryGetCurrentNetworkOnce() {
        checkApiAndEnvReady();

        if (this.currentSelectedNetworkNameCache == null || this.currentSelectedNetworkNameCache.trim().isEmpty()) {
            logger.warn("SIMONE-Umgebung ist nicht initialisiert.");
            return null;
        }

        SimString currentNetworkInfo = new SimString();
        try {
            int status = this.simoneApi.simone_get_info(
                SimoneConst.SIMONE_CONFIGURED_NETWORK,
                currentNetworkInfo,
                SimoneConst.SIMONE_NO_FLAG
            );

            if (status == SimoneConst.simone_status_ok) {
                String name = currentNetworkInfo.getVal();
                logger.info("Aktuelles Netzwerk aus SIMONE gelesen: '{}'", name);
                this.currentSelectedNetworkNameCache = (name != null && !name.isEmpty()) ? name : null;
                return this.currentSelectedNetworkNameCache;
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                throw new RuntimeException("Fehler beim Abrufen des Netzwerks: " + errorMsg.getVal());
            }
        } catch (Throwable t) {
            logger.error("Fehler bei simone_get_info: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler beim Abrufen des aktuellen Netzwerks: " + t.getMessage(), t);
        }
    }

    /**
     * Hebt die Auswahl des aktuell gesetzten Netzwerks auf.
     *
     * @return Erfolgsnachricht.
     */
    public String deselectNetwork() {
        logger.info("Service: Aktuell ausgewähltes Netzwerk wird abgewählt.");
        checkApiAndEnvReady();

        try {
            int status = this.simoneApi.simone_deselect(SimoneConst.SIMONE_NO_FLAG);
            if (status == SimoneConst.simone_status_ok) {
                this.currentSelectedNetworkNameCache = null;
                logger.info("Netzwerk erfolgreich abgewählt.");
                return "Netzwerk wurde erfolgreich abgewählt.";
            } else {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                throw new RuntimeException("Fehler beim Abwählen des Netzwerks: " + errorMsg.getVal());
            }
        } catch (Throwable t) {
            logger.error("Fehler beim Abwählen des Netzwerks: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler beim Abwählen: " + t.getMessage(), t);
        }
    }

    /**
     * Hilfsmethode zur Umwandlung eines Objekt-Typs in einen lesbaren Namen.
     *
     * @param objectTypeCode SIMONE-Konstante für den Objekt-Typ.
     * @return Menschlich lesbarer Objekt-Typ als String.
     */
    private String getObjectTypeName(int objectTypeCode) {
        return switch (objectTypeCode) {
            // Corrected SIMONE_OBJTYPE_NODE to SIMONE_OBJTYPE_NO for generic node
            case SimoneConst.SIMONE_OBJTYPE_NO -> "Node";
            case SimoneConst.SIMONE_OBJTYPE_CS -> "Compressor Station";
            case SimoneConst.SIMONE_OBJTYPE_CV -> "Control Valve";
            case SimoneConst.SIMONE_OBJTYPE_PIPE -> "Pipe";
            case SimoneConst.SIMONE_OBJTYPE_RECP -> "Reciprocating Compressor";
            case SimoneConst.SIMONE_OBJTYPE_VA -> "Valve";
            case SimoneConst.SIMONE_OBJTYPE_SE -> "Special Element";
            case SimoneConst.SIMONE_OBJTYPE_RE -> "Regulator";
            case SimoneConst.SIMONE_OBJTYPE_NS -> "Network Station";
            case SimoneConst.SIMONE_OBJTYPE_SUB -> "Subsystem";
            case SimoneConst.SIMONE_OBJTYPE_SOURCE -> "Source/Sink";
            case SimoneConst.SIMONE_OBJTYPE_FUNCTION -> "Function";
            case SimoneConst.SIMONE_OBJTYPE_PROFILE -> "Profile";
            case SimoneConst.SIMONE_OBJTYPE_SYS -> "System";
            // SIMONE_OBJTYPE_ALL is for requesting, not usually a type of an object itself
            default -> "Unknown Type (" + objectTypeCode + ")";
        };
    }

    /**
     * Listet alle Netzwerkobjekte des aktuell ausgewählten Netzwerks, gefiltert nach Typ und Subsystem.
     *
     * @param requestedObjectType Objekttyp-Code (z. B. {@code SIMONE_OBJTYPE_NODE}); Standard: alle Objekte.
     * @param requestedSubsystemName Optionaler Subsystemname zur Filterung.
     * @return Liste von Netzwerkobjekten.
     */
    public List<NetworkObjectDto> listNetworkObjects(int requestedObjectType, String requestedSubsystemName) {
        logger.info("Service: listNetworkObjects aufgerufen. Angeforderter Objekt-Typ: {}, Subsystem: '{}'",
            requestedObjectType, requestedSubsystemName == null ? "ALLE" : requestedSubsystemName);

        checkApiReadyForNetworkOps();

        logger.info("Objekte werden für ausgewähltes Netzwerk '{}' geladen.", this.currentSelectedNetworkNameCache);

        List<NetworkObjectDto> objectList = new ArrayList<>();
        SimInt objIdOutput = new SimInt();
        SimString objNameOutput = new SimString();
        SimInt objectTypeOutput = new SimInt();
        SimString subsystemNameOutput = new SimString();

        String effectiveReqSubsystemName = (requestedSubsystemName != null && !requestedSubsystemName.trim().isEmpty())
                ? requestedSubsystemName.trim()
                : null;

        try {
            logger.debug("simone_get_first_object wird aufgerufen mit Typ: {}, Subsystem: '{}'",
                requestedObjectType, effectiveReqSubsystemName);

            int status = this.simoneApi.simone_get_first_object(
                requestedObjectType, effectiveReqSubsystemName,
                objIdOutput, objNameOutput, objectTypeOutput, subsystemNameOutput
            );
            logger.info("simone_get_first_object Rückgabewert: {}", status);

            if (status == SimoneConst.simone_status_not_found) {
                logger.info("Keine passenden Objekte gefunden für die angegebenen Kriterien.");
                return Collections.emptyList();
            } else if (status != SimoneConst.simone_status_ok) {
                SimString errorMsg = new SimString();
                this.simoneApi.simone_last_error(errorMsg);
                throw new RuntimeException("Fehler beim Start der Objektauflistung. SIMONE-Fehler: " + errorMsg.getVal());
            }

            // Erstes Objekt hinzufügen
            objectList.add(new NetworkObjectDto(
                objIdOutput.getVal(),
                objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : "N/A",
                objectTypeOutput.getVal(),
                getObjectTypeName(objectTypeOutput.getVal()),
                subsystemNameOutput.getVal() != null ? subsystemNameOutput.getVal().trim() : "N/A"
            ));

            // Weitere Objekte iterativ abfragen
            while (true) {
                status = this.simoneApi.simone_get_next_object(
                    objIdOutput, objNameOutput, objectTypeOutput, subsystemNameOutput
                );
                logger.debug("simone_get_next_object Status: {}", status);

                if (status == SimoneConst.simone_status_ok) {
                    objectList.add(new NetworkObjectDto(
                        objIdOutput.getVal(),
                        objNameOutput.getVal() != null ? objNameOutput.getVal().trim() : "N/A",
                        objectTypeOutput.getVal(),
                        getObjectTypeName(objectTypeOutput.getVal()),
                        subsystemNameOutput.getVal() != null ? subsystemNameOutput.getVal().trim() : "N/A"
                    ));
                } else if (status == SimoneConst.simone_status_not_found) {
                    break; // Ende der Liste erreicht
                } else {
                    SimString errorMsg = new SimString();
                    this.simoneApi.simone_last_error(errorMsg);
                    logger.error("Fehler beim Lesen des nächsten Objekts. Status: {}, SIMONE-Fehler: {}", status, errorMsg.getVal());
                    break;
                }
            }
        } catch (Throwable t) {
            logger.error("Unerwarteter Fehler bei der Objektauflistung: {}", t.getMessage(), t);
            throw new RuntimeException("Fehler bei der Objektauflistung: " + t.getMessage(), t);
        }

        logger.info("Objektauflistung abgeschlossen. Anzahl gefundener Objekte: {}", objectList.size());
        return objectList;
    }
}